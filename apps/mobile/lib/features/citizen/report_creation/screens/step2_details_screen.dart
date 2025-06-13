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
      appBar: AppBar(title: const Text('Detay ve Konum')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                  labelText: 'Başlık*', border: OutlineInputBorder()),
              validator: (value) => (value == null || value.isEmpty)
                  ? 'Başlık zorunludur.'
                  : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                  labelText: 'Açıklama', border: OutlineInputBorder()),
              maxLines: 4,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(
                  labelText: 'Açık Adres', border: OutlineInputBorder()),
              maxLines: 2,
            ),
            const SizedBox(height: 24),
            Text('Konumu Seçin*',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            SizedBox(
              height: 300,
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
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _onNext,
              style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16)),
              child: const Text('Devam Et'),
            ),
          ],
        ),
      ),
    );
  }
}
