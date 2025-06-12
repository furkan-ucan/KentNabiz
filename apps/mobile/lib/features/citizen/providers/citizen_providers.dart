import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kentnabiz_mobile/features/auth/providers/auth_providers.dart';
import 'package:kentnabiz_mobile/features/citizen/data/citizen_report_repository.dart';
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

// Kullanıcının yaptığı seçimleri tutmak için state provider'lar
final selectedDepartmentProvider = StateProvider<Department?>((ref) => null);
final selectedCategoryProvider = StateProvider<ReportCategory?>((ref) => null);
