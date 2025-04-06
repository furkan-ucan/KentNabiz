// packages/shared/src/types/report-category.types.ts

/**
 * Represents the shared data structure for a single Report Category.
 */
export interface SharedReportCategory {
  id: number;
  name: string;
  code: string;
  description?: string | null; // Match entity (nullable text)
  icon?: string | null; // Match entity (nullable varchar)
  parentId?: number | null; // Match entity (nullable)
  isActive: boolean;
  sortOrder: number;
  // Children array will be added in the Tree interface
}

/**
 * Represents the hierarchical structure of report categories,
 * commonly needed for UI elements like trees or nested dropdowns.
 */
export interface SharedCategoryTree extends SharedReportCategory {
  children: SharedCategoryTree[]; // Recursive definition for hierarchy
}
