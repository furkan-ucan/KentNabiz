// apps/web/src/hooks/useDashboardStats.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { isAuthenticated } from '../utils/auth';

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  myReports: number;
  averageResolutionTime: number; // gün cinsinden
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(
        '🔍 Starting fetchStats, isAuthenticated:',
        isAuthenticated()
      );

      if (!isAuthenticated()) {
        // Authenticated olmayan kullanıcılar için mock data
        const mockData = {
          totalReports: 1247,
          pendingReports: 89,
          resolvedReports: 1158,
          myReports: 0,
          averageResolutionTime: 7,
        };
        console.log('🎭 Using mock data for unauthenticated user:', mockData);
        setStats(mockData);
        return;
      }
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_BASE_URL}/report-analytics/dashboard-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('📊 Dashboard stats response:', response.data);

      // API response'da data wrapper var mı kontrol et
      const statsData = response.data.data || response.data;
      console.log('📊 Processed stats data:', statsData);

      setStats(statsData);
    } catch (err) {
      console.error('Dashboard stats fetch error:', err);
      setError('İstatistikler yüklenirken hata oluştu');

      // Hata durumunda fallback data
      setStats({
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        myReports: 0,
        averageResolutionTime: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
};
