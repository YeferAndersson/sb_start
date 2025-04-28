// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL y Anon Key deben estar definidos en las variables de entorno')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para los usuarios de nuestra tabla personalizada
export interface TblUsuario {
    id: number
    nombre: string
    apellido: string
    tipodocidentidad: string
    numdocidentidad: string
    correo: string
    CorreoGoogle: string | null
    pais: string
    direccion: string
    sexo: string
    telefono: string
    fechanacimiento: Date
    password: string | null
    rutafoto: string | null
    estado: number
    uuid: string | null
}

export interface DicServicio {
    id: number;
    nombre: string;
    descripcion: string;
    estado: number;
}

export interface UsuarioServicio {
    id: number;
    id_usuario: number;
    id_servicio: number;
    fecha_asignacion: string;
    estado: number;
    servicio?: DicServicio; // Para incluir los datos del servicio
}

// Funciones de autenticación personalizadas
export const findUsersByDocIdentity = async (tipoDoc: string, numDoc: string) => {
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .select('*')
        .eq('tipodocidentidad', tipoDoc)
        .eq('numdocidentidad', numDoc)
        .eq('estado', 1)

    if (error) {
        throw error
    }

    return data as TblUsuario[]
}

export const createNewUser = async (userData: Omit<TblUsuario, 'id'>) => {
    const formattedData = {
        ...userData,
        password: "SUPABASE_AUTH", // Valor fijo para usuarios autenticados con Supabase
        fechanacimiento: userData.fechanacimiento instanceof Date
            ? userData.fechanacimiento.toISOString().split('T')[0]
            : userData.fechanacimiento
    };

    console.log('Datos a insertar en tbl_usuarios:', formattedData);

    try {
        const { data, error } = await supabase
            .from('tbl_usuarios')
            .insert([formattedData])
            .select();

        if (error) {
            console.error('Error detallado al insertar usuario:', error);
            throw error;
        }

        return data[0] as TblUsuario;
    } catch (err) {
        console.error('Error al crear usuario:', err);
        throw err;
    }
}

// Función para actualizar usuario existente si es necesario
export const updateExistingUser = async (id: number, userData: Partial<TblUsuario>) => {
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .update(userData)
        .eq('id', id)
        .select()

    if (error) {
        throw error
    }

    return data[0] as TblUsuario
}

// Nueva función para obtener un usuario por su UUID de Supabase
export const getUserByUuid = async (uuid: string) => {
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .select('*')
        .eq('uuid', uuid)
        .single()

    if (error) {
        console.error('Error al buscar usuario por UUID:', error)
        throw error
    }

    return data as TblUsuario
}

// Funciones para obtener servicios de un usuario
export const getUserServices = async (userId: number) => {
    const { data, error } = await supabase
        .from('tbl_usuariosservicios')
        .select(`
        *,
        servicio:id_servicio(id, nombre, descripcion)
      `)
        .eq('id_usuario', userId)
        .eq('estado', 1);

    if (error) {
        console.error('Error al obtener servicios del usuario:', error);
        throw error;
    }

    return data as (UsuarioServicio & { servicio: DicServicio })[];
};



// TESISTAS //

// Interfaces para las tablas de diccionario
export interface DicFacultad {
    id: number;
    nombre: string;
    abreviatura: string;
    idarea: number;
    estado: number;
}

export interface DicCarrera {
    id: number;
    idfacultad: number;
    nombre: string;
    tieneespecialidades: number;
    estado: number;
    facultad?: DicFacultad; // Para incluir relación
}

export interface DicEspecialidad {
    id: number;
    idcarrera: number;
    nombre: string;
    denominacion: string | null;
    estado: number;
    fecha_reg: string;
    iddenominacion: number | null;
    carrera?: DicCarrera; // Para incluir relación
}

export interface Tesista {
    id: number;
    idusuario: number;
    codigoestudiante: string;
    idfacultad: number;
    idcarrera: number;
    idespecialidad: number | null;
    estado: number;
    usuario?: TblUsuario; // Para incluir relación
    facultad?: DicFacultad; // Para incluir relación
    carrera?: DicCarrera; // Para incluir relación
    especialidad?: DicEspecialidad; // Para incluir relación opcional
}

// Funciones para acceder a los datos
export const getFacultades = async () => {
    const { data, error } = await supabase
        .from('dic_facultades')
        .select('*')
        .eq('estado', 1)
        .order('nombre');

    if (error) throw error;
    return data as DicFacultad[];
};

export const getCarreras = async (facultadId?: number) => {
    let query = supabase
        .from('dic_carreras')
        .select('*, facultad:idfacultad(*)')
        .eq('estado', 1);

    if (facultadId) {
        query = query.eq('idfacultad', facultadId);
    }

    const { data, error } = await query.order('nombre');
    if (error) throw error;
    return data as (DicCarrera & { facultad: DicFacultad })[];
};

export const getEspecialidades = async (carreraId: number) => {
    const { data, error } = await supabase
        .from('dic_especialidades')
        .select('*, carrera:idcarrera(*)')
        .eq('idcarrera', carreraId)
        .eq('estado', 1)
        .order('nombre');

    if (error) throw error;
    return data as (DicEspecialidad & { carrera: DicCarrera })[];
};

export const getTesistaByUsuario = async (usuarioId: number) => {
    const { data, error } = await supabase
        .from('tbl_tesistas')
        .select(`
        *,
        usuario:idusuario(*),
        facultad:idfacultad(*),
        carrera:idcarrera(*),
        especialidad:idespecialidad(*)
      `)
        .eq('idusuario', usuarioId)
        .eq('estado', 1)
        .single();

    if (error) throw error;
    return data as (Tesista & {
        usuario: TblUsuario,
        facultad: DicFacultad,
        carrera: DicCarrera,
        especialidad: DicEspecialidad | null
    });
};

export const checkIsTesista = async (usuarioId: number) => {
    const { data, error } = await supabase
        .from('tbl_tesistas')
        .select('id')
        .eq('idusuario', usuarioId)
        .eq('estado', 1);

    if (error) throw error;
    return data && data.length > 0;
};

export const createTesista = async (tesistaData: Omit<Tesista, 'id' | 'estado'>) => {
    const { data, error } = await supabase
        .from('tbl_tesistas')
        .insert([{
            ...tesistaData,
            estado: 1
        }])
        .select();

    if (error) throw error;
    return data[0] as Tesista;
};


// TRAMITES //


export interface DicEstadoTramite {
    id: number;
    nombre: string;
    descripcion: string | null;
    estado: number;
}

export interface DicLineaVRI {
    id: number;
    nombre: string;
    estado: number;
}

export interface DicModalidad {
    id: number;
    descripcion: string;
    ruta: string | null;
    estado: number;
}

export interface Tramite {
    id: number;
    idtesista: number;
    codigo: string;
    anio: number;
    idestado: number;
    idlineavri: number;
    idmodalidad: number;
    tienecoasesorexterno: number;
    idfacultad: number;
    idcarrera: number;
    idespecialidad: number | null;
    tipotrabajo: string;
    fecharegistro: string;
    tesista?: Tesista; // Para incluir relación
    estado?: DicEstadoTramite; // Para incluir relación
    lineavri?: DicLineaVRI; // Para incluir relación
    modalidad?: DicModalidad; // Para incluir relación
    facultad?: DicFacultad; // Para incluir relación
    carrera?: DicCarrera; // Para incluir relación
    especialidad?: DicEspecialidad; // Para incluir relación opcional
}

// Función para generar código de trámite
export const generarCodigoTramite = async (anio: number) => {
    // Obtener el último código para ese año
    const { data, error } = await supabase
        .from('tbl_tramites')
        .select('codigo')
        .eq('anio', anio)
        .order('codigo', { ascending: false })
        .limit(1);

    if (error) throw error;

    let numeroTramite = 1;

    if (data && data.length > 0) {
        const ultimoCodigo = data[0].codigo;
        const partes = ultimoCodigo.split('-');
        if (partes.length === 2) {
            const ultimoNumero = parseInt(partes[1]);
            if (!isNaN(ultimoNumero)) {
                numeroTramite = ultimoNumero + 1;
            }
        }
    }

    // Formatear el número con ceros a la izquierda (ej: 001, 010, 100)
    const numeroFormateado = numeroTramite.toString().padStart(3, '0');
    return `${anio}-${numeroFormateado}`;
};

// Funciones para trabajar con trámites
export const getEstadosTramite = async () => {
    const { data, error } = await supabase
        .from('dic_estadostramite')
        .select('*')
        .eq('estado', 1)
        .order('id');

    if (error) throw error;
    return data as DicEstadoTramite[];
};

export const getLineasVRI = async () => {
    const { data, error } = await supabase
        .from('dic_lineasvri')
        .select('*')
        .eq('estado', 1)
        .order('nombre');

    if (error) throw error;
    return data as DicLineaVRI[];
};

export const getModalidades = async () => {
    const { data, error } = await supabase
        .from('dic_modalidades')
        .select('*')
        .eq('estado', 1);

    if (error) throw error;
    return data as DicModalidad[];
};

export const getTramitesByTesista = async (tesistaId: number) => {
    const { data, error } = await supabase
        .from('tbl_tramites')
        .select(`
        *,
        tesista:idtesista(*),
        estado:idestado(*),
        lineavri:idlineavri(*),
        modalidad:idmodalidad(*),
        facultad:idfacultad(*),
        carrera:idcarrera(*),
        especialidad:idespecialidad(*)
      `)
        .eq('idtesista', tesistaId)
        .order('fecharegistro', { ascending: false });

    if (error) throw error;
    return data as (Tramite & {
        tesista: Tesista,
        estado: DicEstadoTramite,
        lineavri: DicLineaVRI,
        modalidad: DicModalidad,
        facultad: DicFacultad,
        carrera: DicCarrera,
        especialidad: DicEspecialidad | null
    })[];
};

export const getTramiteById = async (tramiteId: number) => {
    const { data, error } = await supabase
        .from('tbl_tramites')
        .select(`
        *,
        tesista:idtesista(*),
        estado:idestado(*),
        lineavri:idlineavri(*),
        modalidad:idmodalidad(*),
        facultad:idfacultad(*),
        carrera:idcarrera(*),
        especialidad:idespecialidad(*)
      `)
        .eq('id', tramiteId)
        .single();

    if (error) throw error;
    return data as (Tramite & {
        tesista: Tesista,
        estado: DicEstadoTramite,
        lineavri: DicLineaVRI,
        modalidad: DicModalidad,
        facultad: DicFacultad,
        carrera: DicCarrera,
        especialidad: DicEspecialidad | null
    });
};

export const createTramite = async (tramiteData: Omit<Tramite, 'id' | 'codigo' | 'fecharegistro'>) => {
    // Generar código automáticamente
    const codigo = await generarCodigoTramite(tramiteData.anio);

    const { data, error } = await supabase
        .from('tbl_tramites')
        .insert([{
            ...tramiteData,
            codigo
        }])
        .select();

    if (error) throw error;
    return data[0] as Tramite;
};

export const updateEstadoTramite = async (tramiteId: number, nuevoEstadoId: number) => {
    const { data, error } = await supabase
        .from('tbl_tramites')
        .update({ idestado: nuevoEstadoId })
        .eq('id', tramiteId)
        .select();

    if (error) throw error;
    return data[0] as Tramite;
};