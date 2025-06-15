// lib/shared/models/report.dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:kentnabiz_mobile/shared/models/report_category.dart';
import 'package:kentnabiz_mobile/shared/models/report_media.dart';
import 'package:kentnabiz_mobile/shared/models/user.dart';

part 'report.freezed.dart';
part 'report.g.dart';

// --- ENUM'LAR ---
enum ReportStatus {
  @JsonValue('OPEN')
  open,
  @JsonValue('IN_REVIEW')
  inReview,
  @JsonValue('IN_PROGRESS')
  inProgress,
  @JsonValue('DONE')
  done,
  @JsonValue('REJECTED')
  rejected,
  @JsonValue('CANCELLED')
  cancelled,
  unknown,
}

extension ReportStatusX on ReportStatus {
  String get toTurkish {
    switch (this) {
      case ReportStatus.open:
        return 'Açık';
      case ReportStatus.inReview:
        return 'İnceleniyor';
      case ReportStatus.inProgress:
        return 'İşlemde';
      case ReportStatus.done:
        return 'Tamamlandı';
      case ReportStatus.rejected:
        return 'Reddedildi';
      case ReportStatus.cancelled:
        return 'İptal Edildi';
      case ReportStatus.unknown:
        return 'Bilinmiyor';
    }
  }
}

enum ReportType {
  @JsonValue('POTHOLE')
  pothole,
  @JsonValue('SIDEWALK_DAMAGE')
  sidewalkDamage,
  @JsonValue('ROAD_DAMAGE')
  roadDamage,
  @JsonValue('ROAD_SIGN')
  roadSign,
  @JsonValue('ROAD_MARKING')
  roadMarking,
  @JsonValue('TRAFFIC_LIGHT')
  trafficLight,
  @JsonValue('ROAD_BLOCK')
  roadBlock,
  @JsonValue('STREET_LIGHT')
  streetLight,
  @JsonValue('ELECTRICITY_OUTAGE')
  electricityOutage,
  @JsonValue('WATER_LEAKAGE')
  waterLeakage,
  @JsonValue('DRAINAGE_BLOCKAGE')
  drainageBlockage,
  @JsonValue('SEWER_LEAKAGE')
  sewerLeakage,
  @JsonValue('GARBAGE_COLLECTION')
  garbageCollection,
  @JsonValue('LITTER')
  litter,
  @JsonValue('DUMPING')
  dumping,
  @JsonValue('GRAFFITI')
  graffiti,
  @JsonValue('AIR_POLLUTION')
  airPollution,
  @JsonValue('PARK_DAMAGE')
  parkDamage,
  @JsonValue('TREE_ISSUE')
  treeIssue,
  @JsonValue('PUBLIC_TRANSPORT')
  publicTransport,
  @JsonValue('PUBLIC_TRANSPORT_STOP')
  publicTransportStop,
  @JsonValue('PARKING_VIOLATION')
  parkingViolation,
  @JsonValue('TRAFFIC_CONGESTION')
  trafficCongestion,
  @JsonValue('ANIMAL_CONTROL')
  animalControl,
  @JsonValue('NOISE_COMPLAINT')
  noiseComplaint,
  @JsonValue('OTHER')
  other,
  unknown
}

// --- LOCATION MODELİ ve CONVERTER'I ---
@freezed
class Location with _$Location {
  const factory Location({
    required double latitude,
    required double longitude,
  }) = _Location;

  factory Location.fromJson(Map<String, dynamic> json) =>
      _$LocationFromJson(json);
}

class PointToLocationConverter
    implements JsonConverter<Location?, Map<String, dynamic>?> {
  const PointToLocationConverter();
  @override
  Location? fromJson(Map<String, dynamic>? json) {
    if (json == null) return null;
    final coords = json['coordinates'] as List?;
    if (coords != null && coords.length >= 2) {
      // Koordinatları güvenli bir şekilde double'a dönüştür
      final longitude = (coords[0] as num?)?.toDouble() ?? 0.0;
      final latitude = (coords[1] as num?)?.toDouble() ?? 0.0;

      return Location(latitude: latitude, longitude: longitude);
    }
    return null;
  }

  @override
  Map<String, dynamic>? toJson(Location? location) {
    if (location == null) return null;
    return {
      'type': 'Point',
      'coordinates': [location.longitude, location.latitude]
    };
  }
}

// --- ANA REPORT MODELİ ---
@freezed
class Report with _$Report {
  const factory Report({
    required int id,
    required String title,
    String? description,
    ReportStatus? status,
    ReportType? reportType,
    required DateTime createdAt,
    String? address,
    @PointToLocationConverter() Location? location,
    int? supportCount,
    User? user,
    ReportCategory? category,
    @Default([]) List<ReportMedia> reportMedias,
  }) = _Report;

  factory Report.fromJson(Map<String, dynamic> json) => _$ReportFromJson(json);
}
