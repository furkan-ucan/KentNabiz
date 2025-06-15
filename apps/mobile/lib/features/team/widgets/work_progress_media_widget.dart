import 'package:flutter/material.dart';
import '../models/team_report.dart';

class WorkProgressMediaWidget extends StatelessWidget {
  final WorkProgressMedia media;

  const WorkProgressMediaWidget({
    super.key,
    required this.media,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Row(
        children: [
          Icon(
            _getMediaIcon(media.type),
            color: _getMediaColor(media.type),
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  media.filename,
                  style: const TextStyle(
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (media.description != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    media.description!,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 2),
                Text(
                  _formatDate(media.uploadedAt),
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.visibility, size: 20),
                onPressed: () => _previewMedia(context, media),
                tooltip: 'Önizle',
                constraints: const BoxConstraints(
                  minWidth: 32,
                  minHeight: 32,
                ),
                padding: EdgeInsets.zero,
              ),
              IconButton(
                icon: const Icon(Icons.download, size: 20),
                onPressed: () => _downloadMedia(context, media),
                tooltip: 'İndir',
                constraints: const BoxConstraints(
                  minWidth: 32,
                  minHeight: 32,
                ),
                padding: EdgeInsets.zero,
              ),
            ],
          ),
        ],
      ),
    );
  }

  IconData _getMediaIcon(String type) {
    switch (type.toLowerCase()) {
      case 'image':
        return Icons.image;
      case 'video':
        return Icons.videocam;
      case 'document':
        return Icons.description;
      case 'pdf':
        return Icons.picture_as_pdf;
      default:
        return Icons.attach_file;
    }
  }

  Color _getMediaColor(String type) {
    switch (type.toLowerCase()) {
      case 'image':
        return Colors.green;
      case 'video':
        return Colors.red;
      case 'document':
        return Colors.blue;
      case 'pdf':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  void _previewMedia(BuildContext context, WorkProgressMedia media) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(media.filename),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (media.type.toLowerCase() == 'image')
              Image.network(
                media.url,
                errorBuilder: (context, error, stackTrace) => const Center(
                  child: Text('Resim yüklenemedi'),
                ),
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return const Center(child: CircularProgressIndicator());
                },
              )
            else
              Column(
                children: [
                  Icon(
                    _getMediaIcon(media.type),
                    size: 64,
                    color: _getMediaColor(media.type),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Bu dosya türü önizlenemiyor.',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    onPressed: () => _downloadMedia(context, media),
                    icon: const Icon(Icons.download),
                    label: const Text('İndir'),
                  ),
                ],
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Kapat'),
          ),
        ],
      ),
    );
  }

  void _downloadMedia(BuildContext context, WorkProgressMedia media) {
    // TODO: Implement download functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${media.filename} indiriliyor...'),
      ),
    );
  }
}
