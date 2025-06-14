// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'report_media.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ReportMediaImpl _$$ReportMediaImplFromJson(Map<String, dynamic> json) =>
    _$ReportMediaImpl(
      id: (json['id'] as num).toInt(),
      url: json['url'] as String,
      type: json['mimetype'] as String?,
      filename: json['filename'] as String?,
      size: (json['size'] as num?)?.toInt(),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$ReportMediaImplToJson(_$ReportMediaImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'url': instance.url,
      'mimetype': instance.type,
      'filename': instance.filename,
      'size': instance.size,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
