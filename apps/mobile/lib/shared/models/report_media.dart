// apps/mobile/lib/shared/models/report_media.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'report_media.freezed.dart';
part 'report_media.g.dart';

@freezed
class ReportMedia with _$ReportMedia {
  const factory ReportMedia({
    required int id,
    required String url,

    // DÜZELTME:
    // Backend'den gelen JSON'daki 'mimetype' anahtarını
    // bu modeldeki 'type' alanına atamasını sağlıyoruz.
    // Eğer 'mimetype' yoksa, 'type' anahtarını arar.
    // İkisi de yoksa null olur.
    @JsonKey(name: 'mimetype') String? type,

    // Sunucudan gelebilecek diğer opsiyonel alanları da ekleyebiliriz.
    // Bu, gelecekteki olası hataları önler.
    String? filename,
    int? size,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _ReportMedia;

  factory ReportMedia.fromJson(Map<String, dynamic> json) =>
      _$ReportMediaFromJson(json);
}
