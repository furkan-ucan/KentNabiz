import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/constants/app_colors.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_widget.dart';
import '../models/team_report.dart';
import '../providers/team_providers.dart';
import '../widgets/team_report_card.dart';
import '../widgets/team_stats_widget.dart';
import '../widgets/team_filter_widget.dart';

class TeamLeaderDashboardScreen extends ConsumerStatefulWidget {
  const TeamLeaderDashboardScreen({super.key});

  @override
  ConsumerState<TeamLeaderDashboardScreen> createState() =>
      _TeamLeaderDashboardScreenState();
}

class _TeamLeaderDashboardScreenState
    extends ConsumerState<TeamLeaderDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final teamReportsAsync = ref.watch(teamReportsProvider);
    final teamStatsAsync = ref.watch(teamStatsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Takım Lideri Paneli'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(teamReportsProvider);
              ref.invalidate(teamStatsProvider);
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'Atanan Raporlar'),
            Tab(text: 'Devam Eden İşler'),
            Tab(text: 'Tamamlanan İşler'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Takım İstatistikleri
          teamStatsAsync.when(
            data: (stats) => TeamStatsWidget(stats: stats),
            loading: () => const SizedBox(
              height: 120,
              child: Center(child: LoadingIndicator()),
            ),
            error: (error, stack) => SizedBox(
              height: 120,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: Colors.grey[600],
                      size: 32,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'İstatistikler henüz hazır değil',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'API geliştirmesi devam ediyor',
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: 12,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Filtre
          const TeamFilterWidget(),

          // Rapor Listesi
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildReportsList(teamReportsAsync, AssignmentStatus.assigned),
                _buildReportsList(
                    teamReportsAsync, AssignmentStatus.inProgress),
                _buildReportsList(teamReportsAsync, AssignmentStatus.completed),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReportsList(
    AsyncValue<List<TeamReport>> teamReportsAsync,
    AssignmentStatus status,
  ) {
    return teamReportsAsync.when(
      data: (reports) {
        final filteredReports = reports
            .where((report) => report.assignmentStatus == status)
            .toList();

        if (filteredReports.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _getStatusIcon(status),
                  size: 64,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  _getEmptyMessage(status),
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(teamReportsProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: filteredReports.length,
            itemBuilder: (context, index) {
              final report = filteredReports[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: TeamReportCard(
                  report: report,
                  onTap: () => _navigateToReportDetail(report),
                ),
              );
            },
          ),
        );
      },
      loading: () => const Center(child: LoadingIndicator()),
      error: (error, stack) => Center(
        child: AppErrorWidget(
          message: 'Raporlar yüklenirken hata oluştu: $error',
          onRetry: () => ref.invalidate(teamReportsProvider),
        ),
      ),
    );
  }

  IconData _getStatusIcon(AssignmentStatus status) {
    switch (status) {
      case AssignmentStatus.assigned:
        return Icons.assignment;
      case AssignmentStatus.pending:
        return Icons.schedule;
      case AssignmentStatus.accepted:
        return Icons.thumb_up;
      case AssignmentStatus.inProgress:
        return Icons.work;
      case AssignmentStatus.completed:
        return Icons.check_circle;
      case AssignmentStatus.submitted:
        return Icons.send;
      case AssignmentStatus.rejected:
        return Icons.thumb_down;
      case AssignmentStatus.unknown:
        return Icons.help_outline;
    }
  }

  String _getEmptyMessage(AssignmentStatus status) {
    switch (status) {
      case AssignmentStatus.assigned:
        return 'Henüz size atanmış rapor bulunmuyor.';
      case AssignmentStatus.pending:
        return 'Bekleyen rapor bulunmuyor.';
      case AssignmentStatus.accepted:
        return 'Kabul edilmiş rapor bulunmuyor.';
      case AssignmentStatus.inProgress:
        return 'Şu anda devam eden iş bulunmuyor.';
      case AssignmentStatus.completed:
        return 'Henüz tamamlanan iş bulunmuyor.';
      case AssignmentStatus.submitted:
        return 'Gönderilmiş rapor bulunmuyor.';
      case AssignmentStatus.rejected:
        return 'Reddedilmiş rapor bulunmuyor.';
      case AssignmentStatus.unknown:
        return 'Bilinmeyen durumda rapor bulunmuyor.';
    }
  }

  void _navigateToReportDetail(TeamReport report) {
    ref.read(selectedTeamReportProvider.notifier).state = report;
    context.push('/team/report-detail/${report.id}');
  }
}
