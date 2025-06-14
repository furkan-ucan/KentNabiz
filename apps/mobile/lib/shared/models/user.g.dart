// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserImpl _$$UserImplFromJson(Map<String, dynamic> json) => _$UserImpl(
      id: (_readIdValue(json, 'id') as num).toInt(),
      email: json['email'] as String,
      fullName: json['fullName'] as String?,
      roles: (json['roles'] as List<dynamic>?)
              ?.map((e) => $enumDecode(_$UserRoleEnumMap, e))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$UserImplToJson(_$UserImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'fullName': instance.fullName,
      'roles': instance.roles.map((e) => _$UserRoleEnumMap[e]!).toList(),
    };

const _$UserRoleEnumMap = {
  UserRole.citizen: 'CITIZEN',
  UserRole.teamMember: 'TEAM_MEMBER',
  UserRole.departmentSupervisor: 'DEPARTMENT_SUPERVISOR',
  UserRole.systemAdmin: 'SYSTEM_ADMIN',
  UserRole.unknown: 'unknown',
};
