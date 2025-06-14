// lib/shared/models/report_category.dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart'; // ReportType enum'u için

part 'report_category.freezed.dart';
part 'report_category.g.dart';

@freezed
class ReportCategory with _$ReportCategory {
  const factory ReportCategory({
    required int id,
    required String name,
    required String code,
    String? icon,
    String? description,
    @Default([]) List<ReportCategory> children,
    ReportType? defaultReportType, // YENİ ALAN
  }) = _ReportCategory;

  factory ReportCategory.fromJson(Map<String, dynamic> json) =>
      _$ReportCategoryFromJson(json);
}
