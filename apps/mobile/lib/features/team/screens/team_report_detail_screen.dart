import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/constants/app_colors.dart';
import '../../../shared/widgets/file_picker_widget.dart';
import '../models/team_report.dart';
import '../providers/team_providers.dart';
import '../widgets/report_status_chip.dart';
import '../widgets/work_progress_media_widget.dart';
import '../widgets/team_action_buttons.dart';

class TeamReportDetailScreen extends ConsumerWidget {
  final String reportId;

  const TeamReportDetailScreen({
    super.key,
    required this.reportId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedReport = ref.watch(selectedTeamReportProvider);
    final mediaUploadState = ref.watch(mediaUploadNotifierProvider);
    final teamActionState = ref.watch(teamActionNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rapor Detayı'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: selectedReport == null
          ? const Center(
              child: Text('Rapor bulunamadı'),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Rapor Başlığı ve Durumu
                  _buildReportHeader(selectedReport),
                  const SizedBox(height: 24),

                  // Rapor Bilgileri
                  _buildReportInfo(selectedReport),
                  const SizedBox(height: 24),

                  // Konum Bilgisi
                  _buildLocationInfo(selectedReport),
                  const SizedBox(height: 24),

                  // Atama Bilgileri
                  if (selectedReport.assignmentStatus !=
                      AssignmentStatus.assigned)
                    _buildAssignmentInfo(selectedReport),
                  if (selectedReport.assignmentStatus !=
                      AssignmentStatus.assigned)
                    const SizedBox(height: 24),

                  // İş İlerlemesi
                  if (selectedReport.assignmentStatus ==
                          AssignmentStatus.inProgress ||
                      selectedReport.assignmentStatus ==
                          AssignmentStatus.completed)
                    _buildWorkProgress(selectedReport, ref),
                  if (selectedReport.assignmentStatus ==
                          AssignmentStatus.inProgress ||
                      selectedReport.assignmentStatus ==
                          AssignmentStatus.completed)
                    const SizedBox(height: 24),

                  // Medya Yükleme (sadece iş devam ediyorsa)
                  if (selectedReport.assignmentStatus ==
                      AssignmentStatus.inProgress)
                    _buildMediaUpload(ref, mediaUploadState),
                  if (selectedReport.assignmentStatus ==
                      AssignmentStatus.inProgress)
                    const SizedBox(height: 24),

                  // Aksiyon Butonları
                  TeamActionButtons(
                    report: selectedReport,
                    isLoading: teamActionState.isLoading,
                    onAccept: () => _acceptAssignment(ref, selectedReport),
                    onStart: () => _startWork(ref, selectedReport),
                    onComplete: () => _completeWork(ref, selectedReport),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildReportHeader(TeamReport report) {
    return Card(
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
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                ReportStatusChip(status: report.assignmentStatus),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Rapor ID: ${report.id}',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReportInfo(TeamReport report) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Rapor Bilgileri',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            _buildInfoRow(
                'Açıklama', report.description ?? 'Açıklama bulunmuyor'),
            _buildInfoRow(
                'Kategori', report.category?.toString() ?? 'Belirtilmemiş'),
            if (report.reporterName != null)
              _buildInfoRow('Rapor Eden', report.reporterName!),
            _buildInfoRow(
              'Oluşturma Tarihi',
              _formatDate(report.createdAt),
            ),
            if (report.urgencyLevel != null)
              _buildInfoRow('Aciliyet', report.urgencyLevel!),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationInfo(TeamReport report) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Konum Bilgisi',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (report.address != null) _buildInfoRow('Adres', report.address!),
            if (report.district != null)
              _buildInfoRow('İlçe', report.district!),
            if (report.neighborhood != null)
              _buildInfoRow('Mahalle', report.neighborhood!),
            Row(
              children: [
                Expanded(
                  child: _buildInfoRow(
                    'Koordinatlar',
                    '${report.latitude.toStringAsFixed(6)}, ${report.longitude.toStringAsFixed(6)}',
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.map),
                  onPressed: () {
                    // Harita açma fonksiyonu
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAssignmentInfo(TeamReport report) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Atama Bilgileri',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (report.assignedAt != null)
              _buildInfoRow(
                'Atanma Tarihi',
                _formatDate(report.assignedAt!),
              ),
            if (report.acceptedAt != null)
              _buildInfoRow(
                'Kabul Tarihi',
                _formatDate(report.acceptedAt!),
              ),
            if (report.startedAt != null)
              _buildInfoRow(
                'Başlama Tarihi',
                _formatDate(report.startedAt!),
              ),
            if (report.completedAt != null)
              _buildInfoRow(
                'Tamamlanma Tarihi',
                _formatDate(report.completedAt!),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkProgress(TeamReport report, WidgetRef ref) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'İş İlerlemesi',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (report.workNotes != null)
              _buildInfoRow('İş Notları', report.workNotes!),
            if (report.workProgressMedia.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text(
                'Yüklenen Medya',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              ...report.workProgressMedia.map(
                (media) => WorkProgressMediaWidget(media: media),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMediaUpload(WidgetRef ref, AsyncValue<void> uploadState) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Medya Yükle',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            FilePickerWidget(
              onFilePicked: (file) => _uploadMedia(ref, file),
              isLoading: uploadState.isLoading,
              acceptedTypes: const ['image/*', 'video/*', 'application/pdf'],
            ),
            if (uploadState.hasError) ...[
              const SizedBox(height: 8),
              Text(
                'Yükleme hatası: ${uploadState.error}',
                style: const TextStyle(color: Colors.red),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey[700],
              ),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  void _acceptAssignment(WidgetRef ref, TeamReport report) {
    ref
        .read(teamActionNotifierProvider.notifier)
        .acceptAssignment(report.id.toString());
  }

  void _startWork(WidgetRef ref, TeamReport report) {
    ref
        .read(teamActionNotifierProvider.notifier)
        .startWork(report.id.toString());
  }

  void _completeWork(WidgetRef ref, TeamReport report) {
    _showCompleteWorkDialog(ref.context, ref, report);
  }

  void _showCompleteWorkDialog(
      BuildContext context, WidgetRef ref, TeamReport report) {
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('İşi Tamamla'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
                'İş tamamlandı olarak işaretlenecek ve departman sorumlusuna gönderilecek.'),
            const SizedBox(height: 16),
            TextField(
              controller: notesController,
              decoration: const InputDecoration(
                labelText: 'Tamamlama Notları (İsteğe bağlı)',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
              ref.read(teamActionNotifierProvider.notifier).completeWork(
                    report.id.toString(),
                    notes: notesController.text.isEmpty
                        ? null
                        : notesController.text,
                  );
            },
            child: const Text('Tamamla'),
          ),
        ],
      ),
    );
  }

  void _uploadMedia(WidgetRef ref, dynamic file) {
    final selectedReport = ref.read(selectedTeamReportProvider);
    if (selectedReport != null) {
      ref.read(mediaUploadNotifierProvider.notifier).uploadMedia(
            selectedReport.id.toString(),
            file,
          );
    }
  }
}
