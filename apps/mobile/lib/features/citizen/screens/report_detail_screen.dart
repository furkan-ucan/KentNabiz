// lib/features/citizen/screens/report_detail_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kentnabiz_mobile/features/citizen/providers/citizen_providers.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';
import 'package:kentnabiz_mobile/shared/widgets/authenticated_image.dart';

class ReportDetailScreen extends ConsumerWidget {
  // ConsumerWidget'a çevir
  const ReportDetailScreen({
    super.key,
    required this.reportId,
  });

  final int reportId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // WidgetRef'i ekle
    // İlgili raporun detayını provider'dan izle
    final reportAsync = ref.watch(reportDetailProvider(reportId));

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text('Rapor Detayı #$reportId'),
      ),
      body: reportAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Rapor yüklenemedi: $err')),
        data: (report) {
          // Veri başarıyla geldiğinde, detayları gösteren bir UI çiz
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Başlık
                Text(
                  report.title,
                  style: Theme.of(context)
                      .textTheme
                      .headlineSmall
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                // Durum ve Tarih
                Row(
                  children: [
                    Chip(label: Text(report.status?.toTurkish ?? 'Bilinmiyor')),
                    const Spacer(),
                    Text(
                      '${report.createdAt.day}.${report.createdAt.month}.${report.createdAt.year}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
                const Divider(height: 32),

                // Resimler (eğer varsa)
                if (report.reportMedias.isNotEmpty)
                  SizedBox(
                    height: 200,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: report.reportMedias.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: AuthenticatedImage(
                            fileName: report.reportMedias[index].url,
                            width: 200,
                            height: 200,
                            fit: BoxFit.cover,
                            borderRadius: BorderRadius.circular(12),
                            errorWidget: Container(
                              width: 200,
                              height: 200,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade200,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.broken_image_outlined,
                                      color: Colors.grey),
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
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                const SizedBox(height: 16),

                // Açıklama
                Text('Açıklama',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(report.description ?? 'Açıklama girilmemiş.'),

                const Divider(height: 32),

                // Konum
                Text('Konum', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(report.address ?? 'Adres belirtilmemiş.'),
                // TODO: Buraya küçük bir harita widget'ı eklenebilir.
              ],
            ),
          );
        },
      ),
    );
  }
}
