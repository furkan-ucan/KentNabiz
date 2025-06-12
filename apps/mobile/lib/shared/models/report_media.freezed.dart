// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'report_media.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ReportMedia _$ReportMediaFromJson(Map<String, dynamic> json) {
  return _ReportMedia.fromJson(json);
}

/// @nodoc
mixin _$ReportMedia {
  int get id => throw _privateConstructorUsedError;
  String get url => throw _privateConstructorUsedError;
  String? get type => throw _privateConstructorUsedError;

  /// Serializes this ReportMedia to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ReportMedia
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ReportMediaCopyWith<ReportMedia> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ReportMediaCopyWith<$Res> {
  factory $ReportMediaCopyWith(
          ReportMedia value, $Res Function(ReportMedia) then) =
      _$ReportMediaCopyWithImpl<$Res, ReportMedia>;
  @useResult
  $Res call({int id, String url, String? type});
}

/// @nodoc
class _$ReportMediaCopyWithImpl<$Res, $Val extends ReportMedia>
    implements $ReportMediaCopyWith<$Res> {
  _$ReportMediaCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ReportMedia
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? url = null,
    Object? type = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as int,
      url: null == url
          ? _value.url
          : url // ignore: cast_nullable_to_non_nullable
              as String,
      type: freezed == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ReportMediaImplCopyWith<$Res>
    implements $ReportMediaCopyWith<$Res> {
  factory _$$ReportMediaImplCopyWith(
          _$ReportMediaImpl value, $Res Function(_$ReportMediaImpl) then) =
      __$$ReportMediaImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int id, String url, String? type});
}

/// @nodoc
class __$$ReportMediaImplCopyWithImpl<$Res>
    extends _$ReportMediaCopyWithImpl<$Res, _$ReportMediaImpl>
    implements _$$ReportMediaImplCopyWith<$Res> {
  __$$ReportMediaImplCopyWithImpl(
      _$ReportMediaImpl _value, $Res Function(_$ReportMediaImpl) _then)
      : super(_value, _then);

  /// Create a copy of ReportMedia
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? url = null,
    Object? type = freezed,
  }) {
    return _then(_$ReportMediaImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as int,
      url: null == url
          ? _value.url
          : url // ignore: cast_nullable_to_non_nullable
              as String,
      type: freezed == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ReportMediaImpl implements _ReportMedia {
  const _$ReportMediaImpl({required this.id, required this.url, this.type});

  factory _$ReportMediaImpl.fromJson(Map<String, dynamic> json) =>
      _$$ReportMediaImplFromJson(json);

  @override
  final int id;
  @override
  final String url;
  @override
  final String? type;

  @override
  String toString() {
    return 'ReportMedia(id: $id, url: $url, type: $type)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ReportMediaImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.url, url) || other.url == url) &&
            (identical(other.type, type) || other.type == type));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, url, type);

  /// Create a copy of ReportMedia
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ReportMediaImplCopyWith<_$ReportMediaImpl> get copyWith =>
      __$$ReportMediaImplCopyWithImpl<_$ReportMediaImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ReportMediaImplToJson(
      this,
    );
  }
}

abstract class _ReportMedia implements ReportMedia {
  const factory _ReportMedia(
      {required final int id,
      required final String url,
      final String? type}) = _$ReportMediaImpl;

  factory _ReportMedia.fromJson(Map<String, dynamic> json) =
      _$ReportMediaImpl.fromJson;

  @override
  int get id;
  @override
  String get url;
  @override
  String? get type;

  /// Create a copy of ReportMedia
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ReportMediaImplCopyWith<_$ReportMediaImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
