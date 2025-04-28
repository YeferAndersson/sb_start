// src/services/TramiteService.ts
import {
    getEstadosTramite,
    getLineasVRI,
    getModalidades,
    getTramitesByTesista,
    getTramiteById,
    createTramite,
    updateEstadoTramite,
    DicEstadoTramite,
    DicLineaVRI,
    DicModalidad,
    Tramite
} from '@/lib/supabase';

// Obtener todos los estados de trámite
export async function obtenerEstadosTramite() {
    try {
        return await getEstadosTramite();
    } catch (error) {
        console.error('Error al obtener estados de trámite:', error);
        throw error;
    }
}

// Obtener todas las líneas VRI
export async function obtenerLineasVRI() {
    try {
        return await getLineasVRI();
    } catch (error) {
        console.error('Error al obtener líneas VRI:', error);
        throw error;
    }
}

// Obtener todas las modalidades
export async function obtenerModalidades() {
    try {
        return await getModalidades();
    } catch (error) {
        console.error('Error al obtener modalidades:', error);
        throw error;
    }
}

// Obtener trámites por tesista
export async function obtenerTramitesPorTesista(tesistaId: number) {
    try {
        return await getTramitesByTesista(tesistaId);
    } catch (error) {
        console.error('Error al obtener trámites del tesista:', error);
        throw error;
    }
}

// Obtener un trámite por su ID
export async function obtenerTramitePorId(tramiteId: number) {
    try {
        return await getTramiteById(tramiteId);
    } catch (error) {
        console.error('Error al obtener trámite:', error);
        throw error;
    }
}

// Crear un nuevo trámite
export async function crearTramite(tramiteData: Omit<Tramite, 'id' | 'codigo' | 'fecharegistro'>) {
    try {
        return await createTramite(tramiteData);
    } catch (error) {
        console.error('Error al crear trámite:', error);
        throw error;
    }
}

// Actualizar el estado de un trámite
export async function actualizarEstadoTramite(tramiteId: number, nuevoEstadoId: number) {
    try {
        return await updateEstadoTramite(tramiteId, nuevoEstadoId);
    } catch (error) {
        console.error('Error al actualizar estado del trámite:', error);
        throw error;
    }
}