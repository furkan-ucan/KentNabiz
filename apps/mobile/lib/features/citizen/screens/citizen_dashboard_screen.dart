// lib/features/citizen/screens/citizen_dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart'; // Added for context.goNamed
import 'package:kentnabiz_mobile/features/auth/providers/auth_providers.dart'; // DÜZELTME: Bu import satırı kritik
import 'package:kentnabiz_mobile/features/citizen/providers/citizen_providers.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';
import 'package:latlong2/latlong.dart'; // flutter_map'in kullandığı enlem/boylam paketi

class CitizenDashboardScreen extends ConsumerStatefulWidget {
  const CitizenDashboardScreen({super.key});

  @override
  ConsumerState<CitizenDashboardScreen> createState() =>
      _CitizenDashboardScreenState();
}

class _CitizenDashboardScreenState
    extends ConsumerState<CitizenDashboardScreen> {
  final MapController _mapController = MapController();
  bool _isLoadingLocation = false;
  double _currentRadius = 10.0; // Başlangıç yarıçapı 10km

  @override
  void initState() {
    super.initState();
    // Sayfa yüklendiğinde konum almaya çalış
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadUserLocation();
    });
  }

  Future<void> _loadUserLocation() async {
    setState(() {
      _isLoadingLocation = true;
    });

    try {
      // Konum al
      await ref.read(getCurrentLocationProvider.future);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Konum alınamadı: $e'),
            backgroundColor: Colors.red,
            action: SnackBarAction(
              label: 'Tekrar Dene',
              onPressed: _loadUserLocation,
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingLocation = false;
        });
      }
    }
  }

  void _searchWithLargerRadius() {
    final userLocation = ref.read(userLocationProvider);
    if (userLocation != null && _currentRadius < 50.0) {
      setState(() {
        // Yarıçapı artır (max 50km'ye kadar)
        _currentRadius = (_currentRadius * 1.5).clamp(10.0, 50.0);
      });
    }
  }

  void _centerMapOnUserLocation() {
    final userLocation = ref.read(userLocationProvider);
    if (userLocation != null) {
      _mapController.move(
          LatLng(userLocation.latitude, userLocation.longitude), 15.0);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userLocation = ref.watch(userLocationProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('KentNabız - Yakınımdakiler'),
            Text(
              'Arama Yarıçapı: ${_currentRadius.toInt()}km',
              style:
                  const TextStyle(fontSize: 12, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        actions: [
          if (_isLoadingLocation)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.list),
            tooltip: 'Liste Görünümü',
            onPressed: () {
              context.goNamed('nearbyReportsList');
            },
          ),
          IconButton(
            icon: const Icon(Icons.my_location),
            tooltip: 'Konumuma Git',
            onPressed: userLocation != null
                ? _centerMapOnUserLocation
                : _loadUserLocation,
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Yenile',
            onPressed: _loadUserLocation,
          ),
          // DÜZELTME: Butonu Consumer içine alıp doğru provider'ı çağır
          Consumer(
            builder: (context, ref, child) {
              return IconButton(
                icon: const Icon(Icons.logout),
                tooltip: 'Çıkış Yap',
                onPressed: () {
                  ref.read(authControllerProvider).logout();
                },
              );
            },
          ),
        ],
      ),
      body: _buildMapView(userLocation),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Yeni rapor oluşturma sayfasına git
          context.goNamed('createReport');
        },
        label: const Text('Sorun Bildir'),
        icon: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildMapView(NearbyReportsParams? userLocation) {
    // Eğer konum yoksa default Gaziantep merkez göster
    final initialCenter = userLocation != null
        ? LatLng(userLocation.latitude, userLocation.longitude)
        : const LatLng(37.0667, 37.3833); // Gaziantep merkez

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: initialCenter,
        initialZoom: userLocation != null ? 15.0 : 13.0,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.kentnabiz.kentnabiz_mobile',
        ),
        if (userLocation != null) ...[
          // Kullanıcı konumu marker'ı
          MarkerLayer(
            markers: [
              Marker(
                point: LatLng(userLocation.latitude, userLocation.longitude),
                child: const Icon(
                  Icons.my_location,
                  color: Colors.blue,
                  size: 30,
                ),
              ),
            ],
          ),
          // Yakındaki raporlar
          _buildNearbyReportsLayer(userLocation),
        ],
      ],
    );
  }

  Widget _buildNearbyReportsLayer(NearbyReportsParams userLocation) {
    // Current radius ile yeni parametreler oluştur
    final searchParams = NearbyReportsParams(
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radiusKm: _currentRadius,
    );

    final nearbyReportsAsync = ref.watch(nearbyReportsProvider(searchParams));

    return nearbyReportsAsync.when(
      data: (reports) {
        if (reports.isEmpty) {
          // Boş rapor durumunda kullanıcıya bilgi ver
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted && _currentRadius <= 10.0) {
              // Sadece ilk aramalarda bilgi ver
              ScaffoldMessenger.of(context)
                  .hideCurrentSnackBar(); // Önceki mesajları temizle
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                      '${_currentRadius.toInt()}km yarıçapında rapor bulunamadı'),
                  backgroundColor: Colors.blue,
                  duration: const Duration(seconds: 2),
                  action: SnackBarAction(
                    label: 'Genişlet',
                    onPressed: _searchWithLargerRadius,
                  ),
                ),
              );
            }
          });
          return const SizedBox.shrink();
        }

        return MarkerLayer(
          markers: reports
              .map((report) {
                if (report.location == null) {
                  return null;
                }

                return Marker(
                  point: LatLng(
                      report.location!.latitude, report.location!.longitude),
                  child: GestureDetector(
                    onTap: () {
                      _showReportDetails(report);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: _getReportColor(
                            report.status ?? ReportStatus.unknown),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      child: const Icon(
                        Icons.warning,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                );
              })
              .where((marker) => marker != null)
              .cast<Marker>()
              .toList(),
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (error, stack) {
        // Hata durumunda kullanıcıya göster
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Yakındaki raporlar yüklenemedi: $error'),
                backgroundColor: Colors.orange,
                action: SnackBarAction(
                  label: 'Tekrar Dene',
                  onPressed: _loadUserLocation,
                ),
              ),
            );
          }
        });
        return const SizedBox.shrink();
      },
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

  void _showReportDetails(Report report) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.4,
        maxChildSize: 0.8,
        minChildSize: 0.3,
        expand: false,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
          ),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  children: [
                    Text(
                      report.title,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Durum: ${_getStatusText(report.status ?? ReportStatus.unknown)}',
                      style: TextStyle(
                        color: _getReportColor(
                            report.status ?? ReportStatus.unknown),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Kategori: ${report.category?.name ?? 'Bilinmiyor'}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      report.description ?? 'Açıklama yok',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 16),
                    if (report.reportMedias.isNotEmpty)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          report.reportMedias.first.url,
                          height: 200,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              Container(
                            height: 200,
                            color: Colors.grey[200],
                            child: const Icon(Icons.error),
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        context.goNamed('reportDetail',
                            pathParameters: {'id': report.id.toString()});
                      },
                      child: const Text('Detayları Gör'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
