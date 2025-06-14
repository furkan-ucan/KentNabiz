// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'create_report_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

CreateReportMediaDto _$CreateReportMediaDtoFromJson(Map<String, dynamic> json) {
  return _CreateReportMediaDto.fromJson(json);
}

/// @nodoc
mixin _$CreateReportMediaDto {
  String get url => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;

  /// Serializes this CreateReportMediaDto to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateReportMediaDto
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateReportMediaDtoCopyWith<CreateReportMediaDto> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateReportMediaDtoCopyWith<$Res> {
  factory $CreateReportMediaDtoCopyWith(CreateReportMediaDto value,
          $Res Function(CreateReportMediaDto) then) =
      _$CreateReportMediaDtoCopyWithImpl<$Res, CreateReportMediaDto>;
  @useResult
  $Res call({String url, String type});
}

/// @nodoc
class _$CreateReportMediaDtoCopyWithImpl<$Res,
        $Val extends CreateReportMediaDto>
    implements $CreateReportMediaDtoCopyWith<$Res> {
  _$CreateReportMediaDtoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateReportMediaDto
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? url = null,
    Object? type = null,
  }) {
    return _then(_value.copyWith(
      url: null == url
          ? _value.url
          : url // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CreateReportMediaDtoImplCopyWith<$Res>
    implements $CreateReportMediaDtoCopyWith<$Res> {
  factory _$$CreateReportMediaDtoImplCopyWith(_$CreateReportMediaDtoImpl value,
          $Res Function(_$CreateReportMediaDtoImpl) then) =
      __$$CreateReportMediaDtoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String url, String type});
}

/// @nodoc
class __$$CreateReportMediaDtoImplCopyWithImpl<$Res>
    extends _$CreateReportMediaDtoCopyWithImpl<$Res, _$CreateReportMediaDtoImpl>
    implements _$$CreateReportMediaDtoImplCopyWith<$Res> {
  __$$CreateReportMediaDtoImplCopyWithImpl(_$CreateReportMediaDtoImpl _value,
      $Res Function(_$CreateReportMediaDtoImpl) _then)
      : super(_value, _then);

  /// Create a copy of CreateReportMediaDto
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? url = null,
    Object? type = null,
  }) {
    return _then(_$CreateReportMediaDtoImpl(
      url: null == url
          ? _value.url
          : url // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateReportMediaDtoImpl implements _CreateReportMediaDto {
  const _$CreateReportMediaDtoImpl({required this.url, required this.type});

  factory _$CreateReportMediaDtoImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateReportMediaDtoImplFromJson(json);

  @override
  final String url;
  @override
  final String type;

  @override
  String toString() {
    return 'CreateReportMediaDto(url: $url, type: $type)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateReportMediaDtoImpl &&
            (identical(other.url, url) || other.url == url) &&
            (identical(other.type, type) || other.type == type));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, url, type);

  /// Create a copy of CreateReportMediaDto
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateReportMediaDtoImplCopyWith<_$CreateReportMediaDtoImpl>
      get copyWith =>
          __$$CreateReportMediaDtoImplCopyWithImpl<_$CreateReportMediaDtoImpl>(
              this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateReportMediaDtoImplToJson(
      this,
    );
  }
}

abstract class _CreateReportMediaDto implements CreateReportMediaDto {
  const factory _CreateReportMediaDto(
      {required final String url,
      required final String type}) = _$CreateReportMediaDtoImpl;

  factory _CreateReportMediaDto.fromJson(Map<String, dynamic> json) =
      _$CreateReportMediaDtoImpl.fromJson;

  @override
  String get url;
  @override
  String get type;

  /// Create a copy of CreateReportMediaDto
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateReportMediaDtoImplCopyWith<_$CreateReportMediaDtoImpl>
      get copyWith => throw _privateConstructorUsedError;
}

CreateReportDto _$CreateReportDtoFromJson(Map<String, dynamic> json) {
  return _CreateReportDto.fromJson(json);
}

/// @nodoc
mixin _$CreateReportDto {
  String get title => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get address => throw _privateConstructorUsedError;
  Location get location => throw _privateConstructorUsedError;
  int get categoryId => throw _privateConstructorUsedError;
  String get departmentCode => throw _privateConstructorUsedError;
  ReportType? get reportType => throw _privateConstructorUsedError;
  List<CreateReportMediaDto> get reportMedias =>
      throw _privateConstructorUsedError;

  /// Serializes this CreateReportDto to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateReportDto
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateReportDtoCopyWith<CreateReportDto> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateReportDtoCopyWith<$Res> {
  factory $CreateReportDtoCopyWith(
          CreateReportDto value, $Res Function(CreateReportDto) then) =
      _$CreateReportDtoCopyWithImpl<$Res, CreateReportDto>;
  @useResult
  $Res call(
      {String title,
      String description,
      String address,
      Location location,
      int categoryId,
      String departmentCode,
      ReportType? reportType,
      List<CreateReportMediaDto> reportMedias});

  $LocationCopyWith<$Res> get location;
}

/// @nodoc
class _$CreateReportDtoCopyWithImpl<$Res, $Val extends CreateReportDto>
    implements $CreateReportDtoCopyWith<$Res> {
  _$CreateReportDtoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateReportDto
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = null,
    Object? description = null,
    Object? address = null,
    Object? location = null,
    Object? categoryId = null,
    Object? departmentCode = null,
    Object? reportType = freezed,
    Object? reportMedias = null,
  }) {
    return _then(_value.copyWith(
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      address: null == address
          ? _value.address
          : address // ignore: cast_nullable_to_non_nullable
              as String,
      location: null == location
          ? _value.location
          : location // ignore: cast_nullable_to_non_nullable
              as Location,
      categoryId: null == categoryId
          ? _value.categoryId
          : categoryId // ignore: cast_nullable_to_non_nullable
              as int,
      departmentCode: null == departmentCode
          ? _value.departmentCode
          : departmentCode // ignore: cast_nullable_to_non_nullable
              as String,
      reportType: freezed == reportType
          ? _value.reportType
          : reportType // ignore: cast_nullable_to_non_nullable
              as ReportType?,
      reportMedias: null == reportMedias
          ? _value.reportMedias
          : reportMedias // ignore: cast_nullable_to_non_nullable
              as List<CreateReportMediaDto>,
    ) as $Val);
  }

  /// Create a copy of CreateReportDto
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $LocationCopyWith<$Res> get location {
    return $LocationCopyWith<$Res>(_value.location, (value) {
      return _then(_value.copyWith(location: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$CreateReportDtoImplCopyWith<$Res>
    implements $CreateReportDtoCopyWith<$Res> {
  factory _$$CreateReportDtoImplCopyWith(_$CreateReportDtoImpl value,
          $Res Function(_$CreateReportDtoImpl) then) =
      __$$CreateReportDtoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String title,
      String description,
      String address,
      Location location,
      int categoryId,
      String departmentCode,
      ReportType? reportType,
      List<CreateReportMediaDto> reportMedias});

  @override
  $LocationCopyWith<$Res> get location;
}

/// @nodoc
class __$$CreateReportDtoImplCopyWithImpl<$Res>
    extends _$CreateReportDtoCopyWithImpl<$Res, _$CreateReportDtoImpl>
    implements _$$CreateReportDtoImplCopyWith<$Res> {
  __$$CreateReportDtoImplCopyWithImpl(
      _$CreateReportDtoImpl _value, $Res Function(_$CreateReportDtoImpl) _then)
      : super(_value, _then);

  /// Create a copy of CreateReportDto
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = null,
    Object? description = null,
    Object? address = null,
    Object? location = null,
    Object? categoryId = null,
    Object? departmentCode = null,
    Object? reportType = freezed,
    Object? reportMedias = null,
  }) {
    return _then(_$CreateReportDtoImpl(
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      address: null == address
          ? _value.address
          : address // ignore: cast_nullable_to_non_nullable
              as String,
      location: null == location
          ? _value.location
          : location // ignore: cast_nullable_to_non_nullable
              as Location,
      categoryId: null == categoryId
          ? _value.categoryId
          : categoryId // ignore: cast_nullable_to_non_nullable
              as int,
      departmentCode: null == departmentCode
          ? _value.departmentCode
          : departmentCode // ignore: cast_nullable_to_non_nullable
              as String,
      reportType: freezed == reportType
          ? _value.reportType
          : reportType // ignore: cast_nullable_to_non_nullable
              as ReportType?,
      reportMedias: null == reportMedias
          ? _value._reportMedias
          : reportMedias // ignore: cast_nullable_to_non_nullable
              as List<CreateReportMediaDto>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateReportDtoImpl implements _CreateReportDto {
  const _$CreateReportDtoImpl(
      {required this.title,
      required this.description,
      required this.address,
      required this.location,
      required this.categoryId,
      required this.departmentCode,
      this.reportType,
      final List<CreateReportMediaDto> reportMedias = const []})
      : _reportMedias = reportMedias;

  factory _$CreateReportDtoImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateReportDtoImplFromJson(json);

  @override
  final String title;
  @override
  final String description;
  @override
  final String address;
  @override
  final Location location;
  @override
  final int categoryId;
  @override
  final String departmentCode;
  @override
  final ReportType? reportType;
  final List<CreateReportMediaDto> _reportMedias;
  @override
  @JsonKey()
  List<CreateReportMediaDto> get reportMedias {
    if (_reportMedias is EqualUnmodifiableListView) return _reportMedias;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_reportMedias);
  }

  @override
  String toString() {
    return 'CreateReportDto(title: $title, description: $description, address: $address, location: $location, categoryId: $categoryId, departmentCode: $departmentCode, reportType: $reportType, reportMedias: $reportMedias)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateReportDtoImpl &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.address, address) || other.address == address) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            (identical(other.departmentCode, departmentCode) ||
                other.departmentCode == departmentCode) &&
            (identical(other.reportType, reportType) ||
                other.reportType == reportType) &&
            const DeepCollectionEquality()
                .equals(other._reportMedias, _reportMedias));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      title,
      description,
      address,
      location,
      categoryId,
      departmentCode,
      reportType,
      const DeepCollectionEquality().hash(_reportMedias));

  /// Create a copy of CreateReportDto
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateReportDtoImplCopyWith<_$CreateReportDtoImpl> get copyWith =>
      __$$CreateReportDtoImplCopyWithImpl<_$CreateReportDtoImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateReportDtoImplToJson(
      this,
    );
  }
}

abstract class _CreateReportDto implements CreateReportDto {
  const factory _CreateReportDto(
      {required final String title,
      required final String description,
      required final String address,
      required final Location location,
      required final int categoryId,
      required final String departmentCode,
      final ReportType? reportType,
      final List<CreateReportMediaDto> reportMedias}) = _$CreateReportDtoImpl;

  factory _CreateReportDto.fromJson(Map<String, dynamic> json) =
      _$CreateReportDtoImpl.fromJson;

  @override
  String get title;
  @override
  String get description;
  @override
  String get address;
  @override
  Location get location;
  @override
  int get categoryId;
  @override
  String get departmentCode;
  @override
  ReportType? get reportType;
  @override
  List<CreateReportMediaDto> get reportMedias;

  /// Create a copy of CreateReportDto
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateReportDtoImplCopyWith<_$CreateReportDtoImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
