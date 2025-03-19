import React from 'react';

export interface CardProps {
  /**
   * Kart başlığı
   */
  title?: string;

  /**
   * Kart içeriği
   */
  children: React.ReactNode;

  /**
   * Özel CSS sınıfı
   */
  className?: string;

  /**
   * Kart alt bölümü
   */
  footer?: React.ReactNode;

  /**
   * Kart köşe yuvarlama boyutu
   */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Kart gölge boyutu
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Tıklama olayı
   */
  onClick?: () => void;
}

/**
 * Genel amaçlı Card bileşeni
 */
export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  footer,
  borderRadius = 'md',
  shadow = 'sm',
  onClick,
}) => {
  // Stil sınıflarını oluştur
  const radiusClass = borderRadius !== 'none' ? `rounded-${borderRadius}` : '';
  const shadowClass = shadow !== 'none' ? `shadow-${shadow}` : '';

  return (
    <div
      className={`border border-gray-200 bg-white ${radiusClass} ${shadowClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {title && (
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">{footer}</div>}
    </div>
  );
};

export default Card;
