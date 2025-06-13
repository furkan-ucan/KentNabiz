// lib/features/citizen/report_creation/screens/step4_preview_screen.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:kentnabiz_mobile/features/citizen/report_creation/providers/create_report_provider.dart';
import 'package:latlong2/latlong.dart';

class PreviewReportScreen extends ConsumerStatefulWidget {
  const PreviewReportScreen({super.key});
  @override
  ConsumerState<PreviewReportScreen> createState() =>
      _PreviewReportScreenState();
}

class _PreviewReportScreenState extends ConsumerState<PreviewReportScreen> {
  bool _isSubmitting = false;

  Future<void> _submitReport() async {
    setState(() => _isSubmitting = true);

    final success =
        await ref.read(createReportProvider.notifier).submitReport();

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Raporunuz başarıyla oluşturuldu!'),
            backgroundColor: Colors.green),
      );
      // Başarılı olunca kullanıcıyı ana panele geri gönder ve tüm rapor akışını kapat.
      context.go('/citizen/dashboard');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(
                'Rapor gönderilirken bir hata oluştu: ${ref.read(createReportProvider).error}')),
      );
    }

    setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    final reportState = ref.watch(createReportProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Raporu Önizle ve Gönder')),
      body: ListView(
        // SingleChildScrollView yerine ListView daha iyi performans gösterebilir
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildInfoTile(
              context, 'Departman', reportState.selectedDepartment?.name),
          _buildInfoTile(
              context, 'Kategori', reportState.selectedCategory?.name),
          const Divider(height: 24),
          _buildInfoTile(context, 'Başlık', reportState.title),
          _buildInfoTile(context, 'Açıklama', reportState.description),
          _buildInfoTile(context, 'Adres', reportState.address),
          const Divider(height: 24),
          if (reportState.location != null) ...[
            Text('Seçilen Konum',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            SizedBox(
              height: 200,
              child: FlutterMap(
                options: MapOptions(
                  initialCenter: LatLng(reportState.location!.latitude,
                      reportState.location!.longitude),
                  initialZoom: 16.0,
                ),
                children: [
                  TileLayer(
                      urlTemplate:
                          'https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
                  MarkerLayer(markers: [
                    Marker(
                      point: LatLng(reportState.location!.latitude,
                          reportState.location!.longitude),
                      width: 80,
                      height: 80,
                      child: const Icon(Icons.location_on,
                          color: Colors.red, size: 40),
                    ),
                  ]),
                ],
              ),
            ),
            const Divider(height: 24),
          ],
          if (reportState.photos.isNotEmpty) ...[
            Text('Eklenen Görseller (${reportState.photos.length} adet)',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            SizedBox(
              height: 100,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: reportState.photos.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.file(reportState.photos[index],
                        width: 100, height: 100, fit: BoxFit.cover),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
          ],
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ElevatedButton.icon(
          icon: const Icon(Icons.send),
          onPressed: _isSubmitting ? null : _submitReport,
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).primaryColor,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 50),
          ),
          label: _isSubmitting
              ? const CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2,
                )
              : const Text('Onayla ve Gönder'),
        ),
      ),
    );
  }

  Widget _buildInfoTile(BuildContext context, String label, String? value) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(),
              style: Theme.of(context)
                  .textTheme
                  .labelMedium
                  ?.copyWith(color: Colors.grey.shade600)),
          const SizedBox(height: 4),
          Text(value, style: Theme.of(context).textTheme.bodyLarge),
        ],
      ),
    );
  }
}
