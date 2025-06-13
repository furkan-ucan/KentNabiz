// lib/features/citizen/report_creation/screens/step1_category_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:kentnabiz_mobile/features/citizen/providers/citizen_providers.dart';
import 'package:kentnabiz_mobile/features/citizen/report_creation/providers/create_report_provider.dart';
import 'package:kentnabiz_mobile/shared/models/department.dart';

class CategoryScreen extends ConsumerStatefulWidget {
  const CategoryScreen({super.key});

  @override
  ConsumerState<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends ConsumerState<CategoryScreen> {
  @override
  void initState() {
    super.initState();
    // Bu ekrana her girildiğinde state'i sıfırla (eğer istenirse)
    // veya sadece çıkarken sıfırla.
  }

  @override
  void dispose() {
    // Bu ekrandan çıkıldığında (akış bittiğinde veya geri gidildiğinde)
    // rapor state'ini temizle.
    Future.microtask(() => ref.read(createReportProvider.notifier).reset());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final selectedDepartment = ref.watch(selectedDepartmentProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
            selectedDepartment == null ? 'Departman Seçin' : 'Kategori Seçin'),
        leading: selectedDepartment != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () =>
                    ref.read(selectedDepartmentProvider.notifier).state = null,
              )
            : null,
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: selectedDepartment == null
            ? const DepartmentList()
            : CategoryList(department: selectedDepartment),
      ),
    );
  }
}

class DepartmentList extends ConsumerWidget {
  const DepartmentList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final departmentsAsync = ref.watch(departmentsProvider);
    return departmentsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) =>
          Center(child: Text('Departmanlar yüklenemedi: $err')),
      data: (departments) => ListView.separated(
        itemCount: departments.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final department = departments[index];
          return ListTile(
            leading: const Icon(Icons.business_outlined, color: Colors.grey),
            title: Text(department.name),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              ref.read(selectedDepartmentProvider.notifier).state = department;
            },
          );
        },
      ),
    );
  }
}

class CategoryList extends ConsumerWidget {
  const CategoryList({super.key, required this.department});
  final Department department;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync =
        ref.watch(categoriesByDepartmentProvider(department.code));
    return categoriesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) =>
          Center(child: Text('Kategoriler yüklenemedi: $err')),
      data: (categories) => ListView.separated(
        itemCount: categories.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final category = categories[index];
          return ListTile(
            leading: Icon(Icons.category_outlined, color: Colors.grey.shade700),
            title: Text(category.name),
            subtitle: Text(category.description ?? ''),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              final notifier = ref.read(createReportProvider.notifier);
              notifier.setDepartment(department);
              notifier.setCategory(category);
              context.goNamed('createReportDetails'); // Sonraki adıma git
            },
          );
        },
      ),
    );
  }
}
