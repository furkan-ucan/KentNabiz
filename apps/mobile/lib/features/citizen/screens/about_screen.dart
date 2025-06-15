import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Hakkımızda',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Logo ve başlık kartı
            Card(
              elevation: 4,
              shadowColor: Colors.black12,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.blue[600]!,
                      Colors.blue[400]!,
                    ],
                  ),
                ),
                padding: const EdgeInsets.all(32),
                child: Column(
                  children: [
                    // Logo
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.location_city,
                        size: 40,
                        color: Colors.blue[600],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Uygulama adı
                    const Text(
                      'KentNabız',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Akıllı Şehir Raporlama Sistemi',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),

                    // Versiyon
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'Versiyon 1.0.0',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Açıklama kartı
            _buildInfoCard(
              title: 'Uygulama Hakkında',
              icon: Icons.info_outline,
              children: [
                const Text(
                  'KentNabız, vatandaşların şehirle ilgili karşılaştıkları sorunları kolayca bildirebilmelerini ve bu sorunların çözüm sürecini takip edebilmelerini sağlayan akıllı bir şehir raporlama sistemidir.',
                  style: TextStyle(fontSize: 16, height: 1.5),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Uygulama Özellikleri:',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                _buildFeatureItem('📍', 'Konum tabanlı rapor oluşturma'),
                _buildFeatureItem('📷', 'Fotoğraf ile rapor destekleme'),
                _buildFeatureItem(
                    '🗺️', 'Harita üzerinde yakındaki sorunları görme'),
                _buildFeatureItem('📊', 'Rapor durumu takibi'),
                _buildFeatureItem('🔔', 'Anlık bildirimler'),
              ],
            ),
            const SizedBox(height: 16),

            // İletişim kartı
            _buildInfoCard(
              title: 'İletişim',
              icon: Icons.contact_mail_outlined,
              children: [
                _buildContactItem(
                  icon: Icons.email_outlined,
                  title: 'E-posta',
                  value: 'info@kentnabiz.com',
                  onTap: () => _copyToClipboard(
                      context, 'info@kentnabiz.com', 'E-posta adresi'),
                ),
                const SizedBox(height: 12),
                _buildContactItem(
                  icon: Icons.phone_outlined,
                  title: 'Telefon',
                  value: '+90 (342) 123 45 67',
                  onTap: () => _copyToClipboard(
                      context, '+90 (342) 123 45 67', 'Telefon numarası'),
                ),
                const SizedBox(height: 12),
                _buildContactItem(
                  icon: Icons.web_outlined,
                  title: 'Web Sitesi',
                  value: 'www.kentnabiz.com',
                  onTap: () => _copyToClipboard(
                      context, 'www.kentnabiz.com', 'Web adresi'),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Yasal kartı
            _buildInfoCard(
              title: 'Yasal',
              icon: Icons.gavel_outlined,
              children: [
                _buildLegalItem(
                  title: 'Kullanım Koşulları',
                  onTap: () => _showTermsDialog(context),
                ),
                const SizedBox(height: 8),
                _buildLegalItem(
                  title: 'Gizlilik Politikası',
                  onTap: () => _showPrivacyDialog(context),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Geliştirici kartı
            _buildInfoCard(
              title: 'Geliştirici',
              icon: Icons.code_outlined,
              children: [
                const Text(
                  'Bu uygulama Gaziantep Büyükşehir Belediyesi ve yazılım ekibi tarafından geliştirilmiştir.',
                  style: TextStyle(fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 16),
                const Text(
                  '© 2025 Gaziantep Büyükşehir Belediyesi\nTüm hakları saklıdır.',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Card(
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: Colors.blue[600], size: 20),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureItem(String emoji, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactItem({
    required IconData icon,
    required String title,
    required String value,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Row(
          children: [
            Icon(icon, color: Colors.blue[600], size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.blue,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.open_in_new,
              color: Colors.grey[400],
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegalItem({
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.blue,
                ),
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: Colors.grey[400],
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  void _copyToClipboard(BuildContext context, String text, String label) async {
    await Clipboard.setData(ClipboardData(text: text));
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$label kopyalandı: $text')),
      );
    }
  }

  void _showTermsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text('Kullanım Koşulları'),
        content: const SingleChildScrollView(
          child: Text(
            '''KentNabız uygulamasını kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız:

1. Uygulama sadece yasal amaçlar için kullanılmalıdır.
2. Yanlış veya yanıltıcı bilgi paylaşılmamalıdır.
3. Başkalarının haklarına saygı gösterilmelidir.
4. Uygunsuz içerik paylaşılmamalıdır.

Bu koşullar değişiklik gösterebilir ve kullanıcılar güncel koşulları takip etmekle yükümlüdür.''',
            style: TextStyle(height: 1.5),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Kapat'),
          ),
        ],
      ),
    );
  }

  void _showPrivacyDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text('Gizlilik Politikası'),
        content: const SingleChildScrollView(
          child: Text(
            '''Kişisel verilerinizin korunması bizim için önemlidir:

• Toplanan Veriler: Ad, soyad, e-posta, konum bilgileri
• Kullanım Amacı: Rapor takibi ve iletişim
• Veri Paylaşımı: Üçüncü taraflarla paylaşılmaz
• Veri Güvenliği: Şifreleme ile korunur
• Veri Saklama: Yasal gereklilikler çerçevesinde

Detaylı bilgi için bizimle iletişime geçebilirsiniz.''',
            style: TextStyle(height: 1.5),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Kapat'),
          ),
        ],
      ),
    );
  }
}
