import 'package:flutter/material.dart';
import '../models/team_report.dart';
import 'report_status_chip.dart';

class TeamReportCard extends StatelessWidget {
  final TeamReport report;
  final VoidCallback onTap;

  const TeamReportCard({
    super.key,
    required this.report,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
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
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 12),
                  ReportStatusChip(status: report.assignmentStatus),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                report.description ?? 'Açıklama bulunmuyor',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.location_on,
                    size: 16,
                    color: Colors.grey[500],
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      report.address ??
                          '${report.district}, ${report.neighborhood}',
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.schedule,
                    size: 16,
                    color: Colors.grey[500],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _getTimeText(),
                    style: TextStyle(
                      color: Colors.grey[500],
                      fontSize: 12,
                    ),
                  ),
                  const Spacer(),
                  if (report.workProgressMedia.isNotEmpty) ...[
                    Icon(
                      Icons.attach_file,
                      size: 16,
                      color: Colors.grey[500],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${report.workProgressMedia.length}',
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getTimeText() {
    final now = DateTime.now();
    final DateTime targetDate;
    switch (report.assignmentStatus) {
      case AssignmentStatus.assigned:
        targetDate = report.assignedAt ?? report.createdAt;
        break;
      case AssignmentStatus.pending:
        targetDate = report.createdAt;
        break;
      case AssignmentStatus.accepted:
        targetDate = report.acceptedAt ?? report.createdAt;
        break;
      case AssignmentStatus.inProgress:
        targetDate = report.startedAt ?? report.createdAt;
        break;
      case AssignmentStatus.completed:
        targetDate = report.completedAt ?? report.createdAt;
        break;
      case AssignmentStatus.submitted:
        targetDate = report.completedAt ?? report.createdAt;
        break;
      case AssignmentStatus.rejected:
        targetDate = report.createdAt;
        break;
      case AssignmentStatus.unknown:
        targetDate = report.createdAt;
        break;
    }

    final difference = now.difference(targetDate);

    if (difference.inDays > 0) {
      return '${difference.inDays} gün önce';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} saat önce';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} dakika önce';
    } else {
      return 'Şimdi';
    }
  }
}
