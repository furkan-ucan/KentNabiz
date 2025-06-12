// lib/shared/models/report_media.dart
import 'package:freezed_annotation/freezed_annotation.dart';
part 'report_media.freezed.dart';
part 'report_media.g.dart';

@freezed
class ReportMedia with _$ReportMedia {
  const factory ReportMedia({
    required int id,
    required String url,
    String? type,
  }) = _ReportMedia;
  factory ReportMedia.fromJson(Map<String, dynamic> json) =>
      _$ReportMediaFromJson(json);
}
