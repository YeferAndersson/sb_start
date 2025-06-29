// src/services/TesistaService.ts - Corregido
import {
    getFacultades,
    getCarreras,
    getEspecialidades,
    getTesistaByUsuario,
    checkIsTesista,
    createTesista,
    type DicFacultad,
    type DicCarrera,
    type DicEspecialidad,
    type TblTesista,
    type TblTesistaInsert
} from '@/lib/supabase';

// Obtener todas las facultades
export async function obtenerFacultades(): Promise<DicFacultad[]> {
    try {
        return await getFacultades();
    } catch (error) {
        console.error('Error al obtener facultades:', error);
        throw error;
    }
}

// Obtener carreras por facultad
export async function obtenerCarreras(facultadId?: number) {
    try {
        return await getCarreras(facultadId);
    } catch (error) {
        console.error('Error al obtener carreras:', error);
        throw error;
    }
}

// Obtener especialidades por carrera
export async function obtenerEspecialidades(carreraId: number) {
    try {
        return await getEspecialidades(carreraId);
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        throw error;
    }
}

// Verificar si un usuario es tesista
export async function verificarEsTesista(usuarioId: number): Promise<boolean> {
    try {
        return await checkIsTesista(usuarioId);
    } catch (error) {
        console.error('Error al verificar si es tesista:', error);
        throw error;
    }
}

// Obtener datos de tesista por ID de usuario
export async function obtenerTesistaPorUsuario(usuarioId: number) {
    try {
        return await getTesistaByUsuario(usuarioId);
    } catch (error) {
        console.error('Error al obtener datos del tesista:', error);
        throw error;
    }
}

// Registrar nuevo tesista
export async function registrarTesista(tesistaData: TblTesistaInsert): Promise<TblTesista> {
    try {
        return await createTesista(tesistaData);
    } catch (error) {
        console.error('Error al registrar tesista:', error);
        throw error;
    }
}