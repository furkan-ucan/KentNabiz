// lib/shared/models/user.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

// Helper function to read 'id' or 'sub' from JSON
Object? _readIdValue(Map json, String key) => json['id'] ?? json['sub'];

enum UserRole {
  @JsonValue("CITIZEN")
  citizen,
  @JsonValue("TEAM_MEMBER")
  teamMember,
  @JsonValue("DEPARTMENT_SUPERVISOR")
  departmentSupervisor,
  @JsonValue("SYSTEM_ADMIN")
  systemAdmin,
  unknown,
}

@freezed
class User with _$User {
  const factory User({
    @JsonKey(readValue: _readIdValue) required int id,
    required String email,
    String? fullName,
    @Default([]) List<UserRole> roles,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
