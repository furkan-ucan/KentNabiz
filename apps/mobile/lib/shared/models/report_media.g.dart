// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'report_media.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ReportMediaImpl _$$ReportMediaImplFromJson(Map<String, dynamic> json) =>
    _$ReportMediaImpl(
      id: (json['id'] as num).toInt(),
      url: json['url'] as String,
      type: json['type'] as String?,
    );

Map<String, dynamic> _$$ReportMediaImplToJson(_$ReportMediaImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'url': instance.url,
      'type': instance.type,
    };
