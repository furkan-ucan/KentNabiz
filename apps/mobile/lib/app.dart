// lib/app.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kentnabiz_mobile/core/router/app_router.dart';
import 'package:kentnabiz_mobile/features/auth/providers/auth_providers.dart';

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // YENİ MANTIK: Başlatıcı provider'ı izle
    final authInitializer = ref.watch(authInitializerProvider);
    final router = ref.watch(routerProvider);

    // Auth state'indeki değişiklikleri dinlemeye devam et
    ref.listen(authStateProvider, (_, __) => router.refresh());

    // MaterialApp.router'ı authInitializer'ın durumuna göre sarmala
    return authInitializer.when(
      // Başlangıç işlemi tamamlanana kadar Splash ekranını göster
      loading: () => const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(body: Center(child: CircularProgressIndicator())),
      ),
      // Hata olursa bir hata ekranı göster
      error: (err, stack) => MaterialApp(
        debugShowCheckedModeBanner: false,
        home:
            Scaffold(body: Center(child: Text('Uygulama başlatılamadı: $err'))),
      ),
      // Her şey yolundaysa, asıl uygulamayı (router ile) göster
      data: (_) => MaterialApp.router(
        title: 'KentNabız',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.teal,
          useMaterial3: true,
          scaffoldBackgroundColor: Colors.grey[50],
        ),
        routerConfig: router,
      ),
    );
  }
}
