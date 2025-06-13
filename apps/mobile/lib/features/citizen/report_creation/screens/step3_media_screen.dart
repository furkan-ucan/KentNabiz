// lib/features/citizen/report_creation/screens/step3_media_screen.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart'; // Added import
import 'package:image_picker/image_picker.dart';
import 'package:kentnabiz_mobile/features/citizen/report_creation/providers/create_report_provider.dart';

class MediaSelectionScreen extends ConsumerWidget {
  const MediaSelectionScreen({super.key});

  Future<void> _pickImage(ImageSource source, WidgetRef ref) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 80);

    if (pickedFile != null) {
      ref.read(createReportProvider.notifier).addPhoto(File(pickedFile.path));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final photos = ref.watch(createReportProvider).photos;

    return Scaffold(
      appBar: AppBar(title: const Text('Görsel Ekle (Opsiyonel)')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Seçilen resimlerin önizlemesi
            Expanded(
              child: photos.isEmpty
                  ? const Center(child: Text('Henüz görsel eklenmedi.'))
                  : GridView.builder(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                      ),
                      itemCount: photos.length,
                      itemBuilder: (context, index) {
                        return Stack(
                          children: [
                            Image.file(photos[index],
                                fit: BoxFit.cover,
                                width: double.infinity,
                                height: double.infinity),
                            Positioned(
                              top: 0,
                              right: 0,
                              child: IconButton(
                                icon: const CircleAvatar(
                                    backgroundColor: Colors.black54,
                                    child: Icon(Icons.close,
                                        color: Colors.white, size: 16)),
                                onPressed: () => ref
                                    .read(createReportProvider.notifier)
                                    .removePhoto(photos[index]),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
            ),
            const SizedBox(height: 16),
            // Butonlar
            Row(
              children: [
                Expanded(
                    child: ElevatedButton.icon(
                        onPressed: () => _pickImage(ImageSource.camera, ref),
                        icon: const Icon(Icons.camera_alt_outlined),
                        label: const Text('Kamera'))),
                const SizedBox(width: 16),
                Expanded(
                    child: ElevatedButton.icon(
                        onPressed: () => _pickImage(ImageSource.gallery, ref),
                        icon: const Icon(Icons.photo_library_outlined),
                        label: const Text('Galeri'))),
              ],
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                // Önizleme ekranına git
                context.goNamed('createReportPreview');
              },
              style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50)),
              child: const Text('Raporu Önizle'),
            ),
          ],
        ),
      ),
    );
  }
}
