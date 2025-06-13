import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:kentnabiz_mobile/features/auth/providers/auth_providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Şimdilik mock user data kullanıyoruz
    final user = {
      'firstName': 'Ahmet',
      'lastName': 'Yılmaz',
      'email': 'ahmet.yilmaz@example.com',
      'createdAt': DateTime.now().subtract(const Duration(days: 30)),
    };

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Profilim',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // Profil düzenleme sayfasına git
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Profil düzenleme yakında eklenecek')),
              );
            },
          ),
        ],
      ),
      body: _buildProfileContent(context, ref, user),
    );
  }

  Widget _buildProfileContent(
      BuildContext context, WidgetRef ref, Map<String, dynamic> user) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Profil header kartı
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
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // Avatar
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
                      Icons.person,
                      size: 40,
                      color: Colors.blue[600],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Kullanıcı bilgileri
                  Text(
                    user['firstName'] != null && user['lastName'] != null
                        ? '${user['firstName']} ${user['lastName']}'
                        : user['email']?.split('@').first ?? 'Kullanıcı',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    user['email'] ?? 'E-posta bulunamadı',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Üyelik tarihi
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Üyelik: ${user['createdAt'] != null ? _formatDate(user['createdAt']!) : 'Bilinmiyor'}',
                      style: const TextStyle(
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

          // Menü seçenekleri
          _buildMenuSection(context, ref),

          const SizedBox(height: 24),

          // Çıkış butonu
          _buildLogoutButton(context, ref),
        ],
      ),
    );
  }

  Widget _buildMenuSection(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(left: 16, bottom: 8),
          child: Text(
            'Hesap',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.grey,
            ),
          ),
        ),
        Card(
          elevation: 2,
          shadowColor: Colors.black12,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              _buildMenuItem(
                icon: Icons.person_outline,
                title: 'Kişisel Bilgiler',
                subtitle: 'Ad, soyad ve iletişim bilgileri',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Kişisel bilgiler yakında eklenecek')),
                  );
                },
              ),
              _buildDivider(),
              _buildMenuItem(
                icon: Icons.history,
                title: 'Raporlarım',
                subtitle: 'Gönderdiğim raporları görüntüle',
                onTap: () {
                  context.goNamed('myReports');
                },
              ),
              _buildDivider(),
              _buildMenuItem(
                icon: Icons.notifications,
                title: 'Bildirimler',
                subtitle: 'Bildirim ayarları',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Bildirim ayarları yakında eklenecek')),
                  );
                },
              ),
              _buildDivider(),
              _buildMenuItem(
                icon: Icons.info_outline,
                title: 'Hakkımızda',
                subtitle: 'Uygulama bilgileri',
                onTap: () {
                  context.goNamed('about');
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.blue[50],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          color: Colors.blue[600],
          size: 20,
        ),
      ),
      title: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 16,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          color: Colors.grey[600],
          fontSize: 14,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: Colors.grey[400],
      ),
      onTap: onTap,
    );
  }

  Widget _buildDivider() {
    return Divider(
      height: 1,
      indent: 60,
      color: Colors.grey[200],
    );
  }

  Widget _buildLogoutButton(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.red[50],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            Icons.logout,
            color: Colors.red[600],
            size: 20,
          ),
        ),
        title: const Text(
          'Çıkış Yap',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 16,
            color: Colors.red,
          ),
        ),
        subtitle: Text(
          'Hesabınızdan güvenli şekilde çıkış yapın',
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 14,
          ),
        ),
        onTap: () {
          _showLogoutDialog(context, ref);
        },
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text('Çıkış Yap'),
        content: const Text(
            'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'İptal',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authControllerProvider).logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red[600],
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Çıkış Yap'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}.${date.month}.${date.year}';
  }
}
