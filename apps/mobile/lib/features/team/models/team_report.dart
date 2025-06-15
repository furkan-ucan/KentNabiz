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
    // Location koordinatlarını çıkar - null safe
    double lat = 0.0;
    double lng = 0.0;

    // Önce location objesinden koordinatları al
    if (json['location'] != null && json['location']['coordinates'] != null) {
      try {
        final coordinates = json['location']['coordinates'] as List?;
        if (coordinates != null && coordinates.length >= 2) {
          // Koordinatlar null olabilir, bu durumda default değer kullan
          lng =
              coordinates[0] != null ? (coordinates[0] as num).toDouble() : 0.0;
          lat =
              coordinates[1] != null ? (coordinates[1] as num).toDouble() : 0.0;
        }
      } catch (e) {
        // Parsing hatası durumunda default değerleri kullan
        print('Location parsing error: $e');
        lat = 0.0;
        lng = 0.0;
      }
    }

    // Eğer ayrı latitude/longitude alanları varsa onları kullan
    if (json['latitude'] != null) {
      lat = (json['latitude'] as num?)?.toDouble() ?? 0.0;
    }
    if (json['longitude'] != null) {
      lng = (json['longitude'] as num?)?.toDouble() ?? 0.0;
    }

    // Atama durumunu belirle
    AssignmentStatus assignStatus = AssignmentStatus.unknown;
    DateTime? assignedAt;
    DateTime? acceptedAt;
    int? assignedTeamId;

    if (json['assignments'] != null &&
        (json['assignments'] as List).isNotEmpty) {
      final assignment = json['assignments'][0] as Map<String, dynamic>;
      final status = assignment['status']?.toString().toLowerCase();

      // Null-safe date parsing
      if (assignment['assignedAt'] != null) {
        assignedAt = DateTime.tryParse(assignment['assignedAt'].toString());
      }
      if (assignment['acceptedAt'] != null) {
        acceptedAt = DateTime.tryParse(assignment['acceptedAt'].toString());
      }

      assignedTeamId = assignment['assigneeTeamId'] as int?;

      switch (status) {
        case 'active':
          assignStatus = AssignmentStatus.assigned;
          break;
        case 'accepted':
          assignStatus = AssignmentStatus.accepted;
          break;
        case 'in_progress':
          assignStatus = AssignmentStatus.inProgress;
          break;
        case 'completed':
          assignStatus = AssignmentStatus.completed;
          break;
        case 'pending':
          assignStatus = AssignmentStatus.pending;
          break;
        case 'rejected':
          assignStatus = AssignmentStatus.rejected;
          break;
        default:
          assignStatus = AssignmentStatus.unknown;
      }
    }

    return TeamReport(
      id: (json['id'] as num?)?.toInt() ?? 0,
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
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
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      address: json['address']?.toString(),
      location:
          json['location'] != null ? Location.fromJson(json['location']) : null,
      supportCount: (json['supportCount'] as num?)?.toInt() ?? 0,
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      category: json['category'] != null
          ? (json['category'] is Map<String, dynamic>
              ? ReportCategory.fromJson(
                  json['category'] as Map<String, dynamic>)
              : null)
          : null,
      reportMedias: json['reportMedias'] != null
          ? (json['reportMedias'] as List)
              .map((media) => ReportMedia.fromJson(media))
              .toList()
          : [],
      urgencyLevel: json['urgencyLevel']?.toString(),
      reporterName: json['reporterName']?.toString(),
      district: json['district']?.toString(),
      neighborhood: json['neighborhood']?.toString(),
      latitude: lat,
      longitude: lng,
      assignmentStatus: assignStatus,
      assignmentDate: json['assignmentDate'] != null
          ? DateTime.tryParse(json['assignmentDate'])
          : null,
      assignedAt: assignedAt,
      acceptedAt: acceptedAt,
      startedAt: json['startedAt'] != null
          ? DateTime.tryParse(json['startedAt'])
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'])
          : null,
      assignedTeamId: assignedTeamId,
      assignedTeamName: json['assignedTeamName']?.toString(),
      workProgressMedia: json['workProgressMedia'] != null
          ? (json['workProgressMedia'] as List)
              .map((media) => WorkProgressMedia.fromJson(media))
              .toList()
          : [],
      workNotes: json['workNotes']?.toString(),
      workStartedAt: json['workStartedAt'] != null
          ? DateTime.tryParse(json['workStartedAt'])
          : null,
      workCompletedAt: json['workCompletedAt'] != null
          ? DateTime.tryParse(json['workCompletedAt'])
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
