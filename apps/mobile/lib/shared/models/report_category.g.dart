// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'report_category.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ReportCategoryImpl _$$ReportCategoryImplFromJson(Map<String, dynamic> json) =>
    _$ReportCategoryImpl(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      code: json['code'] as String,
      icon: json['icon'] as String?,
      description: json['description'] as String?,
      children: (json['children'] as List<dynamic>?)
              ?.map((e) => ReportCategory.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      defaultReportType:
          $enumDecodeNullable(_$ReportTypeEnumMap, json['defaultReportType']),
    );

Map<String, dynamic> _$$ReportCategoryImplToJson(
        _$ReportCategoryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'code': instance.code,
      'icon': instance.icon,
      'description': instance.description,
      'children': instance.children.map((e) => e.toJson()).toList(),
      'defaultReportType': _$ReportTypeEnumMap[instance.defaultReportType],
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
