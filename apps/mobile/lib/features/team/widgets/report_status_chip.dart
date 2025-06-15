import 'package:flutter/material.dart';
import '../models/team_report.dart';

class ReportStatusChip extends StatelessWidget {
  final AssignmentStatus status;

  const ReportStatusChip({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(
        _getStatusText(status),
        style: TextStyle(
          color: _getStatusColor(status),
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
      backgroundColor: _getStatusColor(status).withValues(alpha: 0.1),
      side: BorderSide(
        color: _getStatusColor(status).withValues(alpha: 0.3),
        width: 1,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  String _getStatusText(AssignmentStatus status) {
    switch (status) {
      case AssignmentStatus.assigned:
        return 'Atandı';
      case AssignmentStatus.pending:
        return 'Beklemede';
      case AssignmentStatus.accepted:
        return 'Kabul Edildi';
      case AssignmentStatus.inProgress:
        return 'Devam Ediyor';
      case AssignmentStatus.completed:
        return 'Tamamlandı';
      case AssignmentStatus.submitted:
        return 'Gönderildi';
      case AssignmentStatus.rejected:
        return 'Reddedildi';
      case AssignmentStatus.unknown:
        return 'Bilinmiyor';
    }
  }

  Color _getStatusColor(AssignmentStatus status) {
    switch (status) {
      case AssignmentStatus.assigned:
        return Colors.blue;
      case AssignmentStatus.pending:
        return Colors.grey;
      case AssignmentStatus.accepted:
        return Colors.green;
      case AssignmentStatus.inProgress:
        return Colors.orange;
      case AssignmentStatus.completed:
        return Colors.purple;
      case AssignmentStatus.submitted:
        return Colors.teal;
      case AssignmentStatus.rejected:
        return Colors.red;
      case AssignmentStatus.unknown:
        return Colors.grey;
    }
  }
}
