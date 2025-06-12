// lib/features/citizen/data/citizen_report_repository.dart
import 'package:kentnabiz_mobile/core/api/api_client.dart';
import 'package:kentnabiz_mobile/shared/models/paginated_response.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';
import 'package:kentnabiz_mobile/shared/models/report_category.dart';
import 'package:kentnabiz_mobile/shared/models/department.dart'; // Yeni import

class CitizenReportRepository {
  final ApiClient _apiClient;
  CitizenReportRepository(this._apiClient);

  Future<PaginatedResponse<Report>> getMyReports(
      {ReportStatus? status, int page = 1}) async {
    final Map<String, dynamic> queryParameters = {
      'page': page.toString()
    }; // page'i string'e çevir
    if (status != null && status != ReportStatus.unknown) {
      queryParameters['status'] = _convertStatusToString(status);
    }

    final response = await _apiClient.dio.get(
      '/reports/my-reports',
      queryParameters: queryParameters,
    );

    // Düzeltme: fromJson'a ikinci parametre olarak Report.fromJson'ı veriyoruz.
    return PaginatedResponse.fromJson(
      response.data,
      (json) => Report.fromJson(json as Map<String, dynamic>),
    );
  }

  Future<Report> getReportById(int reportId) async {
    final response = await _apiClient.dio.get('/reports/$reportId');
    // API yanıtındaki 'data' nesnesini doğrudan parse et
    return Report.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<List<ReportCategory>> getCategoryTree() async {
    final response = await _apiClient.dio.get('/report-categories/tree');

    // DÜZELTME: Gelen nesnenin içindeki 'data' anahtarını alıyoruz.
    final List<dynamic> categoryListJson = response.data['data'];

    return categoryListJson
        .map((json) => ReportCategory.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  // YENİ METOD: Departmanları getir
  Future<List<Department>> getDepartments() async {
    final response = await _apiClient.dio.get('/reports/departments');

    // DÜZELTME: Gelen nesnenin içindeki 'data' anahtarını alıyoruz.
    final List<dynamic> departmentListJson = response.data['data'];

    return departmentListJson
        .map((json) => Department.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  // YENİ METOD: Departmana göre kategorileri getir
  Future<List<ReportCategory>> getCategoriesByDepartment(
      String departmentCode) async {
    final response = await _apiClient.dio.get(
      '/report-categories',
      queryParameters: {'departmentCode': departmentCode},
    );

    // DÜZELTME: Gelen nesnenin içindeki 'data' anahtarını alıyoruz.
    final List<dynamic> categoryListJson = response.data['data'];

    return categoryListJson
        .map((json) => ReportCategory.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  String _convertStatusToString(ReportStatus status) {
    switch (status) {
      case ReportStatus.open:
        return 'OPEN';
      case ReportStatus.inReview:
        return 'IN_REVIEW';
      case ReportStatus.inProgress:
        return 'IN_PROGRESS';
      case ReportStatus.done:
        return 'DONE';
      case ReportStatus.rejected:
        return 'REJECTED';
      case ReportStatus.cancelled:
        return 'CANCELLED';
      default:
        return '';
    }
  }
}
