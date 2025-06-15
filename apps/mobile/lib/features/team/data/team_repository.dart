// lib/features/team/data/team_repository.dart
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:kentnabiz_mobile/core/api/api_client.dart';
import 'package:kentnabiz_mobile/core/logger_service.dart';
import 'package:kentnabiz_mobile/features/team/models/team_report.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';

class TeamRepository {
  final ApiClient _apiClient;

  TeamRepository(this._apiClient);
  // Takımın atanmış raporlarını getir
  Future<List<TeamReport>> getMyTeamReports({
    ReportStatus? status,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      logger.d(
          'TeamRepository: Takım raporları getiriliyor... (status: $status, page: $page)');

      final Map<String, dynamic> queryParameters = {
        'page': page.toString(),
        'limit': limit.toString(),
      };

      if (status != null && status != ReportStatus.unknown) {
        queryParameters['status'] = _convertStatusToString(status);
      }

      final response = await _apiClient.dio.get(
        '/teams/my-team/reports',
        queryParameters: queryParameters,
      );

      // API yanıtındaki 'data' nesnesini doğrudan parse et
      final List<dynamic> reportListJson = response.data['data'];
      logger.d('TeamRepository: ${reportListJson.length} rapor getirildi');

      return reportListJson
          .map((json) => TeamReport.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (error) {
      logger.e('TeamRepository: Rapor getirme hatası: $error');
      rethrow;
    }
  }

  // Raporu kabul et (İşi üzerine al)
  Future<TeamReport> acceptAssignment(int reportId, {String? notes}) async {
    final response = await _apiClient.dio.post(
      '/teams/accept-assignment/$reportId',
      data: {
        if (notes != null) 'notes': notes,
      },
    );

    return TeamReport.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  // İş sürecini başlat
  Future<TeamReport> startWork(int reportId, {String? notes}) async {
    final response = await _apiClient.dio.post(
      '/teams/start-work/$reportId',
      data: {
        if (notes != null) 'notes': notes,
      },
    );

    return TeamReport.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  // İşi tamamla ve departman sorumlusuna gönder
  Future<TeamReport> completeWork(
    int reportId, {
    required String workNotes,
    List<File>? mediaFiles,
  }) async {
    final formData = FormData();

    // Çalışma notlarını ekle
    formData.fields.add(MapEntry('workNotes', workNotes));

    // Medya dosyalarını ekle
    if (mediaFiles != null && mediaFiles.isNotEmpty) {
      for (int i = 0; i < mediaFiles.length; i++) {
        final file = mediaFiles[i];
        final fileName = file.path.split('/').last;
        formData.files.add(MapEntry(
          'mediaFiles',
          await MultipartFile.fromFile(
            file.path,
            filename: fileName,
          ),
        ));
      }
    }

    final response = await _apiClient.dio.post(
      '/teams/complete-work/$reportId',
      data: formData,
    );

    return TeamReport.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  // İş sürecine medya yükle
  Future<List<WorkProgressMedia>> uploadWorkProgressMedia(
    int reportId,
    List<File> mediaFiles,
  ) async {
    final formData = FormData();

    for (int i = 0; i < mediaFiles.length; i++) {
      final file = mediaFiles[i];
      final fileName = file.path.split('/').last;
      formData.files.add(MapEntry(
        'files',
        await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        ),
      ));
    }

    final response = await _apiClient.dio.post(
      '/teams/upload-progress-media/$reportId',
      data: formData,
    );

    final List<dynamic> mediaListJson = response.data['data'];
    return mediaListJson
        .map((json) => WorkProgressMedia.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  // Rapor durumunu güncelle
  Future<TeamReport> updateReportStatus(
    int reportId,
    ReportStatus newStatus, {
    String? notes,
  }) async {
    final response = await _apiClient.dio.patch(
      '/teams/update-report-status/$reportId',
      data: {
        'status': _convertStatusToString(newStatus),
        if (notes != null) 'notes': notes,
      },
    );

    return TeamReport.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  // Mevcut kullanıcının takım bilgilerini getir
  Future<Map<String, dynamic>> getMyTeamInfo() async {
    final response = await _apiClient.dio.get('/teams/my-team');
    return response.data['data'] as Map<String, dynamic>;
  }

  // Takım üyelerini getir
  Future<List<Map<String, dynamic>>> getTeamMembers() async {
    final response = await _apiClient.dio.get('/teams/my-team/members');
    return (response.data['data'] as List).cast<Map<String, dynamic>>();
  }

  // İstatistikleri getir
  Future<Map<String, dynamic>> getTeamStats() async {
    try {
      logger.d('TeamRepository: Takım istatistikleri getiriliyor...');
      final response = await _apiClient.dio.get('/teams/my-team/stats');
      logger.d('TeamRepository: İstatistikler başarıyla getirildi');
      return response.data['data'] as Map<String, dynamic>;
    } catch (error) {
      logger.e('TeamRepository: İstatistik getirme hatası: $error');
      // API endpoint henüz hazır değilse mock data döndür
      return {
        'totalReports': 0,
        'assignedReports': 0,
        'inProgressReports': 0,
        'completedReports': 0,
        'pendingReports': 0,
      };
    }
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
