import React from 'react';
// Örnek paylaşılan enum importu (path alias testi için)
import { UserRole } from '@KentNabiz/shared';
// Örnek paylaşılan UI component importu (path alias ve workspace testi için)
// import { Button } from '@KentNabiz/ui'; // Şimdilik bu yorumda kalsın, packages/ui/src/index.ts'de Button export edilince aktifleşir

const HomePage: React.FC = () => {
  console.log('UserRole from shared:', UserRole.CITIZEN);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>KentNabız Web Arayüzüne Hoş Geldiniz!</h1>
      <p>Temel yapılandırma tamamlandı ve geliştirme başlıyor.</p>
      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
        }}
      >
        <p>
          <strong>✅ Path Alias Testi:</strong> UserRole.CITIZEN ={' '}
          {UserRole.CITIZEN}
        </p>
        <p>
          <strong>✅ Monorepo Entegrasyonu:</strong> @KentNabiz/shared paketi
          başarıyla import edildi!
        </p>
      </div>
      {/* <Button onClick={() => alert('Paylaşılan Buton Çalışıyor!')}>Test Butonu</Button> */}
    </div>
  );
};

export default HomePage;
