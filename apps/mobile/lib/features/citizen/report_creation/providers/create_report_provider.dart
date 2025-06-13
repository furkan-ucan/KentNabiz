// lib/features/citizen/report_creation/providers/create_report_provider.dart
import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kentnabiz_mobile/features/citizen/providers/citizen_providers.dart';
import 'package:kentnabiz_mobile/features/citizen/report_creation/models/create_report_dto.dart';
import 'package:kentnabiz_mobile/features/citizen/report_creation/models/create_report_state.dart';
import 'package:kentnabiz_mobile/shared/models/department.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';
import 'package:kentnabiz_mobile/shared/models/report_category.dart';

// Provider tanımı (.autoDispose OLMADAN)
final createReportProvider =
    StateNotifierProvider<CreateReportNotifier, CreateReportState>((ref) {
  return CreateReportNotifier(ref);
});

class CreateReportNotifier extends StateNotifier<CreateReportState> {
  final Ref _ref;
  CreateReportNotifier(this._ref) : super(const CreateReportState());

  void setDepartment(Department department) =>
      state = state.copyWith(selectedDepartment: department);
  void setCategory(ReportCategory category) =>
      state = state.copyWith(selectedCategory: category);
  void addPhoto(File photo) =>
      state = state.copyWith(photos: [...state.photos, photo]);
  void removePhoto(File photo) => state = state.copyWith(
      photos: state.photos.where((p) => p.path != photo.path).toList());

  void updateDetails(
      {String? title,
      String? description,
      String? address,
      Location? location}) {
    state = state.copyWith(
      title: title,
      description: description,
      address: address,
      location: location,
    );
  }

  // State'i sıfırlamak için özel metod
  void reset() {
    state = const CreateReportState();
  }

  Future<bool> submitReport() async {
    state = state.copyWith(isSubmitting: true, error: null);

    try {
      final repository = _ref.read(citizenReportRepositoryProvider);

      // 1. ADIM: Resimleri yükle ve tam ReportMedia nesnelerini al.
      final uploadedMedias = await repository.uploadImages(state.photos);

      // 2. ADIM: Yüklenen medya nesnelerinden CreateReportMediaDto listesi oluştur.
      // Assuming CreateReportMediaDto is defined in create_report_dto.dart or imported elsewhere.
      final mediaDtos = uploadedMedias
          .map((media) =>
              CreateReportMediaDto(url: media.url, type: media.type ?? 'image'))
          .toList();

      // 3. ADIM: CreateReportDto'yu doğru alanlarla oluştur.
      final reportDto = CreateReportDto(
        title: state.title!,
        description: state.description ?? '',
        address: state.address ?? '',
        location: state.location!,
        categoryId: state.selectedCategory!.id,
        departmentCode: state.selectedDepartment!.code,
        reportType: state.selectedCategory
            ?.defaultReportType, // Opsiyonel, kategori varsayılanını alabiliriz
        reportMedias: mediaDtos, // DÜZELTME
      );

      // 4. ADIM: Raporu oluştur.
      await repository.createReport(reportDto);

      reset();
      return true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }
}
