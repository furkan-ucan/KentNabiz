// lib/features/citizen/screens/citizen_dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart'; // Added for context.goNamed
import 'package:kentnabiz_mobile/features/auth/providers/auth_providers.dart'; // DÜZELTME: Bu import satırı kritik
import 'package:latlong2/latlong.dart'; // flutter_map'in kullandığı enlem/boylam paketi

class CitizenDashboardScreen extends StatelessWidget {
  const CitizenDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('KentNabız - Yakınımdakiler'),
        actions: [
          // DÜZELTME: Butonu Consumer içine alıp doğru provider'ı çağır
          Consumer(
            builder: (context, ref, child) {
              return IconButton(
                icon: const Icon(Icons.logout),
                tooltip: 'Çıkış Yap',
                onPressed: () {
                  ref.read(authControllerProvider).logout();
                },
              );
            },
          ),
        ],
      ),
      body: FlutterMap(
        options: const MapOptions(
          initialCenter: LatLng(37.0667, 37.3833), // Gaziantep merkez
          initialZoom: 13.0,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.kentnabiz.kentnabiz_mobile',
          ),
          // TODO: API'den gelen raporları Marker'lar olarak buraya ekleyeceğiz.
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Yeni rapor oluşturma sayfasına git
          context.goNamed('createReport');
        },
        label: const Text('Sorun Bildir'),
        icon: const Icon(Icons.add),
      ),
    );
  }
}
