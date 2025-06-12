// lib/features/citizen/report_creation/screens/step1_category_selection_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kentnabiz_mobile/features/citizen/providers/citizen_providers.dart';
import 'package:kentnabiz_mobile/shared/models/department.dart';
import 'package:kentnabiz_mobile/shared/models/report_category.dart';

class CategorySelectionScreen extends ConsumerWidget {
  const CategorySelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Kullanıcının seçtiği departmanı izle
    final selectedDepartment = ref.watch(selectedDepartmentProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
            selectedDepartment == null ? 'Departman Seçin' : 'Kategori Seçin'),
        // Eğer bir departman seçildiyse, geri dönüp değiştirmesine izin ver
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
            ? const DepartmentList() // Departman seçilmemişse listeyi göster
            : CategoryList(
                department:
                    selectedDepartment), // Seçilmişse kategorileri göster
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
      data: (departments) => ListView.builder(
        itemCount: departments.length,
        itemBuilder: (context, index) {
          final department = departments[index];
          return ListTile(
            leading: const Icon(Icons.business_outlined),
            title: Text(department.name),
            onTap: () {
              // Seçilen departmanı state'e ata
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
      data: (categories) => ListView.builder(
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          return ListTile(
            leading: const Icon(Icons.category_outlined),
            title: Text(category.name),
            subtitle: Text(category.description ?? ''),
            onTap: () {
              // Seçilen kategoriyi state'e ata ve sonraki adıma git
              ref.read(selectedCategoryProvider.notifier).state = category;
              // TODO: GoRouter ile bir sonraki adıma yönlendir
              print(
                  'Seçilen Departman: ${department.name}, Kategori: ${category.name}');
            },
          );
        },
      ),
    );
  }
}
