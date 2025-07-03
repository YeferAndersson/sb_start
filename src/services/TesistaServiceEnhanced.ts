// src/services/TesistaServiceEnhanced.ts
import { supabase, type TblTesista, type TblTesistaInsert, type TblEstructuraAcademica } from '@/lib/supabase'

export interface TesistaCareerData {
    id: number
    tesistaId: number
    codigo_estudiante: string
    estructuraAcademica: {
        id: number
        carrera: {
            id: number
            nombre: string
        }
        especialidad: {
            id: number
            nombre: string
        }
        facultad: {
            id: number
            nombre: string
            abreviatura: string
        }
        sede: {
            id: number
            nombre: string
        }
    }
}

export interface AddTesistaServiceData {
    studentCode: string
    idEstructuraAcademica: number // Cambiado de idCarrera a idEstructuraAcademica
    nombres: string
    apellidos: string
    numDocIdentidad: string
    semestreActual?: number
    totalSemestre?: number
    dicEstructuraAcademica: string 
    correoInstitucional?: string
    numeroCelular?: string
}

/**
 * Agrega el servicio de tesista para un usuario
 */
export async function addTesistaService(
    userId: number, 
    studentData: AddTesistaServiceData
): Promise<{ success: boolean; tesistaId: number; isFirstCareer: boolean }> {
    try {
        // 1. Verificar si ya existe un servicio de tesista activo
        const { data: existingTesistas, error: checkError } = await supabase
            .from('tbl_tesistas')
            .select('id, id_estructura_academica')
            .eq('id_usuario', userId)
            .eq('estado', 1) // Cambiado de estado_tesista a estado

        if (checkError) {
            console.error('Error verificando tesistas existentes:', checkError)
            throw new Error('Error al verificar servicios existentes')
        }

        const isFirstCareer = !existingTesistas || existingTesistas.length === 0

        // 2. Verificar que la estructura académica existe
        const { data: estructuraAcademica, error: estructuraError } = await supabase
            .from('tbl_estructura_academica')
            .select('id, estado_ea')
            .eq('id', studentData.idEstructuraAcademica)
            .eq('estado_ea', 1)
            .single()

        if (estructuraError || !estructuraAcademica) {
            console.error('Error verificando estructura académica:', estructuraError)
            throw new Error('La estructura académica especificada no existe o está inactiva')
        }

        // 3. Crear registro en tbl_tesistas
        const newTesistaData: TblTesistaInsert = {
            id_usuario: userId,
            id_estructura_academica: studentData.idEstructuraAcademica,
            codigo_estudiante: studentData.studentCode,
            estado: 1 // Cambiado de estado_tesista a estado
        }

        const { data: newTesista, error: insertError } = await supabase
            .from('tbl_tesistas')
            .insert([newTesistaData])
            .select()
            .single()

        if (insertError) {
            console.error('Error creando tesista:', insertError)
            throw new Error('Error al crear el registro de tesista')
        }

        // 4. Si es la primera carrera, agregar en tbl_usuarios_servicios
        if (isFirstCareer) {
            const { error: serviceError } = await supabase
                .from('tbl_usuarios_servicios')
                .insert([{
                    id_usuario: userId,
                    id_servicio: 1, // ID del servicio tesista
                    fecha_asignacion: new Date().toISOString(),
                    estado: 1
                }])

            if (serviceError) {
                console.error('Error agregando servicio:', serviceError)
                // Rollback: eliminar el tesista creado
                await supabase
                    .from('tbl_tesistas')
                    .delete()
                    .eq('id', newTesista.id)
                
                throw new Error('Error al asignar el servicio de tesista')
            }
        }

        console.log('✅ Servicio de tesista agregado exitosamente:', {
            tesistaId: newTesista.id,
            estructuraAcademica: studentData.idEstructuraAcademica,
            isFirstCareer
        })

        return {
            success: true,
            tesistaId: newTesista.id,
            isFirstCareer
        }

    } catch (error) {
        console.error('❌ Error en addTesistaService:', error)
        throw error
    }
}

/**
 * Obtiene todas las carreras de tesista para un usuario
 */
export async function getTesistaCareersByUser(userId: number): Promise<TesistaCareerData[]> {
    try {
        const { data, error } = await supabase
            .from('tbl_tesistas')
            .select(`
                id,
                codigo_estudiante,
                estructura_academica:id_estructura_academica(
                    id,
                    carrera:id_carrera(
                        id,
                        nombre
                    ),
                    especialidad:id_especialidad(
                        id,
                        nombre
                    ),
                    facultad:id_facultad(
                        id,
                        nombre,
                        abreviatura
                    ),
                    sede:id_sede(
                        id,
                        nombre
                    )
                )
            `)
            .eq('id_usuario', userId)
            .eq('estado', 1)
            .order('id', { ascending: false })

        if (error) {
            console.error('Error obteniendo carreras de tesista:', error)
            throw new Error('Error al obtener las carreras de tesista')
        }

        // ✅ AGREGAR ESTE DEBUG AQUÍ:
        console.log('🔍 RAW SUPABASE DATA:', data);
        data.forEach((item, index) => {
            console.log(`📊 Item ${index}:`);
            console.log(`  - Tesista ID: ${item.id}`);
            console.log(`  - Código: ${item.codigo_estudiante}`);
            console.log(`  - Estructura Real ID: ${item.estructura_academica?.id}`);
            console.log(`  - Carrera ID: ${item.estructura_academica?.carrera?.id}`);
            console.log(`  - Carrera Nombre: ${item.estructura_academica?.carrera?.nombre}`);
            console.log('  - Estructura completa:', item.estructura_academica);
        });

        // Transformar la data al formato esperado
        const careers: TesistaCareerData[] = data
            .filter(item => item.estructura_academica)
            .map(item => ({
                id: item.id,
                tesistaId: item.id,
                codigo_estudiante: item.codigo_estudiante,
                estructuraAcademica: {
                    id: item.estructura_academica.id,
                    carrera: {
                        id: item.estructura_academica.carrera?.id || 0,
                        nombre: item.estructura_academica.carrera?.nombre || 'Sin carrera'
                    },
                    especialidad: {
                        id: item.estructura_academica.especialidad?.id || 0,
                        nombre: item.estructura_academica.especialidad?.nombre || 'Sin especialidad'
                    },
                    facultad: {
                        id: item.estructura_academica.facultad?.id || 0,
                        nombre: item.estructura_academica.facultad?.nombre || 'Sin facultad',
                        abreviatura: item.estructura_academica.facultad?.abreviatura || ''
                    },
                    sede: {
                        id: item.estructura_academica.sede?.id || 0,
                        nombre: item.estructura_academica.sede?.nombre || 'Sin sede'
                    }
                }
            }))

        console.log('📚 Carreras de tesista obtenidas:', careers.length)
        return careers

    } catch (error) {
        console.error('❌ Error en getTesistaCareersByUser:', error)
        throw error
    }
}

/**
 * Verifica si un usuario tiene el servicio de tesista
 */
export async function checkUserHasTesistaService(userId: number): Promise<{ 
    hasService: boolean; 
    careerCount: number;
    careers: TesistaCareerData[]
}> {
    try {
        const careers = await getTesistaCareersByUser(userId)
        
        return {
            hasService: careers.length > 0,
            careerCount: careers.length,
            careers
        }
    } catch (error) {
        console.error('❌ Error en checkUserHasTesistaService:', error)
        return {
            hasService: false,
            careerCount: 0,
            careers: []
        }
    }
}

/**
 * Obtiene información detallada de una carrera de tesista específica
 */
export async function getTesistaCareerDetails(tesistaId: number): Promise<TesistaCareerData | null> {
    try {
        const { data, error } = await supabase
            .from('tbl_tesistas')
            .select(`
                id,
                codigo_estudiante,
                estructura_academica:id_estructura_academica(
                    id,
                    carrera:id_carrera(
                        id,
                        nombre
                    ),
                    especialidad:id_especialidad(
                        id,
                        nombre
                    ),
                    facultad:id_facultad(
                        id,
                        nombre,
                        abreviatura
                    ),
                    sede:id_sede(
                        id,
                        nombre
                    )
                )
            `)
            .eq('id', tesistaId)
            .eq('estado', 1) // Cambiado de estado_tesista a estado
            .single()

        if (error || !data.estructura_academica) {
            console.error('Error obteniendo detalles de carrera:', error)
            return null
        }

        return {
            id: data.id,
            tesistaId: data.id,
            codigo_estudiante: data.codigo_estudiante,
            estructuraAcademica: {
                id: data.estructura_academica.id,
                carrera: {
                    id: data.estructura_academica.carrera?.id || 0,
                    nombre: data.estructura_academica.carrera?.nombre || 'Sin carrera'
                },
                especialidad: {
                    id: data.estructura_academica.especialidad?.id || 0,
                    nombre: data.estructura_academica.especialidad?.nombre || 'Sin especialidad'
                },
                facultad: {
                    id: data.estructura_academica.facultad?.id || 0,
                    nombre: data.estructura_academica.facultad?.nombre || 'Sin facultad',
                    abreviatura: data.estructura_academica.facultad?.abreviatura || ''
                },
                sede: {
                    id: data.estructura_academica.sede?.id || 0,
                    nombre: data.estructura_academica.sede?.nombre || 'Sin sede'
                }
            }
        }
    } catch (error) {
        console.error('❌ Error en getTesistaCareerDetails:', error)
        return null
    }
}

/**
 * Obtiene todas las estructuras académicas disponibles para selección
 */
export async function getAvailableEstructurasAcademicas(): Promise<{
    id: number
    nombre: string | null
    carrera: { id: number; nombre: string }
    especialidad: { id: number; nombre: string }
    facultad: { id: number; nombre: string; abreviatura: string }
    sede: { id: number; nombre: string }
}[]> {
    try {
        const { data, error } = await supabase
            .from('tbl_estructura_academica')
            .select(`
                id,
                nombre,
                carrera:id_carrera(
                    id,
                    nombre
                ),
                especialidad:id_especialidad(
                    id,
                    nombre
                ),
                facultad:id_facultad(
                    id,
                    nombre,
                    abreviatura
                ),
                sede:id_sede(
                    id,
                    nombre
                )
            `)
            .eq('estado_ea', 1)
            .order('id', { ascending: true })

        if (error) {
            console.error('Error obteniendo estructuras académicas:', error)
            throw new Error('Error al obtener las estructuras académicas')
        }

        return data
            .filter(item => item.carrera && item.especialidad && item.facultad && item.sede)
            .map(item => ({
                id: item.id,
                nombre: item.nombre,
                carrera: {
                    id: item.carrera!.id,
                    nombre: item.carrera!.nombre
                },
                especialidad: {
                    id: item.especialidad!.id,
                    nombre: item.especialidad!.nombre
                },
                facultad: {
                    id: item.facultad!.id,
                    nombre: item.facultad!.nombre,
                    abreviatura: item.facultad!.abreviatura
                },
                sede: {
                    id: item.sede!.id,
                    nombre: item.sede!.nombre
                }
            }))

    } catch (error) {
        console.error('❌ Error en getAvailableEstructurasAcademicas:', error)
        throw error
    }
}

/**
 * Actualiza el tesista activo en el store local (para UI)
 */
export function setActiveTesistaCareer(careerData: TesistaCareerData): void {
    // Almacenar en localStorage para persistencia
    localStorage.setItem('active-tesista-career', JSON.stringify(careerData))
    
    // Disparar evento personalizado para que los componentes se actualicen
    window.dispatchEvent(new CustomEvent('tesista-career-changed', { 
        detail: careerData 
    }))
    
    console.log('📌 Carrera activa establecida:', careerData.estructuraAcademica.carrera.nombre)
}

/**
 * Obtiene la carrera activa del tesista desde el store local
 */
export function getActiveTesistaCareer(): TesistaCareerData | null {
    try {
        const stored = localStorage.getItem('active-tesista-career')
        return stored ? JSON.parse(stored) : null
    } catch (error) {
        console.error('Error obteniendo carrera activa:', error)
        return null
    }
}

/**
 * Limpia la carrera activa del store local
 */
export function clearActiveTesistaCareer(): void {
    localStorage.removeItem('active-tesista-career')
    window.dispatchEvent(new CustomEvent('tesista-career-changed', { 
        detail: null 
    }))
}