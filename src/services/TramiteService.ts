// src/services/TramiteService.ts - Corregido
import {
    getEtapas,
    getSublineasVri,
    getModalidades,
    getTipoTrabajos,
    getTramitesByTesista,
    getTramiteById,
    createTramite,
    updateTramiteEtapa,
    type DicEtapa,
    type TblSublineaVri,
    type DicModalidad,
    type DicTipoTrabajo,
    type TblTramite,
    type TblTramiteInsert
} from '@/lib/supabase';

// Obtener todas las etapas
export async function obtenerEtapas(): Promise<DicEtapa[]> {
    try {
        return await getEtapas();
    } catch (error) {
        console.error('Error al obtener etapas:', error);
        throw error;
    }
}

// Obtener todas las sublíneas VRI
export async function obtenerSublineasVri(carreraId?: number) {
    try {
        return await getSublineasVri(carreraId);
    } catch (error) {
        console.error('Error al obtener sublíneas VRI:', error);
        throw error;
    }
}

// Obtener todas las modalidades
export async function obtenerModalidades(): Promise<DicModalidad[]> {
    try {
        return await getModalidades();
    } catch (error) {
        console.error('Error al obtener modalidades:', error);
        throw error;
    }
}

// Obtener todos los tipos de trabajo
export async function obtenerTipoTrabajos(): Promise<DicTipoTrabajo[]> {
    try {
        return await getTipoTrabajos();
    } catch (error) {
        console.error('Error al obtener tipos de trabajo:', error);
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
export async function crearTramite(tramiteData: TblTramiteInsert): Promise<TblTramite> {
    try {
        return await createTramite(tramiteData);
    } catch (error) {
        console.error('Error al crear trámite:', error);
        throw error;
    }
}

// Actualizar el estado de un trámite
export async function actualizarEtapaTramite(tramiteId: number, nuevaEtapaId: number): Promise<TblTramite> {
    try {
        return await updateTramiteEtapa(tramiteId, nuevaEtapaId);
    } catch (error) {
        console.error('Error al actualizar etapa del trámite:', error);
        throw error;
    }
}