// lib/features/citizen/report_creation/screens/step2_details_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:kentnabiz_mobile/features/citizen/report_creation/providers/create_report_provider.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';
import 'package:latlong2/latlong.dart';

class ReportDetailsScreen extends ConsumerStatefulWidget {
  const ReportDetailsScreen({super.key});
  @override
  ConsumerState<ReportDetailsScreen> createState() =>
      _ReportDetailsScreenState();
}

class _ReportDetailsScreenState extends ConsumerState<ReportDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _addressController = TextEditingController();

  // Harita üzerinde seçilen konumu tutacak state
  LatLng? _selectedLocation;
  final MapController _mapController = MapController();

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  void _onNext() {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    if (_selectedLocation == null) {
      // Kullanıcıya konum seçmesi için bir uyarı göster
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lütfen haritadan bir konum seçin.')),
      );
      return;
    }

    // State güncelleme
    ref.read(createReportProvider.notifier).updateDetails(
          title: _titleController.text,
          description: _descriptionController.text,
          address: _addressController.text,
          location: Location(
              latitude: _selectedLocation!.latitude,
              longitude: _selectedLocation!.longitude),
        );
    // Medya adımına git
    context.goNamed('createReportMedia');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Detay ve Konum',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            // Başlık alanı
            _buildInputCard(
              title: 'Başlık',
              child: TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  hintText: 'Sorunu kısaca özetleyin',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(8)),
                  ),
                ),
                validator: (value) => (value == null || value.isEmpty)
                    ? 'Başlık zorunludur.'
                    : null,
              ),
            ),
            const SizedBox(height: 16),

            // Açıklama alanı
            _buildInputCard(
              title: 'Açıklama',
              child: TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  hintText: 'Sorunu detaylı olarak açıklayın',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(8)),
                  ),
                ),
                validator: (value) => (value == null || value.isEmpty)
                    ? 'Açıklama alanı zorunludur.'
                    : null,
                maxLines: 4,
              ),
            ),
            const SizedBox(height: 16),

            // Adres alanı
            _buildInputCard(
              title: 'Açık Adres',
              child: TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(
                  hintText: 'Tam adres bilgisini yazın',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(8)),
                  ),
                ),
                validator: (value) => (value == null || value.isEmpty)
                    ? 'Adres alanı zorunludur.'
                    : null,
                maxLines: 2,
              ),
            ),
            const SizedBox(height: 16),

            // Harita alanı
            _buildInputCard(
              title: 'Konum Seçimi',
              subtitle: _selectedLocation != null
                  ? 'Konum seçildi'
                  : 'Haritadan konumu işaretleyin',
              child: Container(
                height: 300,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                clipBehavior: Clip.antiAlias,
                child: FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: const LatLng(37.0667, 37.3833), // Gaziantep
                    initialZoom: 13.0,
                    onTap: (tapPosition, point) {
                      setState(() {
                        _selectedLocation = point;
                      });
                    },
                  ),
                  children: [
                    TileLayer(
                        urlTemplate:
                            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
                    if (_selectedLocation != null)
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: _selectedLocation!,
                            width: 80,
                            height: 80,
                            child: const Icon(Icons.location_on,
                                color: Colors.red, size: 40),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Devam butonu
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _onNext,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.blue[600],
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Devam Et',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputCard({
    required String title,
    String? subtitle,
    required Widget child,
  }) {
    return Card(
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Text(
                  ' *',
                  style: TextStyle(color: Colors.red),
                ),
              ],
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}
