import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Department {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/reports/departments');
        const departmentsData = response.data?.data || [];
        // Departman verisini transform et
        const transformedDepartments = departmentsData
          .filter((dept: { isActive: boolean }) => dept.isActive) // Sadece aktif departmanlar
          .map(
            (dept: {
              id: number;
              name: string;
              description?: string;
              isActive: boolean;
            }) => ({
              id: dept.id,
              name: dept.name,
              description: dept.description,
              isActive: dept.isActive,
            })
          );

        setDepartments(transformedDepartments);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        setError('Departmanlar yüklenirken bir hata oluştu');
        // Fallback to default departments if API fails
        setDepartments([
          { id: 1, name: 'Genel İşler', isActive: true },
          { id: 2, name: 'Fen İşleri', isActive: true },
          { id: 3, name: 'Temizlik İşleri', isActive: true },
          { id: 4, name: 'Su ve Kanalizasyon', isActive: true },
          { id: 5, name: 'Elektrik İşleri', isActive: true },
          { id: 6, name: 'Park ve Bahçeler', isActive: true },
          { id: 7, name: 'Çevre Koruma', isActive: true },
          { id: 8, name: 'Temizlik Hizmetleri', isActive: true },
          { id: 9, name: 'Ulaşım Hizmetleri', isActive: true },
          { id: 10, name: 'Trafik Hizmetleri', isActive: true },
          { id: 11, name: 'Zabıta Müdürlüğü', isActive: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, loading, error };
};
