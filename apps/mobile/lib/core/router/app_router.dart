// lib/core/router/app_router.dart

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kentnabiz_mobile/features/auth/providers/auth_providers.dart';
import 'package:kentnabiz_mobile/features/auth/screens/login_screen.dart';
import 'package:kentnabiz_mobile/features/citizen/screens/about_screen.dart';
import 'package:kentnabiz_mobile/features/citizen/screens/citizen_dashboard_screen.dart';
import 'package:kentnabiz_mobile/features/citizen/screens/citizen_shell_screen.dart';
import 'package:kentnabiz_mobile/features/citizen/screens/profile_screen.dart';
import 'package:kentnabiz_mobile/features/citizen/screens/report_list_screen.dart';
import 'package:kentnabiz_mobile/features/citizen/screens/report_detail_screen.dart'; // Added import
import 'package:kentnabiz_mobile/shared/models/user.dart';
import 'package:kentnabiz_mobile/features/citizen/report_creation/screens/step1_category_selection_screen.dart';

// --- ÖRNEK EKİP ÜYESİ EKRANI ---
class TeamMemberHomeScreen extends ConsumerWidget {
  const TeamMemberHomeScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
        appBar: AppBar(title: const Text('Ekip Paneli')),
        body: Center(
          child: ElevatedButton(
            onPressed: () => ref.read(authControllerProvider).logout(),
            child: const Text("Çıkış Yap"),
          ),
        ));
  }
}

// --- ANA ROUTER PROVIDER'I ---
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    redirect: (BuildContext context, GoRouterState state) {
      final authState = ref.read(authStateProvider);
      final status = authState.status;
      final role = authState.primaryRole;

      // 1. Uygulama başlatılıyor, splash'te kal.
      if (status == AuthStatus.initial) {
        return state.matchedLocation == '/splash' ? null : '/splash';
      }

      final isLoggedIn = status == AuthStatus.authenticated;
      final currentLocation = state.matchedLocation;

      // 2. Kullanıcı giriş yapmışsa
      if (isLoggedIn) {
        // Hedef rotayı belirle
        String targetRoute;
        if (role == UserRole.citizen) {
          targetRoute = '/citizen/dashboard';
        } else if (role == UserRole.teamMember) {
          targetRoute = '/team/home';
        } else {
          targetRoute = '/login'; // Bilinmeyen rol, login'e gönder
        }

        // Eğer kullanıcı login veya splash ekranında takılı kalmışsa, hedefe yönlendir.
        if (currentLocation == '/login' || currentLocation == '/splash') {
          return targetRoute;
        }
      }
      // 3. Kullanıcı giriş yapmamışsa
      else {
        // Eğer korumalı bir sayfaya gitmeye çalışıyorsa, login'e yönlendir.
        if (currentLocation != '/login') {
          return '/login';
        }
      }

      // 4. Diğer tüm durumlarda yönlendirme yapma.
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) =>
            const Scaffold(body: Center(child: CircularProgressIndicator())),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),

      // Vatandaş için ana iskelet ve sekmeleri
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            CitizenShellScreen(navigationShell: navigationShell),
        branches: [
          // 1. Dal: Yakınımdakiler (Dashboard)
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/citizen/dashboard',
              builder: (context, state) => const CitizenDashboardScreen(),
            ),
          ]),
          // 2. Dal: Başvurularım ve Detayı
          StatefulShellBranch(
            routes: [
              // Ana liste sayfası
              GoRoute(
                path: '/citizen/reports',
                name: 'citizenReports', // İsim vermek, geçişleri kolaylaştırır
                builder: (context, state) => const ReportListScreen(),
                // YENİ: Detay sayfasını buraya alt rota olarak ekliyoruz
                routes: [
                  GoRoute(
                    path: ':reportId', // Sadece parametreyi yazıyoruz
                    name: 'reportDetail',
                    builder: (context, state) {
                      final reportId =
                          int.parse(state.pathParameters['reportId']!);
                      return ReportDetailScreen(reportId: reportId);
                    },
                  ),
                ],
              ),
            ],
          ),
          // 3. Dal: Profilim
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/citizen/profile',
              builder: (context, state) => const ProfileScreen(),
            ),
          ]),
          // 4. Dal: Bilgi
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/citizen/about',
              builder: (context, state) => const AboutScreen(),
            ),
          ]),
        ],
      ),
      // Ekip üyesi için rota
      GoRoute(
        path: '/team/home',
        name: 'teamHome',
        builder: (context, state) => const TeamMemberHomeScreen(),
      ),
      // YENİ RAPOR OLUŞTURMA ROTASI
      GoRoute(
        path: '/citizen/create-report',
        name: 'createReport',
        builder: (context, state) => const CategorySelectionScreen(),
      ),
    ],
  );
});
