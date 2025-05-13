import React from 'react';
import {
  TbDeviceAnalytics,
  TbAdjustments,
  TbCloudComputing,
  TbExchange,
  TbFileAnalytics,
  TbMessageQuestion,
  TbUser,
  TbAffiliate,
  TbPassword,
  TbLock,
  TbBriefcase,
  TbDeviceDesktop
} from 'react-icons/tb';

// Función para obtener el icono mediante el nombre
export const getIconComponent = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case 'getting-started': return <TbDeviceAnalytics />;
    case 'account-settings': return <TbUser />;
    case 'data-management': return <TbFileAnalytics />;
    case 'security': return <TbLock />;
    case 'integrations': return <TbExchange />;
    case 'api': return <TbCloudComputing />;
    case 'troubleshooting': return <TbAdjustments />;
    case 'faq': return <TbMessageQuestion />;
    case 'billing': return <TbAffiliate />;
    case 'passwords': return <TbPassword />;
    case 'privacy': return <TbLock />;
    case 'features': return <TbBriefcase />;
    case 'devices': return <TbDeviceDesktop />;
    default: return <TbMessageQuestion />;
  }
};

export const categoryLabel: Record<string, string> = {
  'getting-started': 'Comenzando',
  'account-settings': 'Configuración de Cuenta',
  'data-management': 'Gestión de Datos',
  'security': 'Seguridad',
  'integrations': 'Integraciones',
  'api': 'API',
  'troubleshooting': 'Solución de Problemas',
  'faq': 'Preguntas Frecuentes',
  'billing': 'Facturación',
  'passwords': 'Contraseñas',
  'privacy': 'Privacidad',
  'features': 'Características',
  'devices': 'Dispositivos'
};