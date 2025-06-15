// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'create_report_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

/// @nodoc
mixin _$CreateReportState {
// Adım 1
  Department? get selectedDepartment => throw _privateConstructorUsedError;
  ReportCategory? get selectedCategory =>
      throw _privateConstructorUsedError; // Adım 2
  String? get title => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  String? get address => throw _privateConstructorUsedError;
  Location? get location => throw _privateConstructorUsedError; // Adım 3
  List<File> get photos => throw _privateConstructorUsedError; // Already exists
// Akışın kendi durumu
  bool get isSubmitting =>
      throw _privateConstructorUsedError; // Changed from isLoading
  String? get error => throw _privateConstructorUsedError;

  /// Create a copy of CreateReportState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateReportStateCopyWith<CreateReportState> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateReportStateCopyWith<$Res> {
  factory $CreateReportStateCopyWith(
          CreateReportState value, $Res Function(CreateReportState) then) =
      _$CreateReportStateCopyWithImpl<$Res, CreateReportState>;
  @useResult
  $Res call(
      {Department? selectedDepartment,
      ReportCategory? selectedCategory,
      String? title,
      String? description,
      String? address,
      Location? location,
      List<File> photos,
      bool isSubmitting,
      String? error});

  $DepartmentCopyWith<$Res>? get selectedDepartment;
  $ReportCategoryCopyWith<$Res>? get selectedCategory;
  $LocationCopyWith<$Res>? get location;
}

/// @nodoc
class _$CreateReportStateCopyWithImpl<$Res, $Val extends CreateReportState>
    implements $CreateReportStateCopyWith<$Res> {
  _$CreateReportStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateReportState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? selectedDepartment = freezed,
    Object? selectedCategory = freezed,
    Object? title = freezed,
    Object? description = freezed,
    Object? address = freezed,
    Object? location = freezed,
    Object? photos = null,
    Object? isSubmitting = null,
    Object? error = freezed,
  }) {
    return _then(_value.copyWith(
      selectedDepartment: freezed == selectedDepartment
          ? _value.selectedDepartment
          : selectedDepartment // ignore: cast_nullable_to_non_nullable
              as Department?,
      selectedCategory: freezed == selectedCategory
          ? _value.selectedCategory
          : selectedCategory // ignore: cast_nullable_to_non_nullable
              as ReportCategory?,
      title: freezed == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      address: freezed == address
          ? _value.address
          : address // ignore: cast_nullable_to_non_nullable
              as String?,
      location: freezed == location
          ? _value.location
          : location // ignore: cast_nullable_to_non_nullable
              as Location?,
      photos: null == photos
          ? _value.photos
          : photos // ignore: cast_nullable_to_non_nullable
              as List<File>,
      isSubmitting: null == isSubmitting
          ? _value.isSubmitting
          : isSubmitting // ignore: cast_nullable_to_non_nullable
              as bool,
      error: freezed == error
          ? _value.error
          : error // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  /// Create a copy of CreateReportState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $DepartmentCopyWith<$Res>? get selectedDepartment {
    if (_value.selectedDepartment == null) {
      return null;
    }

    return $DepartmentCopyWith<$Res>(_value.selectedDepartment!, (value) {
      return _then(_value.copyWith(selectedDepartment: value) as $Val);
    });
  }

  /// Create a copy of CreateReportState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ReportCategoryCopyWith<$Res>? get selectedCategory {
    if (_value.selectedCategory == null) {
      return null;
    }

    return $ReportCategoryCopyWith<$Res>(_value.selectedCategory!, (value) {
      return _then(_value.copyWith(selectedCategory: value) as $Val);
    });
  }

  /// Create a copy of CreateReportState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $LocationCopyWith<$Res>? get location {
    if (_value.location == null) {
      return null;
    }

    return $LocationCopyWith<$Res>(_value.location!, (value) {
      return _then(_value.copyWith(location: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$CreateReportStateImplCopyWith<$Res>
    implements $CreateReportStateCopyWith<$Res> {
  factory _$$CreateReportStateImplCopyWith(_$CreateReportStateImpl value,
          $Res Function(_$CreateReportStateImpl) then) =
      __$$CreateReportStateImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {Department? selectedDepartment,
      ReportCategory? selectedCategory,
      String? title,
      String? description,
      String? address,
      Location? location,
      List<File> photos,
      bool isSubmitting,
      String? error});

  @override
  $DepartmentCopyWith<$Res>? get selectedDepartment;
  @override
  $ReportCategoryCopyWith<$Res>? get selectedCategory;
  @override
  $LocationCopyWith<$Res>? get location;
}

/// @nodoc
class __$$CreateReportStateImplCopyWithImpl<$Res>
    extends _$CreateReportStateCopyWithImpl<$Res, _$CreateReportStateImpl>
    implements _$$CreateReportStateImplCopyWith<$Res> {
  __$$CreateReportStateImplCopyWithImpl(_$CreateReportStateImpl _value,
      $Res Function(_$CreateReportStateImpl) _then)
      : super(_value, _then);

  /// Create a copy of CreateReportState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? selectedDepartment = freezed,
    Object? selectedCategory = freezed,
    Object? title = freezed,
    Object? description = freezed,
    Object? address = freezed,
    Object? location = freezed,
    Object? photos = null,
    Object? isSubmitting = null,
    Object? error = freezed,
  }) {
    return _then(_$CreateReportStateImpl(
      selectedDepartment: freezed == selectedDepartment
          ? _value.selectedDepartment
          : selectedDepartment // ignore: cast_nullable_to_non_nullable
              as Department?,
      selectedCategory: freezed == selectedCategory
          ? _value.selectedCategory
          : selectedCategory // ignore: cast_nullable_to_non_nullable
              as ReportCategory?,
      title: freezed == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      address: freezed == address
          ? _value.address
          : address // ignore: cast_nullable_to_non_nullable
              as String?,
      location: freezed == location
          ? _value.location
          : location // ignore: cast_nullable_to_non_nullable
              as Location?,
      photos: null == photos
          ? _value._photos
          : photos // ignore: cast_nullable_to_non_nullable
              as List<File>,
      isSubmitting: null == isSubmitting
          ? _value.isSubmitting
          : isSubmitting // ignore: cast_nullable_to_non_nullable
              as bool,
      error: freezed == error
          ? _value.error
          : error // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc

class _$CreateReportStateImpl implements _CreateReportState {
  const _$CreateReportStateImpl(
      {this.selectedDepartment,
      this.selectedCategory,
      this.title,
      this.description,
      this.address,
      this.location,
      final List<File> photos = const [],
      this.isSubmitting = false,
      this.error})
      : _photos = photos;

// Adım 1
  @override
  final Department? selectedDepartment;
  @override
  final ReportCategory? selectedCategory;
// Adım 2
  @override
  final String? title;
  @override
  final String? description;
  @override
  final String? address;
  @override
  final Location? location;
// Adım 3
  final List<File> _photos;
// Adım 3
  @override
  @JsonKey()
  List<File> get photos {
    if (_photos is EqualUnmodifiableListView) return _photos;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_photos);
  }

// Already exists
// Akışın kendi durumu
  @override
  @JsonKey()
  final bool isSubmitting;
// Changed from isLoading
  @override
  final String? error;

  @override
  String toString() {
    return 'CreateReportState(selectedDepartment: $selectedDepartment, selectedCategory: $selectedCategory, title: $title, description: $description, address: $address, location: $location, photos: $photos, isSubmitting: $isSubmitting, error: $error)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateReportStateImpl &&
            (identical(other.selectedDepartment, selectedDepartment) ||
                other.selectedDepartment == selectedDepartment) &&
            (identical(other.selectedCategory, selectedCategory) ||
                other.selectedCategory == selectedCategory) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.address, address) || other.address == address) &&
            (identical(other.location, location) ||
                other.location == location) &&
            const DeepCollectionEquality().equals(other._photos, _photos) &&
            (identical(other.isSubmitting, isSubmitting) ||
                other.isSubmitting == isSubmitting) &&
            (identical(other.error, error) || other.error == error));
  }

  @override
  int get hashCode => Object.hash(
      runtimeType,
      selectedDepartment,
      selectedCategory,
      title,
      description,
      address,
      location,
      const DeepCollectionEquality().hash(_photos),
      isSubmitting,
      error);

  /// Create a copy of CreateReportState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateReportStateImplCopyWith<_$CreateReportStateImpl> get copyWith =>
      __$$CreateReportStateImplCopyWithImpl<_$CreateReportStateImpl>(
          this, _$identity);
}

abstract class _CreateReportState implements CreateReportState {
  const factory _CreateReportState(
      {final Department? selectedDepartment,
      final ReportCategory? selectedCategory,
      final String? title,
      final String? description,
      final String? address,
      final Location? location,
      final List<File> photos,
      final bool isSubmitting,
      final String? error}) = _$CreateReportStateImpl;

// Adım 1
  @override
  Department? get selectedDepartment;
  @override
  ReportCategory? get selectedCategory; // Adım 2
  @override
  String? get title;
  @override
  String? get description;
  @override
  String? get address;
  @override
  Location? get location; // Adım 3
  @override
  List<File> get photos; // Already exists
// Akışın kendi durumu
  @override
  bool get isSubmitting; // Changed from isLoading
  @override
  String? get error;

  /// Create a copy of CreateReportState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateReportStateImplCopyWith<_$CreateReportStateImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
