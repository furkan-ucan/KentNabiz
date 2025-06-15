// lib/features/citizen/screens/nearby_reports_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:kentnabiz_mobile/features/citizen/providers/citizen_providers.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';

class NearbyReportsListScreen extends ConsumerStatefulWidget {
  const NearbyReportsListScreen({super.key});

  @override
  ConsumerState<NearbyReportsListScreen> createState() =>
      _NearbyReportsListScreenState();
}

class _NearbyReportsListScreenState
    extends ConsumerState<NearbyReportsListScreen> {
  double _currentRadius = 10.0;

  @override
  Widget build(BuildContext context) {
    final userLocation = ref.watch(userLocationProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Yakındaki Raporlar'),
            Text(
              'Arama Yarıçapı: ${_currentRadius.toInt()}km',
              style:
                  const TextStyle(fontSize: 12, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Yenile',
            onPressed: () {
              if (userLocation != null) {
                ref.invalidate(nearbyReportsProvider(NearbyReportsParams(
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  radiusKm: _currentRadius,
                )));
              }
            },
          ),
          PopupMenuButton<double>(
            icon: const Icon(Icons.tune),
            tooltip: 'Arama Yarıçapını Değiştir',
            onSelected: (radius) {
              setState(() {
                _currentRadius = radius;
              });
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 5.0, child: Text('5 km')),
              const PopupMenuItem(value: 10.0, child: Text('10 km')),
              const PopupMenuItem(value: 20.0, child: Text('20 km')),
              const PopupMenuItem(value: 50.0, child: Text('50 km')),
            ],
          ),
        ],
      ),
      body: userLocation == null
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.location_off, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(
                    'Konum bilgisi alınamadı',
                    style: TextStyle(fontSize: 18, color: Colors.grey),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Lütfen konum iznini verin ve tekrar deneyin',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            )
          : _buildReportsList(userLocation),
    );
  }

  Widget _buildReportsList(NearbyReportsParams userLocation) {
    final searchParams = NearbyReportsParams(
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radiusKm: _currentRadius,
    );

    final nearbyReportsAsync = ref.watch(nearbyReportsProvider(searchParams));

    return nearbyReportsAsync.when(
      data: (reports) {
        if (reports.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.search_off, size: 64, color: Colors.grey),
                const SizedBox(height: 16),
                Text(
                  '${_currentRadius.toInt()}km yarıçapında rapor bulunamadı',
                  style: const TextStyle(fontSize: 18, color: Colors.grey),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Arama yarıçapını artırın veya ilk raporu siz oluşturun',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    if (_currentRadius < 50.0) {
                      setState(() {
                        _currentRadius =
                            (_currentRadius * 1.5).clamp(10.0, 50.0);
                      });
                    }
                  },
                  icon: const Icon(Icons.zoom_out_map),
                  label: const Text('Arama Alanını Genişlet'),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {
                    context.goNamed('createReport');
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('İlk Raporu Oluştur'),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(nearbyReportsProvider(searchParams));
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: reports.length,
            itemBuilder: (context, index) {
              final report = reports[index];
              return _buildReportCard(report);
            },
          ),
        );
      },
      loading: () => const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Yakındaki raporlar aranıyor...'),
          ],
        ),
      ),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Hata oluştu: $error',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                ref.invalidate(nearbyReportsProvider(searchParams));
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Tekrar Dene'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReportCard(Report report) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          context.goNamed('reportDetail',
              pathParameters: {'id': report.id.toString()});
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      report.title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getReportColor(
                          report.status ?? ReportStatus.unknown),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      _getStatusText(report.status ?? ReportStatus.unknown),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (report.category != null)
                Text(
                  'Kategori: ${report.category!.name}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                ),
              const SizedBox(height: 8),
              Text(
                report.description ?? 'Açıklama yok',
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              if (report.reportMedias.isNotEmpty) ...[
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    report.reportMedias.first.url,
                    height: 120,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 120,
                      color: Colors.grey[200],
                      child: const Icon(Icons.error, color: Colors.grey),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      '${report.location?.latitude.toStringAsFixed(4)}, ${report.location?.longitude.toStringAsFixed(4)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      context.goNamed('reportDetail',
                          pathParameters: {'id': report.id.toString()});
                    },
                    icon: const Icon(Icons.arrow_forward, size: 16),
                    label: const Text('Detay'),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getReportColor(ReportStatus status) {
    switch (status) {
      case ReportStatus.open:
        return Colors.orange;
      case ReportStatus.inReview:
        return Colors.blue;
      case ReportStatus.inProgress:
        return Colors.blue;
      case ReportStatus.done:
        return Colors.green;
      case ReportStatus.rejected:
        return Colors.red;
      case ReportStatus.cancelled:
        return Colors.grey;
      case ReportStatus.unknown:
        return Colors.grey;
    }
  }

  String _getStatusText(ReportStatus status) {
    switch (status) {
      case ReportStatus.open:
        return 'Açık';
      case ReportStatus.inReview:
        return 'İnceleniyor';
      case ReportStatus.inProgress:
        return 'İşlemde';
      case ReportStatus.done:
        return 'Tamamlandı';
      case ReportStatus.rejected:
        return 'Reddedildi';
      case ReportStatus.cancelled:
        return 'İptal Edildi';
      case ReportStatus.unknown:
        return 'Bilinmiyor';
    }
  }
}
