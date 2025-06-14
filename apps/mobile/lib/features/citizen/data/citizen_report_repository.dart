// lib/features/citizen/data/citizen_report_repository.dart
import 'dart:io'; // For File

import 'package:dio/dio.dart'; // For FormData and MultipartFile
import 'package:kentnabiz_mobile/core/api/api_client.dart';
// import 'package:kentnabiz_mobile/features/citizen/report_creation/models/create_report_dto.dart'; // Artık kullanılmıyor
import 'package:kentnabiz_mobile/shared/models/department.dart';
import 'package:kentnabiz_mobile/shared/models/paginated_response.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';
import 'package:kentnabiz_mobile/shared/models/report_category.dart';
import 'package:kentnabiz_mobile/shared/models/report_media.dart'; // ReportMedia için

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

  // DÜZELTME: Parametre artık CreateReportDto değil, Map<String, dynamic>
  Future<Report> createReport(Map<String, dynamic> reportData) async {
    final response = await _apiClient.dio.post(
      '/reports',
      data: reportData, // Gelen map'i doğrudan gönder
    );
    // API yanıtındaki 'data' nesnesini doğrudan parse et
    return Report.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  // Bu metod, resimleri yükleyip tam Media nesnelerini döndürür
  Future<List<ReportMedia>> uploadImages(List<File> photos) async {
    if (photos.isEmpty) return [];
    final formData = FormData();
    for (var file in photos) {
      formData.files
          .add(MapEntry('files', await MultipartFile.fromFile(file.path)));
    }
    final response = await _apiClient.dio.post(
      '/media/upload/multiple?isPublic=false',
      data: formData,
    );
    // API yanıtındaki 'data' nesnesini doğrudan parse et
    // Assuming response.data is already the list of media objects
    final List<dynamic> mediaListJson = response.data['data'];
    return mediaListJson
        .map((json) => ReportMedia.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  // YENİ METOD: Yakındaki raporları getir
  Future<List<Report>> getNearbyReports({
    required double latitude,
    required double longitude,
    double radiusKm = 5.0,
  }) async {
    final response = await _apiClient.dio.get(
      '/reports/nearby',
      queryParameters: {
        'latitude': latitude.toString(),
        'longitude': longitude.toString(),
        'radius': (radiusKm * 1000).toString(), // API metre olarak bekliyorsa
      },
    );

    // API yanıtındaki 'data' nesnesini doğrudan parse et
    final List<dynamic> reportListJson = response.data['data'];

    return reportListJson
        .map((json) => Report.fromJson(json as Map<String, dynamic>))
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
