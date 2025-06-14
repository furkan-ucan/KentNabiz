// lib/features/citizen/report_creation/models/create_report_dto.dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';

part 'create_report_dto.freezed.dart';
part 'create_report_dto.g.dart';

@freezed
class CreateReportMediaDto with _$CreateReportMediaDto {
  const factory CreateReportMediaDto({
    required String url,
    required String type,
  }) = _CreateReportMediaDto;
  factory CreateReportMediaDto.fromJson(Map<String, dynamic> json) =>
      _$CreateReportMediaDtoFromJson(json);
}

@freezed
class CreateReportDto with _$CreateReportDto {
  const factory CreateReportDto({
    required String title,
    required String description,
    required String address,
    required Location location,
    required int categoryId,
    required String departmentCode,
    ReportType? reportType,
    @Default([]) List<CreateReportMediaDto> reportMedias,
  }) = _CreateReportDto;
  factory CreateReportDto.fromJson(Map<String, dynamic> json) =>
      _$CreateReportDtoFromJson(json);
}
