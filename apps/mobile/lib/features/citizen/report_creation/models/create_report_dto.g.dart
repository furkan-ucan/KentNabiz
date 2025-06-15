// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_report_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CreateReportMediaDtoImpl _$$CreateReportMediaDtoImplFromJson(
        Map<String, dynamic> json) =>
    _$CreateReportMediaDtoImpl(
      url: json['url'] as String,
      type: json['type'] as String,
    );

Map<String, dynamic> _$$CreateReportMediaDtoImplToJson(
        _$CreateReportMediaDtoImpl instance) =>
    <String, dynamic>{
      'url': instance.url,
      'type': instance.type,
    };

_$CreateReportDtoImpl _$$CreateReportDtoImplFromJson(
        Map<String, dynamic> json) =>
    _$CreateReportDtoImpl(
      title: json['title'] as String,
      description: json['description'] as String,
      address: json['address'] as String,
      location: Location.fromJson(json['location'] as Map<String, dynamic>),
      categoryId: (json['categoryId'] as num).toInt(),
      departmentCode: json['departmentCode'] as String,
      reportType: $enumDecodeNullable(_$ReportTypeEnumMap, json['reportType']),
      reportMedias: (json['reportMedias'] as List<dynamic>?)
              ?.map((e) =>
                  CreateReportMediaDto.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$CreateReportDtoImplToJson(
        _$CreateReportDtoImpl instance) =>
    <String, dynamic>{
      'title': instance.title,
      'description': instance.description,
      'address': instance.address,
      'location': instance.location.toJson(),
      'categoryId': instance.categoryId,
      'departmentCode': instance.departmentCode,
      'reportType': _$ReportTypeEnumMap[instance.reportType],
      'reportMedias': instance.reportMedias.map((e) => e.toJson()).toList(),
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
