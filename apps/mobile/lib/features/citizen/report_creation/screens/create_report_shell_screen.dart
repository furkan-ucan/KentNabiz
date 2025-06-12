// lib/features/citizen/report_creation/screens/create_report_shell_screen.dart
import 'package:flutter/material.dart';

class CreateReportShellScreen extends StatelessWidget {
  const CreateReportShellScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Şimdilik sadece bir başlık ve geri butonu olan basit bir iskelet
    return Scaffold(
      appBar: AppBar(
        title: const Text('Yeni Sorun Bildirimi'),
      ),
      body: const Center(
        child: Text('Rapor oluşturma akışı burada başlayacak.'),
      ),
    );
  }
}
