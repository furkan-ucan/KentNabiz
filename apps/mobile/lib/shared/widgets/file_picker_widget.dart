import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import '../../core/logger_service.dart';

class FilePickerWidget extends StatelessWidget {
  final Function(File) onFilePicked;
  final bool isLoading;
  final List<String> acceptedTypes;
  final String? buttonText;
  final IconData? buttonIcon;

  const FilePickerWidget({
    super.key,
    required this.onFilePicked,
    this.isLoading = false,
    this.acceptedTypes = const ['*'],
    this.buttonText,
    this.buttonIcon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ElevatedButton.icon(
          onPressed: isLoading ? null : _pickFile,
          icon: isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Icon(buttonIcon ?? Icons.attach_file),
          label: Text(buttonText ?? 'Dosya Seç'),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _getAcceptedTypesText(),
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Future<void> _pickFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: _getFileType(),
        allowedExtensions: _getAllowedExtensions(),
        allowMultiple: false,
      );

      if (result != null && result.files.isNotEmpty) {
        final file = File(result.files.single.path!);
        onFilePicked(file);
      }
    } catch (e) {
      // Hata yönetimi UI tarafında yapılacak
      logger.e('File picker error: $e');
    }
  }

  FileType _getFileType() {
    if (acceptedTypes.contains('*')) {
      return FileType.any;
    }

    final hasImage = acceptedTypes.any((type) => type.startsWith('image/'));
    final hasVideo = acceptedTypes.any((type) => type.startsWith('video/'));
    final hasAudio = acceptedTypes.any((type) => type.startsWith('audio/'));

    if (hasImage && !hasVideo && !hasAudio) {
      return FileType.image;
    }
    if (hasVideo && !hasImage && !hasAudio) {
      return FileType.video;
    }
    if (hasAudio && !hasImage && !hasVideo) {
      return FileType.audio;
    }

    return FileType.custom;
  }

  List<String>? _getAllowedExtensions() {
    if (_getFileType() == FileType.custom) {
      return acceptedTypes
          .where((type) => !type.contains('/'))
          .map((type) => type.replaceAll('*', '').replaceAll('.', ''))
          .toList();
    }
    return null;
  }

  String _getAcceptedTypesText() {
    if (acceptedTypes.contains('*')) {
      return 'Tüm dosya türleri kabul edilir';
    }

    final types = <String>[];

    if (acceptedTypes.any((type) => type.startsWith('image/'))) {
      types.add('Resim');
    }
    if (acceptedTypes.any((type) => type.startsWith('video/'))) {
      types.add('Video');
    }
    if (acceptedTypes.any((type) => type.contains('pdf'))) {
      types.add('PDF');
    }
    if (acceptedTypes.any((type) => type.startsWith('audio/'))) {
      types.add('Ses');
    }

    if (types.isEmpty) {
      return 'Belirtilen dosya türleri kabul edilir';
    }

    return 'Kabul edilen türler: ${types.join(', ')}';
  }
}
