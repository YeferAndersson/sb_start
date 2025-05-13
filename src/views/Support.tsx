import React, { useEffect } from 'react';
import { Meta } from '../@types/routes';
import TopSection from './support/TopSection';
import BodySection from './support/BodySection';
// import AdaptiveCard from '@/components/shared/AdaptiveCard'

// Importar los estilos CSS personalizados para artículos
import '../assets/styles/components/_article.css';

const Support = <T extends Meta>(props: T): React.ReactElement => {
  useEffect(() => {
    // Añadir clase al body para estilos globales
    document.body.classList.add('support-page');
    
    return () => {
      // Limpiar al desmontar
      document.body.classList.remove('support-page');
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 support-container">
      <TopSection />
      <BodySection />
    </div>
  );
};

export default Support;