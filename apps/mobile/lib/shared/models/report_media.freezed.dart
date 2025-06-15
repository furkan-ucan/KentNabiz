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
  String get url => throw _privateConstructorUsedError; // DÜZELTME:
// Backend'den gelen JSON'daki 'mimetype' anahtarını
// bu modeldeki 'type' alanına atamasını sağlıyoruz.
// Eğer 'mimetype' yoksa, 'type' anahtarını arar.
// İkisi de yoksa null olur.
  @JsonKey(name: 'mimetype')
  String? get type =>
      throw _privateConstructorUsedError; // Sunucudan gelebilecek diğer opsiyonel alanları da ekleyebiliriz.
// Bu, gelecekteki olası hataları önler.
  String? get filename => throw _privateConstructorUsedError;
  int? get size => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;

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
  $Res call(
      {int id,
      String url,
      @JsonKey(name: 'mimetype') String? type,
      String? filename,
      int? size,
      DateTime? createdAt,
      DateTime? updatedAt});
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
    Object? filename = freezed,
    Object? size = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
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
      filename: freezed == filename
          ? _value.filename
          : filename // ignore: cast_nullable_to_non_nullable
              as String?,
      size: freezed == size
          ? _value.size
          : size // ignore: cast_nullable_to_non_nullable
              as int?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
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
  $Res call(
      {int id,
      String url,
      @JsonKey(name: 'mimetype') String? type,
      String? filename,
      int? size,
      DateTime? createdAt,
      DateTime? updatedAt});
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
    Object? filename = freezed,
    Object? size = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
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
      filename: freezed == filename
          ? _value.filename
          : filename // ignore: cast_nullable_to_non_nullable
              as String?,
      size: freezed == size
          ? _value.size
          : size // ignore: cast_nullable_to_non_nullable
              as int?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ReportMediaImpl implements _ReportMedia {
  const _$ReportMediaImpl(
      {required this.id,
      required this.url,
      @JsonKey(name: 'mimetype') this.type,
      this.filename,
      this.size,
      this.createdAt,
      this.updatedAt});

  factory _$ReportMediaImpl.fromJson(Map<String, dynamic> json) =>
      _$$ReportMediaImplFromJson(json);

  @override
  final int id;
  @override
  final String url;
// DÜZELTME:
// Backend'den gelen JSON'daki 'mimetype' anahtarını
// bu modeldeki 'type' alanına atamasını sağlıyoruz.
// Eğer 'mimetype' yoksa, 'type' anahtarını arar.
// İkisi de yoksa null olur.
  @override
  @JsonKey(name: 'mimetype')
  final String? type;
// Sunucudan gelebilecek diğer opsiyonel alanları da ekleyebiliriz.
// Bu, gelecekteki olası hataları önler.
  @override
  final String? filename;
  @override
  final int? size;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'ReportMedia(id: $id, url: $url, type: $type, filename: $filename, size: $size, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ReportMediaImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.url, url) || other.url == url) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.filename, filename) ||
                other.filename == filename) &&
            (identical(other.size, size) || other.size == size) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, url, type, filename, size, createdAt, updatedAt);

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
      @JsonKey(name: 'mimetype') final String? type,
      final String? filename,
      final int? size,
      final DateTime? createdAt,
      final DateTime? updatedAt}) = _$ReportMediaImpl;

  factory _ReportMedia.fromJson(Map<String, dynamic> json) =
      _$ReportMediaImpl.fromJson;

  @override
  int get id;
  @override
  String get url; // DÜZELTME:
// Backend'den gelen JSON'daki 'mimetype' anahtarını
// bu modeldeki 'type' alanına atamasını sağlıyoruz.
// Eğer 'mimetype' yoksa, 'type' anahtarını arar.
// İkisi de yoksa null olur.
  @override
  @JsonKey(name: 'mimetype')
  String?
      get type; // Sunucudan gelebilecek diğer opsiyonel alanları da ekleyebiliriz.
// Bu, gelecekteki olası hataları önler.
  @override
  String? get filename;
  @override
  int? get size;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;

  /// Create a copy of ReportMedia
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ReportMediaImplCopyWith<_$ReportMediaImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
