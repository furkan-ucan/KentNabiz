import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/team_providers.dart';

class TeamFilterWidget extends ConsumerWidget {
  const TeamFilterWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentFilter = ref.watch(teamReportFilterProvider);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.filter_list, size: 20),
          const SizedBox(width: 8),
          const Text(
            'Filtrele:',
            style: TextStyle(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Wrap(
              spacing: 8,
              children: [
                _buildFilterChip(
                  ref,
                  'Tümü',
                  null,
                  currentFilter == null,
                ),
                _buildFilterChip(
                  ref,
                  'Yüksek Öncelik',
                  'high',
                  currentFilter == 'high',
                ),
                _buildFilterChip(
                  ref,
                  'Acil',
                  'urgent',
                  currentFilter == 'urgent',
                ),
                _buildFilterChip(
                  ref,
                  'Bugün',
                  'today',
                  currentFilter == 'today',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(
    WidgetRef ref,
    String label,
    String? value,
    bool isSelected,
  ) {
    return FilterChip(
      label: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          color: isSelected ? Colors.white : Colors.grey[700],
        ),
      ),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          ref.read(teamReportFilterProvider.notifier).state = value;
        } else {
          ref.read(teamReportFilterProvider.notifier).state = null;
        }
      },
      selectedColor: Theme.of(ref.context).primaryColor,
      backgroundColor: Colors.grey[100],
      checkmarkColor: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}
