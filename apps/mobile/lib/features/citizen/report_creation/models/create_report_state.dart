// lib/features/citizen/report_creation/models/create_report_state.dart
import 'dart:io'; // Already imported
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:kentnabiz_mobile/shared/models/department.dart';
import 'package:kentnabiz_mobile/shared/models/report_category.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';

part 'create_report_state.freezed.dart';

@freezed
class CreateReportState with _$CreateReportState {
  const factory CreateReportState({
    // Adım 1
    Department? selectedDepartment,
    ReportCategory? selectedCategory,
    // Adım 2
    String? title,
    String? description,
    String? address,
    Location? location,
    // Adım 3
    @Default([]) List<File> photos, // Already exists
    // Akışın kendi durumu
    @Default(false) bool isSubmitting, // Changed from isLoading
    String? error, // Already exists
  }) = _CreateReportState;
}
