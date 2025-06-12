// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'report.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LocationImpl _$$LocationImplFromJson(Map<String, dynamic> json) =>
    _$LocationImpl(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
    );

Map<String, dynamic> _$$LocationImplToJson(_$LocationImpl instance) =>
    <String, dynamic>{
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };

_$ReportImpl _$$ReportImplFromJson(Map<String, dynamic> json) => _$ReportImpl(
      id: (json['id'] as num).toInt(),
      title: json['title'] as String,
      description: json['description'] as String?,
      status: $enumDecodeNullable(_$ReportStatusEnumMap, json['status']),
      reportType: $enumDecodeNullable(_$ReportTypeEnumMap, json['reportType']),
      createdAt: DateTime.parse(json['createdAt'] as String),
      address: json['address'] as String?,
      location: const PointToLocationConverter()
          .fromJson(json['location'] as Map<String, dynamic>?),
      supportCount: (json['supportCount'] as num?)?.toInt(),
      user: json['user'] == null
          ? null
          : User.fromJson(json['user'] as Map<String, dynamic>),
      category: json['category'] == null
          ? null
          : ReportCategory.fromJson(json['category'] as Map<String, dynamic>),
      reportMedias: (json['reportMedias'] as List<dynamic>?)
              ?.map((e) => ReportMedia.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$ReportImplToJson(_$ReportImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'description': instance.description,
      'status': _$ReportStatusEnumMap[instance.status],
      'reportType': _$ReportTypeEnumMap[instance.reportType],
      'createdAt': instance.createdAt.toIso8601String(),
      'address': instance.address,
      'location': const PointToLocationConverter().toJson(instance.location),
      'supportCount': instance.supportCount,
      'user': instance.user,
      'category': instance.category,
      'reportMedias': instance.reportMedias,
    };

const _$ReportStatusEnumMap = {
  ReportStatus.open: 'OPEN',
  ReportStatus.inReview: 'IN_REVIEW',
  ReportStatus.inProgress: 'IN_PROGRESS',
  ReportStatus.done: 'DONE',
  ReportStatus.rejected: 'REJECTED',
  ReportStatus.cancelled: 'CANCELLED',
  ReportStatus.unknown: 'unknown',
};

const _$ReportTypeEnumMap = {
  ReportType.pothole: 'POTHOLE',
  ReportType.sidewalkDamage: 'SIDEWALK_DAMAGE',
  ReportType.roadDamage: 'ROAD_DAMAGE',
  ReportType.roadSign: 'ROAD_SIGN',
  ReportType.roadMarking: 'ROAD_MARKING',
  ReportType.trafficLight: 'TRAFFIC_LIGHT',
  ReportType.roadBlock: 'ROAD_BLOCK',
  ReportType.streetLight: 'STREET_LIGHT',
  ReportType.electricityOutage: 'ELECTRICITY_OUTAGE',
  ReportType.waterLeakage: 'WATER_LEAKAGE',
  ReportType.drainageBlockage: 'DRAINAGE_BLOCKAGE',
  ReportType.sewerLeakage: 'SEWER_LEAKAGE',
  ReportType.garbageCollection: 'GARBAGE_COLLECTION',
  ReportType.litter: 'LITTER',
  ReportType.dumping: 'DUMPING',
  ReportType.graffiti: 'GRAFFITI',
  ReportType.airPollution: 'AIR_POLLUTION',
  ReportType.parkDamage: 'PARK_DAMAGE',
  ReportType.treeIssue: 'TREE_ISSUE',
  ReportType.publicTransport: 'PUBLIC_TRANSPORT',
  ReportType.publicTransportStop: 'PUBLIC_TRANSPORT_STOP',
  ReportType.parkingViolation: 'PARKING_VIOLATION',
  ReportType.trafficCongestion: 'TRAFFIC_CONGESTION',
  ReportType.animalControl: 'ANIMAL_CONTROL',
  ReportType.noiseComplaint: 'NOISE_COMPLAINT',
  ReportType.other: 'OTHER',
  ReportType.unknown: 'unknown',
};
