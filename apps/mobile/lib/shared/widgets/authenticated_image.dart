import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kentnabiz_mobile/core/api/api_client.dart';
import 'package:kentnabiz_mobile/core/secure_storage_service.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  final storageService = SecureStorageService();
  return ApiClient(storageService);
});

/// Authorization token ile birlikte resim yükleyen widget
class AuthenticatedImage extends ConsumerWidget {
  const AuthenticatedImage({
    super.key,
    required this.fileName,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.placeholder,
    this.errorWidget,
  });

  final String fileName;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final Widget? placeholder;
  final Widget? errorWidget;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final apiClient = ref.watch(apiClientProvider);

    return FutureBuilder<Uint8List>(
      future: _loadImageBytes(apiClient, fileName),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return _buildPlaceholder();
        }

        if (snapshot.hasError || !snapshot.hasData) {
          return _buildErrorWidget();
        }

        final imageWidget = Image.memory(
          snapshot.data!,
          width: width,
          height: height,
          fit: fit,
        );

        if (borderRadius != null) {
          return ClipRRect(
            borderRadius: borderRadius!,
            child: imageWidget,
          );
        }

        return imageWidget;
      },
    );
  }

  Future<Uint8List> _loadImageBytes(
      ApiClient apiClient, String fileName) async {
    try {
      final response = await apiClient.getMediaFile(fileName);
      return Uint8List.fromList(response.data);
    } catch (e) {
      throw Exception('Failed to load image: $e');
    }
  }

  Widget _buildPlaceholder() {
    if (placeholder != null) return placeholder!;

    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: borderRadius,
      ),
      child: const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }

  Widget _buildErrorWidget() {
    if (errorWidget != null) return errorWidget!;

    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: borderRadius,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.broken_image_outlined, color: Colors.grey),
          const SizedBox(height: 4),
          Text(
            'Resim yüklenemedi',
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
