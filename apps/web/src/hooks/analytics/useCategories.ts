import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string;
  departmentId: number;
  isActive: boolean;
}

interface UseCategoriesOptions {
  departmentId?: number | null;
}

export const useCategories = (options?: UseCategoriesOptions) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { departmentId } = options || {};

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Önce tüm kategorileri çek
        const response = await api.get('/report-categories');

        // API'den gelen verinin yapısı: { data: [...] }
        const categoriesData = response.data?.data || response.data || [];

        if (!Array.isArray(categoriesData)) {
          throw new Error('Categories data is not an array');
        }

        // Kategori verisini transform et
        let transformedCategories = categoriesData.map(
          (cat: {
            id: number;
            name: string;
            code: string;
            description?: string;
            departmentId: number;
            isActive: boolean;
          }) => ({
            id: cat.id,
            name: cat.name,
            code: cat.code,
            description: cat.description,
            departmentId: cat.departmentId,
            isActive: cat.isActive,
          })
        );

        // Departman ID'sine göre filtrele (frontend tarafında)
        if (departmentId) {
          transformedCategories = transformedCategories.filter(
            cat => cat.departmentId === departmentId
          );
        }

        setCategories(transformedCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Kategoriler yüklenirken bir hata oluştu');
        // Fallback to default categories if API fails
        let fallbackCategories = [
          {
            id: 1,
            name: 'Altyapı',
            code: 'INFRASTRUCTURE',
            departmentId: 2,
            isActive: true,
          },
          {
            id: 2,
            name: 'Ulaşım',
            code: 'TRANSPORT',
            departmentId: 9,
            isActive: true,
          },
          {
            id: 3,
            name: 'Çevre',
            code: 'ENVIRONMENT',
            departmentId: 7,
            isActive: true,
          },
          {
            id: 4,
            name: 'Güvenlik',
            code: 'SECURITY',
            departmentId: 11,
            isActive: true,
          },
          {
            id: 5,
            name: 'Sosyal Hizmetler',
            code: 'SOCIAL',
            departmentId: 1,
            isActive: true,
          },
        ];

        // Fallback kategorileri de departmana göre filtrele
        if (departmentId) {
          fallbackCategories = fallbackCategories.filter(
            cat => cat.departmentId === departmentId
          );
        }

        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [departmentId]);

  return { categories, loading, error };
};
