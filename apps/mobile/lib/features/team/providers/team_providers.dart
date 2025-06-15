// lib/features/team/providers/team_providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kentnabiz_mobile/core/logger_service.dart';
import 'package:kentnabiz_mobile/features/auth/providers/auth_providers.dart';
import 'package:kentnabiz_mobile/features/team/data/team_repository.dart';
import 'package:kentnabiz_mobile/features/team/models/team_report.dart';

// Team Repository Provider
final teamRepositoryProvider = Provider((ref) {
  return TeamRepository(ref.watch(apiClientProvider));
});

// Takım raporları provider'ı
final teamReportsProvider =
    FutureProvider.autoDispose<List<TeamReport>>((ref) async {
  final repository = ref.watch(teamRepositoryProvider);
  try {
    logger.d('TeamProviders: Takım raporları yükleniyor...');
    final reports = await repository.getMyTeamReports();
    logger.d('TeamProviders: ${reports.length} rapor yüklendi');
    return reports;
  } catch (error) {
    logger.e('TeamProviders: Rapor yükleme hatası: $error');
    rethrow;
  }
});

// Takım bilgileri provider'ı
final myTeamInfoProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final repository = ref.watch(teamRepositoryProvider);
  try {
    logger.d('TeamProviders: Takım bilgileri yükleniyor...');
    final info = await repository.getMyTeamInfo();
    logger.d('TeamProviders: Takım bilgileri yüklendi');
    return info;
  } catch (error) {
    logger.e('TeamProviders: Takım bilgileri yükleme hatası: $error');
    rethrow;
  }
});

// Takım üyeleri provider'ı
final teamMembersProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final repository = ref.watch(teamRepositoryProvider);
  try {
    logger.d('TeamProviders: Takım üyeleri yükleniyor...');
    final members = await repository.getTeamMembers();
    logger.d('TeamProviders: ${members.length} takım üyesi yüklendi');
    return members;
  } catch (error) {
    logger.e('TeamProviders: Takım üyeleri yükleme hatası: $error');
    rethrow;
  }
});

// Takım istatistikleri provider'ı
final teamStatsProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final repository = ref.watch(teamRepositoryProvider);
  try {
    logger.d('TeamProviders: Takım istatistikleri yükleniyor...');
    final stats = await repository.getTeamStats();
    logger.d('TeamProviders: Takım istatistikleri yüklendi: $stats');
    return stats;
  } catch (error) {
    logger.e('TeamProviders: Takım istatistikleri yükleme hatası: $error');
    // Stats endpoint henüz hazır değilse boş stats döndür
    return {
      'totalReports': 0,
      'assignedReports': 0,
      'inProgressReports': 0,
      'completedReports': 0,
      'pendingReports': 0,
    };
  }
});

// Seçili rapor state provider'ı
final selectedTeamReportProvider = StateProvider<TeamReport?>((ref) => null);

// Filtre state provider'ı
final teamReportFilterProvider = StateProvider<String?>((ref) => null);

// Takım aksiyonları provider'ı
class TeamActionNotifier extends StateNotifier<AsyncValue<void>> {
  final TeamRepository _repository;

  TeamActionNotifier(this._repository) : super(const AsyncValue.data(null));
  // Raporu kabul et
  Future<void> acceptAssignment(String reportId) async {
    logger.d('TeamActionNotifier: Rapor kabul ediliyor: $reportId');
    state = const AsyncValue.loading();
    try {
      await _repository.acceptAssignment(int.parse(reportId));
      logger.d('TeamActionNotifier: Rapor başarıyla kabul edildi: $reportId');
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      logger.e('TeamActionNotifier: Rapor kabul etme hatası: $error');
      state = AsyncValue.error(error, stackTrace);
    }
  }

  // İşi başlat
  Future<void> startWork(String reportId) async {
    logger.d('TeamActionNotifier: İş başlatılıyor: $reportId');
    state = const AsyncValue.loading();
    try {
      await _repository.startWork(int.parse(reportId));
      logger.d('TeamActionNotifier: İş başarıyla başlatıldı: $reportId');
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      logger.e('TeamActionNotifier: İş başlatma hatası: $error');
      state = AsyncValue.error(error, stackTrace);
    }
  }

  // İşi tamamla
  Future<void> completeWork(String reportId, {String? notes}) async {
    logger.d('TeamActionNotifier: İş tamamlanıyor: $reportId');
    state = const AsyncValue.loading();
    try {
      await _repository.completeWork(int.parse(reportId),
          workNotes: notes ?? '');
      logger.d('TeamActionNotifier: İş başarıyla tamamlandı: $reportId');
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      logger.e('TeamActionNotifier: İş tamamlama hatası: $error');
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final teamActionNotifierProvider =
    StateNotifierProvider<TeamActionNotifier, AsyncValue<void>>((ref) {
  final repository = ref.watch(teamRepositoryProvider);
  return TeamActionNotifier(repository);
});

// Medya yükleme provider'ı
class MediaUploadNotifier extends StateNotifier<AsyncValue<void>> {
  final TeamRepository _repository;

  MediaUploadNotifier(this._repository) : super(const AsyncValue.data(null));
  Future<void> uploadMedia(String reportId, dynamic file) async {
    logger.d('MediaUploadNotifier: Medya yükleniyor: $reportId');
    state = const AsyncValue.loading();
    try {
      await _repository.uploadWorkProgressMedia(int.parse(reportId), file);
      logger.d('MediaUploadNotifier: Medya başarıyla yüklendi: $reportId');
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      logger.e('MediaUploadNotifier: Medya yükleme hatası: $error');
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final mediaUploadNotifierProvider =
    StateNotifierProvider<MediaUploadNotifier, AsyncValue<void>>((ref) {
  final repository = ref.watch(teamRepositoryProvider);
  return MediaUploadNotifier(repository);
});
