export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function paginate<T>(items: T[], total: number, page = 1, limit = 10): Paginated<T> {
  return {
    data: items,
    total,
    page,
    limit,
  };
}
