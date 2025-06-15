// lib/features/citizen/report_creation/screens/create_report_shell_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CreateReportShellScreen extends StatelessWidget {
  const CreateReportShellScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Yeni Sorun Bildirimi',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Ana icon
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.report_problem_outlined,
                size: 64,
                color: Colors.blue[600],
              ),
            ),
            const SizedBox(height: 24),

            // Başlık
            const Text(
              'Sorun Bildirimi Oluştur',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),

            // Açıklama
            Text(
              'Şehrimizle ilgili karşılaştığınız sorunları kolayca bildirebilir ve çözüm sürecini takip edebilirsiniz.',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),

            // Özellikler listesi
            _buildFeatureItem(
              icon: Icons.category_outlined,
              title: 'Kategori Seçimi',
              description: 'Uygun departman ve kategoriyi seçin',
            ),
            const SizedBox(height: 16),
            _buildFeatureItem(
              icon: Icons.edit_location_outlined,
              title: 'Detay ve Konum',
              description: 'Sorunu detaylı açıklayın ve konumu belirtin',
            ),
            const SizedBox(height: 16),
            _buildFeatureItem(
              icon: Icons.camera_alt_outlined,
              title: 'Görsel Ekleme',
              description: 'İsteğe bağlı olarak fotoğraf ekleyin',
            ),
            const SizedBox(height: 32),

            // Başlat butonu
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  context.goNamed('createReportCategory');
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.blue[600],
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Rapor Oluşturmaya Başla',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureItem({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.green[50],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            color: Colors.green[600],
            size: 20,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              Text(
                description,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
