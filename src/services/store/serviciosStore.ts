// src/store/serviciosStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserService, apiGetMyServices } from '@/services/ServicioService';

interface ServiciosState {
  userServices: UserService[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchUserServices: () => Promise<void>;
  hasService: (idServicio: number) => boolean;
  addService: (service: UserService) => void;
  reset: () => void;
}

export const useServiciosStore = create<ServiciosState>()(
  persist(
    (set, get) => ({
      userServices: [],
      isLoading: false,
      hasLoaded: false,
      error: null,
      
      fetchUserServices: async () => {
        if (get().isLoading) return;
        
        set({ isLoading: true, error: null });
        try {
          const response = await apiGetMyServices();
          console.log("Respuesta completa de apiGetMyServices:", response);
          
          if (response && response.services && Array.isArray(response.services)) {
            set({ 
              userServices: response.services,
              hasLoaded: true 
            });
          } else {
            console.warn("Formato de respuesta inesperado:", response);
            set({ 
              userServices: [], 
              hasLoaded: true 
            });
          }
        } catch (error) {
          console.error('Error al obtener servicios:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Error desconocido al cargar servicios',
            hasLoaded: true 
          });
        } finally {
          set({ isLoading: false });
        }
      },
      
      hasService: (idServicio: number) => {
        return get().userServices.some(service => 
          (service.pivot && service.pivot.IdServicio === idServicio) || 
          (service.Id === idServicio)
        );
      },
      
      addService: (service: UserService) => {
        // Verificar si ya existe este servicio
        const exists = get().userServices.some(s => 
          (s.pivot && service.pivot && s.pivot.IdServicio === service.pivot.IdServicio && 
           s.pivot.Codigo === service.pivot.Codigo) ||
          (s.Id === service.Id)
        );
        
        if (!exists) {
          set(state => ({
            userServices: [...state.userServices, service]
          }));
        }
      },
      
      reset: () => set({ 
        userServices: [], 
        hasLoaded: false,
        error: null 
      }),
    }),
    {
      name: 'user-services',
      partialize: (state) => ({ 
        userServices: state.userServices,
        hasLoaded: state.hasLoaded 
      }),
    }
  )
);