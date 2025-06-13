// lib/features/citizen/report_creation/providers/create_report_provider.dart
import 'dart:io';
import 'package:dio/dio.dart'; // Added for DioException
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kentnabiz_mobile/features/citizen/providers/citizen_providers.dart';
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

  void reset() {
    state = const CreateReportState();
  }

  Future<bool> submitReport() async {
    state = state.copyWith(isSubmitting: true, error: null);

    // Gerekli alanların dolu olup olmadığını kontrol et
    if (state.title == null ||
        state.title!.isEmpty ||
        state.description == null ||
        state.description!.isEmpty ||
        state.address == null ||
        state.address!.isEmpty ||
        state.location == null ||
        state.selectedCategory == null ||
        state.selectedDepartment == null) {
      state = state.copyWith(
          isSubmitting: false, error: "Lütfen tüm zorunlu alanları doldurun.");
      return false;
    }

    try {
      final repository = _ref.read(citizenReportRepositoryProvider);

      // 1. Resimleri yükle
      final uploadedMedias = await repository.uploadImages(state.photos);

      // 2. YÜKLENEN MEDYALARI DOĞRU DTO FORMATINA DÖNÜŞTÜR
      final mediaDtos = uploadedMedias.map((media) {
        // Backend'in CreateReportMediaDto'su 'url' ve 'type' bekliyor.
        return {
          'url': media.url,
          'type': media.type ?? 'image/jpeg',
        };
      }).toList();

      // 3. RAPOR DATASINI OLUŞTUR
      final reportData = {
        'title': state.title!,
        'description': state.description!,
        'address': state.address!,
        // Backend LocationDto beklediği için doğrudan latitude ve longitude'u içeren bir map gönderiyoruz.
        'location': {
          'latitude': state.location!.latitude,
          'longitude': state.location!.longitude,
        },
        'categoryId': state.selectedCategory!.id,
        'departmentCode': state.selectedDepartment!.code,
        // reportType backend'de @IsOptional, bu yüzden null olabilir.
        // _convertReportTypeToString null döndürebildiği için bu güvenli.
        'reportType': _convertReportTypeToString(
            state.selectedCategory?.defaultReportType),
        // reportMedias backend'de @IsOptional
        'reportMedias': mediaDtos,
      };

      // 4. Veriyi gönder
      await repository.createReport(reportData);

      // Başarılı olunca state'i sıfırla ve true dön
      state = state.copyWith(
          isSubmitting: false,
          error: null); // Başarılı olunca eski hatayı temizle
      reset(); // Formu temizle
      return true;
    } on DioException catch (e) {
      // API'den gelen validasyon hatasını yakala ve göster
      final responseData = e.response?.data;
      String errorMessage = e.message ?? "Bir ağ hatası oluştu.";
      if (responseData is Map && responseData.containsKey('message')) {
        final messages = responseData['message'];
        if (messages is List) {
          errorMessage = messages.join('\n');
        } else {
          errorMessage = messages.toString();
        }
      }
      state = state.copyWith(isSubmitting: false, error: errorMessage);
      return false;
    } catch (e) {
      // Diğer tüm hataları yakala
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }

  // YENİ VE TAM YARDIMCI METOT
  String? _convertReportTypeToString(ReportType? type) {
    if (type == null) return null;
    switch (type) {
      case ReportType.pothole:
        return 'POTHOLE';
      case ReportType.sidewalkDamage:
        return 'SIDEWALK_DAMAGE';
      case ReportType.roadDamage:
        return 'ROAD_DAMAGE';
      case ReportType.roadSign:
        return 'ROAD_SIGN';
      case ReportType.roadMarking:
        return 'ROAD_MARKING';
      case ReportType.trafficLight:
        return 'TRAFFIC_LIGHT';
      case ReportType.roadBlock:
        return 'ROAD_BLOCK';
      case ReportType.streetLight:
        return 'STREET_LIGHT';
      case ReportType.electricityOutage:
        return 'ELECTRICITY_OUTAGE';
      case ReportType.waterLeakage:
        return 'WATER_LEAKAGE';
      case ReportType.drainageBlockage:
        return 'DRAINAGE_BLOCKAGE';
      case ReportType.sewerLeakage:
        return 'SEWER_LEAKAGE';
      case ReportType.garbageCollection:
        return 'GARBAGE_COLLECTION';
      case ReportType.litter:
        return 'LITTER';
      case ReportType.dumping:
        return 'DUMPING';
      case ReportType.graffiti:
        return 'GRAFFITI';
      case ReportType.airPollution:
        return 'AIR_POLLUTION';
      case ReportType.parkDamage:
        return 'PARK_DAMAGE';
      case ReportType.treeIssue:
        return 'TREE_ISSUE';
      case ReportType.publicTransport:
        return 'PUBLIC_TRANSPORT';
      case ReportType.publicTransportStop:
        return 'PUBLIC_TRANSPORT_STOP';
      case ReportType.parkingViolation:
        return 'PARKING_VIOLATION';
      case ReportType.trafficCongestion:
        return 'TRAFFIC_CONGESTION';
      case ReportType.animalControl:
        return 'ANIMAL_CONTROL';
      case ReportType.noiseComplaint:
        return 'NOISE_COMPLAINT';
      case ReportType.other:
        return 'OTHER';
      case ReportType.unknown:
        return null;
    }
  }
}
