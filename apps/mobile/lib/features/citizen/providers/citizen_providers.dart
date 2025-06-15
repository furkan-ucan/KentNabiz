import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kentnabiz_mobile/features/auth/providers/auth_providers.dart';
import 'package:kentnabiz_mobile/features/citizen/data/citizen_report_repository.dart';
import 'package:kentnabiz_mobile/services/location_service.dart';
import 'package:kentnabiz_mobile/shared/models/paginated_response.dart'; // Added import
import 'package:kentnabiz_mobile/shared/models/report.dart';
import 'package:kentnabiz_mobile/shared/models/report_category.dart';
import 'package:kentnabiz_mobile/shared/models/department.dart'; // Yeni import

final citizenReportRepositoryProvider = Provider((ref) {
  return CitizenReportRepository(ref.watch(apiClientProvider));
});

final myReportsProvider = FutureProvider.autoDispose
    .family<PaginatedResponse<Report>, ReportStatus?>((ref, status) {
  final repository = ref.watch(citizenReportRepositoryProvider);
  return repository.getMyReports(status: status);
});

final categoryTreeProvider =
    FutureProvider.autoDispose<List<ReportCategory>>((ref) {
  final repository = ref.watch(citizenReportRepositoryProvider);
  return repository.getCategoryTree();
});

final reportDetailProvider =
    FutureProvider.autoDispose.family<Report, int>((ref, reportId) {
  final repository = ref.watch(citizenReportRepositoryProvider);
  return repository.getReportById(reportId);
});

// YENİ PROVIDER: Tüm departmanları getirmek için
final departmentsProvider = FutureProvider.autoDispose<List<Department>>((ref) {
  return ref.watch(citizenReportRepositoryProvider).getDepartments();
});

// YENİ PROVIDER: Seçilen departmana göre kategorileri getirmek için
final categoriesByDepartmentProvider = FutureProvider.autoDispose
    .family<List<ReportCategory>, String>((ref, departmentCode) {
  return ref
      .watch(citizenReportRepositoryProvider)
      .getCategoriesByDepartment(departmentCode);
});

// YENİ PROVIDER: Yakındaki raporları getirmek için
class NearbyReportsParams {
  final double latitude;
  final double longitude;
  final double radiusKm;

  const NearbyReportsParams({
    required this.latitude,
    required this.longitude,
    this.radiusKm = 10.0, // Default radius 10km olarak artırıldı
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is NearbyReportsParams &&
          runtimeType == other.runtimeType &&
          latitude == other.latitude &&
          longitude == other.longitude &&
          radiusKm == other.radiusKm;

  @override
  int get hashCode =>
      latitude.hashCode ^ longitude.hashCode ^ radiusKm.hashCode;
}

final nearbyReportsProvider = FutureProvider.autoDispose
    .family<List<Report>, NearbyReportsParams>((ref, params) {
  final repository = ref.watch(citizenReportRepositoryProvider);
  return repository.getNearbyReports(
    latitude: params.latitude,
    longitude: params.longitude,
    radiusKm: params.radiusKm,
  );
});

// Kullanıcının mevcut konumunu tutmak için state provider
final userLocationProvider = StateProvider<NearbyReportsParams?>((ref) => null);

// Konum alma provider'ı
final getCurrentLocationProvider =
    FutureProvider.autoDispose<NearbyReportsParams>((ref) async {
  final position = await LocationService.getCurrentLocation();
  if (position == null) {
    throw Exception('Konum alınamadı');
  }

  final params = NearbyReportsParams(
    latitude: position.latitude,
    longitude: position.longitude,
  );

  // Alınan konumu state'e kaydet
  ref.read(userLocationProvider.notifier).state = params;

  return params;
});

// Kullanıcının yaptığı seçimleri tutmak için state provider'lar
final selectedDepartmentProvider = StateProvider<Department?>((ref) => null);
final selectedCategoryProvider = StateProvider<ReportCategory?>((ref) => null);
