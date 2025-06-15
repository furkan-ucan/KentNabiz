// lib/features/team/models/team_report.dart
import 'package:kentnabiz_mobile/shared/models/report.dart';
import 'package:kentnabiz_mobile/shared/models/report_category.dart';
import 'package:kentnabiz_mobile/shared/models/report_media.dart';
import 'package:kentnabiz_mobile/shared/models/user.dart';

// Atanma durumu enum'u
enum AssignmentStatus {
  assigned,
  pending,
  accepted,
  inProgress,
  completed,
  submitted,
  rejected,
  unknown,
}

extension AssignmentStatusX on AssignmentStatus {
  String get toTurkish {
    switch (this) {
      case AssignmentStatus.assigned:
        return 'Atandı';
      case AssignmentStatus.pending:
        return 'Beklemede';
      case AssignmentStatus.accepted:
        return 'Kabul Edildi';
      case AssignmentStatus.inProgress:
        return 'İşlemde';
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
}

// İş süreç medyası
class WorkProgressMedia {
  final int id;
  final String url;
  final String type; // image, video, document
  final String filename;
  final String? description;
  final DateTime createdAt;
  final DateTime uploadedAt;

  const WorkProgressMedia({
    required this.id,
    required this.url,
    required this.type,
    required this.filename,
    this.description,
    required this.createdAt,
    required this.uploadedAt,
  });

  factory WorkProgressMedia.fromJson(Map<String, dynamic> json) {
    return WorkProgressMedia(
      id: json['id'],
      url: json['url'],
      type: json['type'],
      filename: json['filename'] ?? 'unknown',
      description: json['description'],
      createdAt: DateTime.parse(json['createdAt']),
      uploadedAt: DateTime.parse(json['uploadedAt'] ?? json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'url': url,
      'type': type,
      'filename': filename,
      'description': description,
      'createdAt': createdAt.toIso8601String(),
      'uploadedAt': uploadedAt.toIso8601String(),
    };
  }
}

// Takım raporu modeli
class TeamReport {
  final int id;
  final String title;
  final String? description;
  final ReportStatus? status;
  final ReportType? reportType;
  final DateTime createdAt;
  final String? address;
  final Location? location;
  final int? supportCount;
  final User? user;
  final ReportCategory? category;
  final List<ReportMedia> reportMedias;

  // Ek bilgiler
  final String? priority;
  final String? urgencyLevel;
  final String? reporterName;
  final String? district;
  final String? neighborhood;
  final double latitude;
  final double longitude;

  // Takım lideri için ek alanlar
  final AssignmentStatus assignmentStatus;
  final DateTime? assignmentDate;
  final DateTime? assignedAt;
  final DateTime? acceptedAt;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final int? assignedTeamId;
  final String? assignedTeamName;
  final List<WorkProgressMedia> workProgressMedia;
  final String? workNotes;
  final DateTime? workStartedAt;
  final DateTime? workCompletedAt;

  const TeamReport({
    required this.id,
    required this.title,
    this.description,
    this.status,
    this.reportType,
    required this.createdAt,
    this.address,
    this.location,
    this.supportCount,
    this.user,
    this.category,
    this.reportMedias = const [],
    this.priority,
    this.urgencyLevel,
    this.reporterName,
    this.district,
    this.neighborhood,
    this.latitude = 0.0,
    this.longitude = 0.0,
    this.assignmentStatus = AssignmentStatus.unknown,
    this.assignmentDate,
    this.assignedAt,
    this.acceptedAt,
    this.startedAt,
    this.completedAt,
    this.assignedTeamId,
    this.assignedTeamName,
    this.workProgressMedia = const [],
    this.workNotes,
    this.workStartedAt,
    this.workCompletedAt,
  });

  factory TeamReport.fromJson(Map<String, dynamic> json) {
    return TeamReport(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      status: json['status'] != null
          ? ReportStatus.values.firstWhere(
              (e) =>
                  e.name.toUpperCase() ==
                  json['status'].toString().toUpperCase(),
              orElse: () => ReportStatus.unknown,
            )
          : null,
      reportType: json['reportType'] != null
          ? ReportType.values.firstWhere(
              (e) =>
                  e.name.toUpperCase() ==
                  json['reportType'].toString().toUpperCase(),
              orElse: () => ReportType.other,
            )
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      address: json['address'],
      location:
          json['location'] != null ? Location.fromJson(json['location']) : null,
      supportCount: json['supportCount'],
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      category: json['category'],
      reportMedias: json['reportMedias'] != null
          ? (json['reportMedias'] as List)
              .map((media) => ReportMedia.fromJson(media))
              .toList()
          : [],
      priority: json['priority'],
      urgencyLevel: json['urgencyLevel'],
      reporterName: json['reporterName'],
      district: json['district'],
      neighborhood: json['neighborhood'],
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      assignmentStatus: json['assignmentStatus'] != null
          ? AssignmentStatus.values.firstWhere(
              (e) =>
                  e.name.toUpperCase() ==
                  json['assignmentStatus'].toString().toUpperCase(),
              orElse: () => AssignmentStatus.unknown,
            )
          : AssignmentStatus.unknown,
      assignmentDate: json['assignmentDate'] != null
          ? DateTime.parse(json['assignmentDate'])
          : null,
      assignedAt: json['assignedAt'] != null
          ? DateTime.parse(json['assignedAt'])
          : null,
      acceptedAt: json['acceptedAt'] != null
          ? DateTime.parse(json['acceptedAt'])
          : null,
      startedAt:
          json['startedAt'] != null ? DateTime.parse(json['startedAt']) : null,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
      assignedTeamId: json['assignedTeamId'],
      assignedTeamName: json['assignedTeamName'],
      workProgressMedia: json['workProgressMedia'] != null
          ? (json['workProgressMedia'] as List)
              .map((media) => WorkProgressMedia.fromJson(media))
              .toList()
          : [],
      workNotes: json['workNotes'],
      workStartedAt: json['workStartedAt'] != null
          ? DateTime.parse(json['workStartedAt'])
          : null,
      workCompletedAt: json['workCompletedAt'] != null
          ? DateTime.parse(json['workCompletedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'status': status?.name.toUpperCase(),
      'reportType': reportType?.name.toUpperCase(),
      'createdAt': createdAt.toIso8601String(),
      'address': address,
      'location': location?.toJson(),
      'supportCount': supportCount,
      'user': user?.toJson(),
      'category': category,
      'reportMedias': reportMedias.map((media) => media.toJson()).toList(),
      'priority': priority,
      'urgencyLevel': urgencyLevel,
      'reporterName': reporterName,
      'district': district,
      'neighborhood': neighborhood,
      'latitude': latitude,
      'longitude': longitude,
      'assignmentStatus': assignmentStatus.name.toUpperCase(),
      'assignmentDate': assignmentDate?.toIso8601String(),
      'assignedAt': assignedAt?.toIso8601String(),
      'acceptedAt': acceptedAt?.toIso8601String(),
      'startedAt': startedAt?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'assignedTeamId': assignedTeamId,
      'assignedTeamName': assignedTeamName,
      'workProgressMedia':
          workProgressMedia.map((media) => media.toJson()).toList(),
      'workNotes': workNotes,
      'workStartedAt': workStartedAt?.toIso8601String(),
      'workCompletedAt': workCompletedAt?.toIso8601String(),
    };
  }

  static TeamReport fromReport(Report report) {
    return TeamReport(
      id: report.id,
      title: report.title,
      description: report.description,
      status: report.status,
      reportType: report.reportType,
      createdAt: report.createdAt,
      address: report.address,
      location: report.location,
      supportCount: report.supportCount,
      user: report.user,
      category: report.category,
      reportMedias: report.reportMedias,
      latitude: report.location?.latitude ?? 0.0,
      longitude: report.location?.longitude ?? 0.0,
    );
  }

  TeamReport copyWith({
    int? id,
    String? title,
    String? description,
    ReportStatus? status,
    ReportType? reportType,
    DateTime? createdAt,
    String? address,
    Location? location,
    int? supportCount,
    User? user,
    ReportCategory? category,
    List<ReportMedia>? reportMedias,
    String? priority,
    String? urgencyLevel,
    String? reporterName,
    String? district,
    String? neighborhood,
    double? latitude,
    double? longitude,
    AssignmentStatus? assignmentStatus,
    DateTime? assignmentDate,
    DateTime? assignedAt,
    DateTime? acceptedAt,
    DateTime? startedAt,
    DateTime? completedAt,
    int? assignedTeamId,
    String? assignedTeamName,
    List<WorkProgressMedia>? workProgressMedia,
    String? workNotes,
    DateTime? workStartedAt,
    DateTime? workCompletedAt,
  }) {
    return TeamReport(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      status: status ?? this.status,
      reportType: reportType ?? this.reportType,
      createdAt: createdAt ?? this.createdAt,
      address: address ?? this.address,
      location: location ?? this.location,
      supportCount: supportCount ?? this.supportCount,
      user: user ?? this.user,
      category: category ?? this.category,
      reportMedias: reportMedias ?? this.reportMedias,
      priority: priority ?? this.priority,
      urgencyLevel: urgencyLevel ?? this.urgencyLevel,
      reporterName: reporterName ?? this.reporterName,
      district: district ?? this.district,
      neighborhood: neighborhood ?? this.neighborhood,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      assignmentStatus: assignmentStatus ?? this.assignmentStatus,
      assignmentDate: assignmentDate ?? this.assignmentDate,
      assignedAt: assignedAt ?? this.assignedAt,
      acceptedAt: acceptedAt ?? this.acceptedAt,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
      assignedTeamId: assignedTeamId ?? this.assignedTeamId,
      assignedTeamName: assignedTeamName ?? this.assignedTeamName,
      workProgressMedia: workProgressMedia ?? this.workProgressMedia,
      workNotes: workNotes ?? this.workNotes,
      workStartedAt: workStartedAt ?? this.workStartedAt,
      workCompletedAt: workCompletedAt ?? this.workCompletedAt,
    );
  }
}
