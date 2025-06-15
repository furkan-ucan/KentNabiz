import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '../utils/auth';

/**
 * Kullanıcı değişikliklerini izler ve cache'i temizler
 * Supervisor hesabı değiştiğinde tüm ilgili cache'leri invalidate eder
 */
export const useAuthChangeDetection = () => {
  const queryClient = useQueryClient();
  const previousUserRef = useRef<string | number | null>(null);
  const previousDepartmentRef = useRef<string | number | null>(null);

  useEffect(() => {
    const checkUserChange = () => {
      const currentUser = getCurrentUser();
      const currentUserId = currentUser?.sub || null;
      const currentDepartmentId = currentUser?.departmentId || null;
      const previousUserId = previousUserRef.current;
      const previousDepartmentId = previousDepartmentRef.current;

      // İlk yükleme değilse ve kullanıcı ya da departman değiştiyse
      const userChanged =
        previousUserId !== null && previousUserId !== currentUserId;
      const departmentChanged =
        previousDepartmentId !== null &&
        previousDepartmentId !== currentDepartmentId;

      if (userChanged || departmentChanged) {
        console.log('User or department change detected, clearing cache...', {
          previousUser: previousUserId,
          currentUser: currentUserId,
          previousDepartment: previousDepartmentId,
          currentDepartment: currentDepartmentId,
        });

        // Tüm cache'i temizle - bu en etkili yöntem
        queryClient.clear();

        // Eğer yeni kullanıcı varsa, tüm ilgili query'leri invalidate et
        if (currentUserId) {
          // Supervisor reports query'lerini özellikle invalidate et
          queryClient.invalidateQueries({
            queryKey: ['supervisorReports'],
            refetchType: 'all',
          });

          // Dashboard verilerini de invalidate et
          queryClient.invalidateQueries({
            queryKey: ['dashboardData'],
            refetchType: 'all',
          });

          // Status counts query'sini invalidate et
          queryClient.invalidateQueries({
            queryKey: ['statusCounts'],
            refetchType: 'all',
          });
        }
      }

      // Mevcut kullanıcı ve departman bilgilerini sakla
      previousUserRef.current = currentUserId;
      previousDepartmentRef.current = currentDepartmentId;
    };

    // İlk kontrolü yap
    checkUserChange();

    // Auth eventi dinle
    const handleAuthCleared = () => {
      console.log('Auth cleared event received');
      queryClient.clear();
      previousUserRef.current = null;
      previousDepartmentRef.current = null;
    };

    const handleAuthSet = () => {
      console.log('Auth set event received');
      // Kısa bir gecikme ile kullanıcı değişikliğini kontrol et
      setTimeout(checkUserChange, 100);
    };

    // localStorage değişikliklerini dinle (başka tab'dan login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        setTimeout(checkUserChange, 100);
      }
    };

    // Event listener'ları ekle
    window.addEventListener('authCleared', handleAuthCleared);
    window.addEventListener('authSet', handleAuthSet);
    window.addEventListener('storage', handleStorageChange);

    // Periyodik kontrol (token'ın süresi dolmuş olabilir)
    const interval = setInterval(checkUserChange, 10000);

    return () => {
      window.removeEventListener('authCleared', handleAuthCleared);
      window.removeEventListener('authSet', handleAuthSet);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [queryClient]);
};
