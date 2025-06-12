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
    );

Map<String, dynamic> _$$ReportCategoryImplToJson(
        _$ReportCategoryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'code': instance.code,
      'icon': instance.icon,
      'description': instance.description,
      'children': instance.children,
    };
