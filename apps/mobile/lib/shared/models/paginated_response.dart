// lib/shared/models/paginated_response.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'paginated_response.freezed.dart';
part 'paginated_response.g.dart'; // EKSİK OLAN PART DİREKTİFİ

@Freezed(
    genericArgumentFactories: true) // Jenerik desteği için bu notasyon kritik
class PaginatedResponse<T> with _$PaginatedResponse<T> {
  const factory PaginatedResponse({
    required List<T> data,
    required int total,
    required int page,
    required int limit,
  }) = _PaginatedResponse<T>;

  // DÜZELTME: fromJsonT parametresini kaldırıyoruz.
  // `genericArgumentFactories: true` sayesinde build_runner bunu otomatik yönetecek.
  factory PaginatedResponse.fromJson(
          Map<String, dynamic> json, T Function(Object?) fromJsonT) =>
      _$PaginatedResponseFromJson(json, fromJsonT);
}
