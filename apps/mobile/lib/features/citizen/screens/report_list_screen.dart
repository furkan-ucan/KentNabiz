// lib/features/citizen/screens/report_list_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart'; // Added import for GoRouter
import 'package:kentnabiz_mobile/features/citizen/providers/citizen_providers.dart';
import 'package:kentnabiz_mobile/shared/models/report.dart';

class ReportListScreen extends ConsumerStatefulWidget {
  const ReportListScreen({super.key});

  @override
  ConsumerState<ReportListScreen> createState() => _ReportListScreenState();
}

class _ReportListScreenState extends ConsumerState<ReportListScreen> {
  ReportStatus? _selectedStatus;

  @override
  Widget build(BuildContext context) {
    final myReportsAsync = ref.watch(myReportsProvider(_selectedStatus));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Başvurularım'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(kToolbarHeight),
          child: Container(
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatusTab(context, 'Tümü', null),
                _buildStatusTab(context, 'Bekleyen', ReportStatus.open),
                _buildStatusTab(context, 'İşlemde', ReportStatus.inProgress),
                _buildStatusTab(context, 'Tamamlanan', ReportStatus.done),
              ],
            ),
          ),
        ),
      ),
      body: myReportsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Hata: $err')),
        data: (paginatedResponse) {
          // <-- Değişken adı
          final reports = paginatedResponse.data; // <-- .data'yı kullan

          if (reports.isEmpty) {
            return const Center(
                child: Text('Bu kategoride başvuru bulunmuyor.'));
          }

          return RefreshIndicator(
            onRefresh: () =>
                ref.refresh(myReportsProvider(_selectedStatus).future),
            child: ListView.builder(
              itemCount: reports.length,
              itemBuilder: (context, index) {
                final report = reports[index];
                return ReportCard(report: report);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusTab(
      BuildContext context, String text, ReportStatus? status) {
    final bool isActive = _selectedStatus == status;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedStatus = status),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16.0),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: isActive
                    ? Theme.of(context).primaryColor
                    : Colors.transparent,
                width: 3.0,
              ),
            ),
          ),
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isActive
                  ? Theme.of(context).primaryColor
                  : Colors.grey.shade700,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
}

class ReportCard extends StatelessWidget {
  const ReportCard({super.key, required this.report});
  final Report report;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        // DÜZELTME: goNamed yerine go kullanarak tam yolunu belirtiyoruz.
        context.go('/citizen/reports/${report.id}');
      },
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      report.title,
                      style: Theme.of(context)
                          .textTheme
                          .titleMedium
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ),
                  Chip(
                    label: Text(report.status?.toTurkish ?? 'BİLİNMİYOR',
                        style: const TextStyle(
                            fontSize: 10, fontWeight: FontWeight.bold)),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    backgroundColor: Colors.blue.shade50,
                    side: BorderSide.none,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (report.reportMedias.isNotEmpty &&
                  report.reportMedias.first.url.isNotEmpty)
                ClipRRect(
                  borderRadius: BorderRadius.circular(8.0),
                  child: Image.network(
                    report.reportMedias.first.url,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, progress) =>
                        progress == null
                            ? child
                            : const Center(
                                heightFactor: 2,
                                child: CircularProgressIndicator()),
                    errorBuilder: (context, error, stackTrace) => Container(
                        height: 160,
                        color: Colors.grey.shade200,
                        child: const Icon(Icons.broken_image_outlined,
                            color: Colors.grey)),
                  ),
                ),
              const SizedBox(height: 12),
              Text(report.address ?? 'Adres belirtilmemiş',
                  style: Theme.of(context).textTheme.bodySmall),
              const Divider(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '#${report.id}',
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: Colors.grey.shade600),
                  ),
                  Text(
                    '${report.createdAt.day}.${report.createdAt.month}.${report.createdAt.year}',
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: Colors.grey.shade600),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
