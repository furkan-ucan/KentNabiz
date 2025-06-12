// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'report_category.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ReportCategory _$ReportCategoryFromJson(Map<String, dynamic> json) {
  return _ReportCategory.fromJson(json);
}

/// @nodoc
mixin _$ReportCategory {
  int get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get code => throw _privateConstructorUsedError;
  String? get icon => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  List<ReportCategory> get children => throw _privateConstructorUsedError;

  /// Serializes this ReportCategory to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ReportCategory
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ReportCategoryCopyWith<ReportCategory> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ReportCategoryCopyWith<$Res> {
  factory $ReportCategoryCopyWith(
          ReportCategory value, $Res Function(ReportCategory) then) =
      _$ReportCategoryCopyWithImpl<$Res, ReportCategory>;
  @useResult
  $Res call(
      {int id,
      String name,
      String code,
      String? icon,
      String? description,
      List<ReportCategory> children});
}

/// @nodoc
class _$ReportCategoryCopyWithImpl<$Res, $Val extends ReportCategory>
    implements $ReportCategoryCopyWith<$Res> {
  _$ReportCategoryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ReportCategory
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? code = null,
    Object? icon = freezed,
    Object? description = freezed,
    Object? children = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as int,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      code: null == code
          ? _value.code
          : code // ignore: cast_nullable_to_non_nullable
              as String,
      icon: freezed == icon
          ? _value.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      children: null == children
          ? _value.children
          : children // ignore: cast_nullable_to_non_nullable
              as List<ReportCategory>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ReportCategoryImplCopyWith<$Res>
    implements $ReportCategoryCopyWith<$Res> {
  factory _$$ReportCategoryImplCopyWith(_$ReportCategoryImpl value,
          $Res Function(_$ReportCategoryImpl) then) =
      __$$ReportCategoryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int id,
      String name,
      String code,
      String? icon,
      String? description,
      List<ReportCategory> children});
}

/// @nodoc
class __$$ReportCategoryImplCopyWithImpl<$Res>
    extends _$ReportCategoryCopyWithImpl<$Res, _$ReportCategoryImpl>
    implements _$$ReportCategoryImplCopyWith<$Res> {
  __$$ReportCategoryImplCopyWithImpl(
      _$ReportCategoryImpl _value, $Res Function(_$ReportCategoryImpl) _then)
      : super(_value, _then);

  /// Create a copy of ReportCategory
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? code = null,
    Object? icon = freezed,
    Object? description = freezed,
    Object? children = null,
  }) {
    return _then(_$ReportCategoryImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as int,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      code: null == code
          ? _value.code
          : code // ignore: cast_nullable_to_non_nullable
              as String,
      icon: freezed == icon
          ? _value.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      children: null == children
          ? _value._children
          : children // ignore: cast_nullable_to_non_nullable
              as List<ReportCategory>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ReportCategoryImpl implements _ReportCategory {
  const _$ReportCategoryImpl(
      {required this.id,
      required this.name,
      required this.code,
      this.icon,
      this.description,
      final List<ReportCategory> children = const []})
      : _children = children;

  factory _$ReportCategoryImpl.fromJson(Map<String, dynamic> json) =>
      _$$ReportCategoryImplFromJson(json);

  @override
  final int id;
  @override
  final String name;
  @override
  final String code;
  @override
  final String? icon;
  @override
  final String? description;
  final List<ReportCategory> _children;
  @override
  @JsonKey()
  List<ReportCategory> get children {
    if (_children is EqualUnmodifiableListView) return _children;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_children);
  }

  @override
  String toString() {
    return 'ReportCategory(id: $id, name: $name, code: $code, icon: $icon, description: $description, children: $children)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ReportCategoryImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            (identical(other.description, description) ||
                other.description == description) &&
            const DeepCollectionEquality().equals(other._children, _children));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, code, icon,
      description, const DeepCollectionEquality().hash(_children));

  /// Create a copy of ReportCategory
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ReportCategoryImplCopyWith<_$ReportCategoryImpl> get copyWith =>
      __$$ReportCategoryImplCopyWithImpl<_$ReportCategoryImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ReportCategoryImplToJson(
      this,
    );
  }
}

abstract class _ReportCategory implements ReportCategory {
  const factory _ReportCategory(
      {required final int id,
      required final String name,
      required final String code,
      final String? icon,
      final String? description,
      final List<ReportCategory> children}) = _$ReportCategoryImpl;

  factory _ReportCategory.fromJson(Map<String, dynamic> json) =
      _$ReportCategoryImpl.fromJson;

  @override
  int get id;
  @override
  String get name;
  @override
  String get code;
  @override
  String? get icon;
  @override
  String? get description;
  @override
  List<ReportCategory> get children;

  /// Create a copy of ReportCategory
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ReportCategoryImplCopyWith<_$ReportCategoryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
