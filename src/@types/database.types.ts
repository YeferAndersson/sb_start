export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dic_acciones: {
        Row: {
          descripcion: string
          id: number
          id_etapa_pertenencia: number | null
          nombre: string
        }
        Insert: {
          descripcion: string
          id: number
          id_etapa_pertenencia?: number | null
          nombre: string
        }
        Update: {
          descripcion?: string
          id?: number
          id_etapa_pertenencia?: number | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dic_acciones_id_etapa_pertenencia_dic_etapas_id"
            columns: ["id_etapa_pertenencia"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
        ]
      }
      dic_areas_ocde: {
        Row: {
          estado_area: number
          id: number
          nombre: string
        }
        Insert: {
          estado_area?: number
          id: number
          nombre: string
        }
        Update: {
          estado_area?: number
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      dic_carreras: {
        Row: {
          estado_carrera: number
          id: number
          id_facultad: number
          nombre: string
        }
        Insert: {
          estado_carrera?: number
          id: number
          id_facultad: number
          nombre: string
        }
        Update: {
          estado_carrera?: number
          id?: number
          id_facultad?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dic_carreras_id_facultad_dic_facultades_id"
            columns: ["id_facultad"]
            isOneToOne: false
            referencedRelation: "dic_facultades"
            referencedColumns: ["id"]
          },
        ]
      }
      dic_denominaciones: {
        Row: {
          denominacion_actual: number
          id: number
          id_carrera: number
          id_especialidad: number
          nombre: string
        }
        Insert: {
          denominacion_actual: number
          id: number
          id_carrera: number
          id_especialidad: number
          nombre: string
        }
        Update: {
          denominacion_actual?: number
          id?: number
          id_carrera?: number
          id_especialidad?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dic_denominaciones_id_carrera_dic_carreras_id"
            columns: ["id_carrera"]
            isOneToOne: false
            referencedRelation: "dic_carreras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dic_denominaciones_id_especialidad_dic_especialidades_id"
            columns: ["id_especialidad"]
            isOneToOne: false
            referencedRelation: "dic_especialidades"
            referencedColumns: ["id"]
          },
        ]
      }
      dic_disciplinas: {
        Row: {
          estado_disciplina: number
          id: number
          id_subarea: number
          nombre: string
        }
        Insert: {
          estado_disciplina?: number
          id: number
          id_subarea: number
          nombre: string
        }
        Update: {
          estado_disciplina?: number
          id?: number
          id_subarea?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dic_disciplinas_id_subarea_dic_subareas_ocde_id"
            columns: ["id_subarea"]
            isOneToOne: false
            referencedRelation: "dic_subareas_ocde"
            referencedColumns: ["id"]
          },
        ]
      }
      dic_especialidades: {
        Row: {
          estado_especialidad: number
          id: number
          id_carrera: number | null
          nombre: string
        }
        Insert: {
          estado_especialidad?: number
          id: number
          id_carrera?: number | null
          nombre: string
        }
        Update: {
          estado_especialidad?: number
          id?: number
          id_carrera?: number | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dic_especialidades_id_carrera_dic_carreras_id"
            columns: ["id_carrera"]
            isOneToOne: false
            referencedRelation: "dic_carreras"
            referencedColumns: ["id"]
          },
        ]
      }
      dic_etapas: {
        Row: {
          descripcion: string
          id: number
          nombre: string
        }
        Insert: {
          descripcion: string
          id: number
          nombre: string
        }
        Update: {
          descripcion?: string
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      dic_facultades: {
        Row: {
          abreviatura: string
          estado_facultad: number
          id: number
          id_area: number
          nombre: string
        }
        Insert: {
          abreviatura: string
          estado_facultad?: number
          id: number
          id_area: number
          nombre: string
        }
        Update: {
          abreviatura?: string
          estado_facultad?: number
          id?: number
          id_area?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dic_facultades_id_area_dic_areas_ocde_id"
            columns: ["id_area"]
            isOneToOne: false
            referencedRelation: "dic_areas_ocde"
            referencedColumns: ["id"]
          },
        ]
      }
      dic_lineas_universidad: {
        Row: {
          estado_linea_universidad: number
          id: number
          nombre: string
        }
        Insert: {
          estado_linea_universidad?: number
          id: number
          nombre: string
        }
        Update: {
          estado_linea_universidad?: number
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      dic_modalidades: {
        Row: {
          descripcion: string
          estado_modalidad: number
          id: number
          ruta: string
        }
        Insert: {
          descripcion: string
          estado_modalidad?: number
          id?: number
          ruta: string
        }
        Update: {
          descripcion?: string
          estado_modalidad?: number
          id?: number
          ruta?: string
        }
        Relationships: []
      }
      dic_nivel_admins: {
        Row: {
          descripcion: string
          id: number
          nombre: string
        }
        Insert: {
          descripcion: string
          id: number
          nombre: string
        }
        Update: {
          descripcion?: string
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      dic_sedes: {
        Row: {
          estado_sede: number | null
          id: number
          nombre: string
        }
        Insert: {
          estado_sede?: number | null
          id?: number
          nombre: string
        }
        Update: {
          estado_sede?: number | null
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      dic_servicios: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string
        }
        Insert: {
          descripcion?: string | null
          id?: number
          nombre: string
        }
        Update: {
          descripcion?: string | null
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      dic_subareas_ocde: {
        Row: {
          estado_subarea: number
          id: number
          id_area: number
          nombre: string
        }
        Insert: {
          estado_subarea?: number
          id: number
          id_area: number
          nombre: string
        }
        Update: {
          estado_subarea?: number
          id?: number
          id_area?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dic_subareas_ocde_id_area_dic_areas_ocde_id"
            columns: ["id_area"]
            isOneToOne: false
            referencedRelation: "dic_areas_ocde"
            referencedColumns: ["id"]
          },
        ]
      }
      dic_tipo_archivo: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string
        }
        Insert: {
          descripcion?: string | null
          id: number
          nombre: string
        }
        Update: {
          descripcion?: string | null
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      dic_tipo_trabajos: {
        Row: {
          detalle: string
          estado_tipo_trabajo: number
          id: number
          nombre: string
        }
        Insert: {
          detalle: string
          estado_tipo_trabajo?: number
          id?: number
          nombre: string
        }
        Update: {
          detalle?: string
          estado_tipo_trabajo?: number
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      dic_visto_bueno: {
        Row: {
          descripcion: string
          id: number
          id_etapa: number
        }
        Insert: {
          descripcion: string
          id: number
          id_etapa: number
        }
        Update: {
          descripcion?: string
          id?: number
          id_etapa?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_dic_visto_bueno_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
        ]
      }
      log_acciones: {
        Row: {
          fecha: string
          id: number
          id_accion: number
          id_etapa: number
          id_tramite: number
          id_usuario: number
          mensaje: string | null
        }
        Insert: {
          fecha?: string
          id?: number
          id_accion: number
          id_etapa: number
          id_tramite: number
          id_usuario: number
          mensaje?: string | null
        }
        Update: {
          fecha?: string
          id?: number
          id_accion?: number
          id_etapa?: number
          id_tramite?: number
          id_usuario?: number
          mensaje?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_log_acciones_id_accion_dic_acciones_id"
            columns: ["id_accion"]
            isOneToOne: false
            referencedRelation: "dic_acciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_log_acciones_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_log_acciones_id_tramite_tbl_tramites_id"
            columns: ["id_tramite"]
            isOneToOne: false
            referencedRelation: "tbl_tramites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_log_acciones_id_usuario_tbl_usuarios_id"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_admins: {
        Row: {
          cargo: string
          estado_admin: number
          id: number
          id_usuario: number
          nivel_admin: number
        }
        Insert: {
          cargo: string
          estado_admin?: number
          id?: number
          id_usuario: number
          nivel_admin: number
        }
        Update: {
          cargo?: string
          estado_admin?: number
          id?: number
          id_usuario?: number
          nivel_admin?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_admins_id_usuario_tbl_usuarios_id"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_admins_nivel_admin_dic_nivel_admins_id"
            columns: ["nivel_admin"]
            isOneToOne: false
            referencedRelation: "dic_nivel_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_admins_historial: {
        Row: {
          cargo: string
          detalle: string | null
          estado_admin: number
          fecha_cambio: string
          id: number
          id_admin: number
          nivel_admin: number
        }
        Insert: {
          cargo: string
          detalle?: string | null
          estado_admin?: number
          fecha_cambio?: string
          id?: number
          id_admin: number
          nivel_admin: number
        }
        Update: {
          cargo?: string
          detalle?: string | null
          estado_admin?: number
          fecha_cambio?: string
          id?: number
          id_admin?: number
          nivel_admin?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_admins_historial_id_admin_tbl_admins_id"
            columns: ["id_admin"]
            isOneToOne: false
            referencedRelation: "tbl_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_admins_historial_nivel_admin_dic_nivel_admins_id"
            columns: ["nivel_admin"]
            isOneToOne: false
            referencedRelation: "dic_nivel_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_archivos_tramites: {
        Row: {
          bucket: string
          estado_archivo: number
          fecha: string
          id: number
          id_etapa: number
          id_tipo_archivo: number
          id_tramite: number
          id_tramites_metadatos: number
          nombre_archivo: string
          storage: string
        }
        Insert: {
          bucket: string
          estado_archivo?: number
          fecha?: string
          id?: number
          id_etapa: number
          id_tipo_archivo: number
          id_tramite: number
          id_tramites_metadatos: number
          nombre_archivo: string
          storage: string
        }
        Update: {
          bucket?: string
          estado_archivo?: number
          fecha?: string
          id?: number
          id_etapa?: number
          id_tipo_archivo?: number
          id_tramite?: number
          id_tramites_metadatos?: number
          nombre_archivo?: string
          storage?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_archivos_tramites_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_archivos_tramites_id_tipo_archivo_dic_tipo_archivo_id"
            columns: ["id_tipo_archivo"]
            isOneToOne: false
            referencedRelation: "dic_tipo_archivo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_archivos_tramites_id_tramite_tbl_tramites_id"
            columns: ["id_tramite"]
            isOneToOne: false
            referencedRelation: "tbl_tramites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_archivos_tramites_id_tramites_metadatos_tbl_tramites_"
            columns: ["id_tramites_metadatos"]
            isOneToOne: false
            referencedRelation: "tbl_tramites_metadatos"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_coasesores: {
        Row: {
          estado_coasesor: number
          id: number
          id_investigador: number
        }
        Insert: {
          estado_coasesor?: number
          id?: number
          id_investigador: number
        }
        Update: {
          estado_coasesor?: number
          id?: number
          id_investigador?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_coasesores_id_investigador_tbl_perfil_investigador_id"
            columns: ["id_investigador"]
            isOneToOne: false
            referencedRelation: "tbl_perfil_investigador"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_coasesores_historial: {
        Row: {
          detalle: string | null
          estado_coasesor: number
          fecha_cambio: string
          id: number
          id_coasesor: number
          id_usuario_verificador: number
        }
        Insert: {
          detalle?: string | null
          estado_coasesor?: number
          fecha_cambio?: string
          id?: number
          id_coasesor: number
          id_usuario_verificador: number
        }
        Update: {
          detalle?: string | null
          estado_coasesor?: number
          fecha_cambio?: string
          id?: number
          id_coasesor?: number
          id_usuario_verificador?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_coasesores_historial_id_coasesor_tbl_coasesores_id"
            columns: ["id_coasesor"]
            isOneToOne: false
            referencedRelation: "tbl_coasesores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_coasesores_historial_id_usuario_verificador_tbl_usuar"
            columns: ["id_usuario_verificador"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_conformacion_jurados: {
        Row: {
          estado_cj: number
          fecha_asignacion: string
          id: number
          id_coasesor: number
          id_docente: number
          id_etapa: number
          id_tramite: number
          id_usuario_asignador: number
          orden: number
        }
        Insert: {
          estado_cj?: number
          fecha_asignacion?: string
          id?: number
          id_coasesor: number
          id_docente: number
          id_etapa: number
          id_tramite: number
          id_usuario_asignador: number
          orden: number
        }
        Update: {
          estado_cj?: number
          fecha_asignacion?: string
          id?: number
          id_coasesor?: number
          id_docente?: number
          id_etapa?: number
          id_tramite?: number
          id_usuario_asignador?: number
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_conformacion_jurados_id_coasesor_tbl_coasesores_id"
            columns: ["id_coasesor"]
            isOneToOne: false
            referencedRelation: "tbl_coasesores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_conformacion_jurados_id_docente_tbl_docentes_id"
            columns: ["id_docente"]
            isOneToOne: false
            referencedRelation: "tbl_docentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_conformacion_jurados_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_conformacion_jurados_id_tramite_tbl_tramites_id"
            columns: ["id_tramite"]
            isOneToOne: false
            referencedRelation: "tbl_tramites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_conformacion_jurados_id_usuario_asignador_tbl_usuario"
            columns: ["id_usuario_asignador"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_coordinadores: {
        Row: {
          correo_oficina: string | null
          direccion_oficina: string | null
          estado_coordinador: number | null
          horario: string | null
          id: number
          id_carrera: number
          id_usuario: number
          nivel_coordinador: number
          telefono: string | null
        }
        Insert: {
          correo_oficina?: string | null
          direccion_oficina?: string | null
          estado_coordinador?: number | null
          horario?: string | null
          id?: number
          id_carrera: number
          id_usuario: number
          nivel_coordinador: number
          telefono?: string | null
        }
        Update: {
          correo_oficina?: string | null
          direccion_oficina?: string | null
          estado_coordinador?: number | null
          horario?: string | null
          id?: number
          id_carrera?: number
          id_usuario?: number
          nivel_coordinador?: number
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_coordinadores_id_carrera_dic_carreras_id"
            columns: ["id_carrera"]
            isOneToOne: false
            referencedRelation: "dic_carreras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_coordinadores_id_usuario_tbl_usuarios_id"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_coordinadores_historial: {
        Row: {
          comentario: string | null
          estado_coordinador_historial: number
          fecha: string
          id: number
          id_coordinador: number
          numero_resolucion: string | null
        }
        Insert: {
          comentario?: string | null
          estado_coordinador_historial?: number
          fecha?: string
          id?: number
          id_coordinador: number
          numero_resolucion?: string | null
        }
        Update: {
          comentario?: string | null
          estado_coordinador_historial?: number
          fecha?: string
          id?: number
          id_coordinador?: number
          numero_resolucion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_coordinadores_historial_id_coordinador_tbl_coordinado"
            columns: ["id_coordinador"]
            isOneToOne: false
            referencedRelation: "tbl_coordinadores"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_correcciones_jurados: {
        Row: {
          estado_correccion: number
          Fecha_correccion: string
          id: number
          id_docente: number
          id_etapa: number
          id_tramite: number
          mensaje_correccion: string | null
        }
        Insert: {
          estado_correccion?: number
          Fecha_correccion?: string
          id?: number
          id_docente: number
          id_etapa: number
          id_tramite: number
          mensaje_correccion?: string | null
        }
        Update: {
          estado_correccion?: number
          Fecha_correccion?: string
          id?: number
          id_docente?: number
          id_etapa?: number
          id_tramite?: number
          mensaje_correccion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_correcciones_jurados_id_docente_tbl_docentes_id"
            columns: ["id_docente"]
            isOneToOne: false
            referencedRelation: "tbl_docentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_correcciones_jurados_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_correcciones_jurados_id_tramite_tbl_tramites_id"
            columns: ["id_tramite"]
            isOneToOne: false
            referencedRelation: "tbl_tramites"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_docentes: {
        Row: {
          codigo_airhs: string
          estado_docente: number
          id: number
          id_carrera: number
          id_categoria: number
          id_especialidad: number
          id_usuario: number
        }
        Insert: {
          codigo_airhs: string
          estado_docente?: number
          id?: number
          id_carrera: number
          id_categoria: number
          id_especialidad: number
          id_usuario: number
        }
        Update: {
          codigo_airhs?: string
          estado_docente?: number
          id?: number
          id_carrera?: number
          id_categoria?: number
          id_especialidad?: number
          id_usuario?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_docentes_id_carrera_dic_carreras_id"
            columns: ["id_carrera"]
            isOneToOne: false
            referencedRelation: "dic_carreras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_docentes_id_especialidad_dic_especialidades_id"
            columns: ["id_especialidad"]
            isOneToOne: false
            referencedRelation: "dic_especialidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_docentes_id_usuario_tbl_usuarios_id"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_docentes_lineas: {
        Row: {
          id: number
          id_docente: number
          id_estado_linea: number
          id_sublinea_vri: number
          tipo: number
        }
        Insert: {
          id?: number
          id_docente: number
          id_estado_linea?: number
          id_sublinea_vri: number
          tipo: number
        }
        Update: {
          id?: number
          id_docente?: number
          id_estado_linea?: number
          id_sublinea_vri?: number
          tipo?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_docentes_lineas_id_docente_tbl_docentes_id"
            columns: ["id_docente"]
            isOneToOne: false
            referencedRelation: "tbl_docentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_docentes_lineas_id_sublinea_vri_tbl_sublineas_vri_id"
            columns: ["id_sublinea_vri"]
            isOneToOne: false
            referencedRelation: "tbl_sublineas_vri"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_docentes_lineas_historial: {
        Row: {
          comentario: string | null
          fecha_registro: string
          id: number
          id_docente: number
          id_estado_historial: number
          id_sublinea_vri: number
          numero_resolucion: string
        }
        Insert: {
          comentario?: string | null
          fecha_registro?: string
          id?: number
          id_docente: number
          id_estado_historial?: number
          id_sublinea_vri: number
          numero_resolucion: string
        }
        Update: {
          comentario?: string | null
          fecha_registro?: string
          id?: number
          id_docente?: number
          id_estado_historial?: number
          id_sublinea_vri?: number
          numero_resolucion?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_docentes_lineas_historial_id_docente_tbl_docentes_id"
            columns: ["id_docente"]
            isOneToOne: false
            referencedRelation: "tbl_docentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_docentes_lineas_historial_id_sublinea_vri_tbl_subline"
            columns: ["id_sublinea_vri"]
            isOneToOne: false
            referencedRelation: "tbl_sublineas_vri"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_estructura_academica: {
        Row: {
          estado_ea: number
          id: number
          id_carrera: number
          id_especialidad: number
          id_facultad: number
          id_sede: number
          nombre: string | null
        }
        Insert: {
          estado_ea?: number
          id: number
          id_carrera: number
          id_especialidad: number
          id_facultad: number
          id_sede: number
          nombre?: string | null
        }
        Update: {
          estado_ea?: number
          id?: number
          id_carrera?: number
          id_especialidad?: number
          id_facultad?: number
          id_sede?: number
          nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_estructura_academica_id_carrera_dic_carreras_id"
            columns: ["id_carrera"]
            isOneToOne: false
            referencedRelation: "dic_carreras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_estructura_academica_id_especialidad_dic_especialidad"
            columns: ["id_especialidad"]
            isOneToOne: false
            referencedRelation: "dic_especialidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_estructura_academica_id_facultad_dic_facultades_id"
            columns: ["id_facultad"]
            isOneToOne: false
            referencedRelation: "dic_facultades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_estructura_academica_id_sede_dic_sedes_id"
            columns: ["id_sede"]
            isOneToOne: false
            referencedRelation: "dic_sedes"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_integrantes: {
        Row: {
          estado_integrante: number
          fecha_registro: string
          id: number
          id_tesista: number
          id_tramite: number
          tipo_integrante: number
        }
        Insert: {
          estado_integrante?: number
          fecha_registro?: string
          id?: number
          id_tesista: number
          id_tramite: number
          tipo_integrante: number
        }
        Update: {
          estado_integrante?: number
          fecha_registro?: string
          id?: number
          id_tesista?: number
          id_tramite?: number
          tipo_integrante?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_integrantes_id_tesista_tbl_tesistas_id"
            columns: ["id_tesista"]
            isOneToOne: false
            referencedRelation: "tbl_tesistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_integrantes_id_tramite_tbl_tramites_id"
            columns: ["id_tramite"]
            isOneToOne: false
            referencedRelation: "tbl_tramites"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_observaciones: {
        Row: {
          fecha: string
          id: number
          id_etapa: number
          id_rol: number
          id_tramite: number
          id_usuario: number
          observacion: string | null
          visto_bueno: number
        }
        Insert: {
          fecha?: string
          id?: number
          id_etapa: number
          id_rol: number
          id_tramite: number
          id_usuario: number
          observacion?: string | null
          visto_bueno: number
        }
        Update: {
          fecha?: string
          id?: number
          id_etapa?: number
          id_rol?: number
          id_tramite?: number
          id_usuario?: number
          observacion?: string | null
          visto_bueno?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_observaciones_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_observaciones_id_rol_tbl_usuarios_servicios_id"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios_servicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_observaciones_id_tramite_tbl_tramites_id"
            columns: ["id_tramite"]
            isOneToOne: false
            referencedRelation: "tbl_tramites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_observaciones_id_usuario_tbl_usuarios_id"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_perfil_investigador: {
        Row: {
          afiliacion: string | null
          alternativo_scopus_id: string | null
          codigo_renacyt: string | null
          ctivitae: string | null
          estado_investigador: number
          id: number
          id_usuario: number
          institucion: string | null
          nivel_renacyt: string | null
          orcid: string | null
          scopus_id: string | null
          wos_id: string | null
        }
        Insert: {
          afiliacion?: string | null
          alternativo_scopus_id?: string | null
          codigo_renacyt?: string | null
          ctivitae?: string | null
          estado_investigador?: number
          id?: number
          id_usuario: number
          institucion?: string | null
          nivel_renacyt?: string | null
          orcid?: string | null
          scopus_id?: string | null
          wos_id?: string | null
        }
        Update: {
          afiliacion?: string | null
          alternativo_scopus_id?: string | null
          codigo_renacyt?: string | null
          ctivitae?: string | null
          estado_investigador?: number
          id?: number
          id_usuario?: number
          institucion?: string | null
          nivel_renacyt?: string | null
          orcid?: string | null
          scopus_id?: string | null
          wos_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_perfil_investigador_id_usuario_tbl_usuarios_id"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_sublineas_vri: {
        Row: {
          estado_sublinea_vri: number
          fecha_modificacion: string
          fecha_registro: string
          id: number
          id_area: number
          id_carrera: number
          id_disciplina: number
          id_linea_universidad: number
          id_subarea: number
          nombre: string
        }
        Insert: {
          estado_sublinea_vri?: number
          fecha_modificacion?: string
          fecha_registro?: string
          id: number
          id_area: number
          id_carrera: number
          id_disciplina: number
          id_linea_universidad: number
          id_subarea: number
          nombre: string
        }
        Update: {
          estado_sublinea_vri?: number
          fecha_modificacion?: string
          fecha_registro?: string
          id?: number
          id_area?: number
          id_carrera?: number
          id_disciplina?: number
          id_linea_universidad?: number
          id_subarea?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_sublineas_vri_id_area_dic_areas_ocde_id"
            columns: ["id_area"]
            isOneToOne: false
            referencedRelation: "dic_areas_ocde"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_sublineas_vri_id_carrera_dic_carreras_id"
            columns: ["id_carrera"]
            isOneToOne: false
            referencedRelation: "dic_carreras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_sublineas_vri_id_disciplina_dic_disciplinas_id"
            columns: ["id_disciplina"]
            isOneToOne: false
            referencedRelation: "dic_disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_sublineas_vri_id_linea_universidad_dic_lineas_univers"
            columns: ["id_linea_universidad"]
            isOneToOne: false
            referencedRelation: "dic_lineas_universidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_sublineas_vri_id_subarea_dic_subareas_ocde_id"
            columns: ["id_subarea"]
            isOneToOne: false
            referencedRelation: "dic_subareas_ocde"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_tesistas: {
        Row: {
          codigo_estudiante: string
          estado: number
          id: number
          id_estructura_academica: number
          id_usuario: number
        }
        Insert: {
          codigo_estudiante: string
          estado?: number
          id?: number
          id_estructura_academica: number
          id_usuario: number
        }
        Update: {
          codigo_estudiante?: string
          estado?: number
          id?: number
          id_estructura_academica?: number
          id_usuario?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_tesistas_id_estructura_academica_tbl_estructura_acade"
            columns: ["id_estructura_academica"]
            isOneToOne: false
            referencedRelation: "tbl_estructura_academica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tesistas_id_usuario_tbl_usuarios_id"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_tramites: {
        Row: {
          codigo_proyecto: string
          estado_tramite: number
          fecha_registro: string
          id: number
          id_antiguo: number | null
          id_denominacion: number
          id_etapa: number
          id_modalidad: number
          id_sublinea_vri: number
          id_tipo_trabajo: number
        }
        Insert: {
          codigo_proyecto: string
          estado_tramite?: number
          fecha_registro?: string
          id?: number
          id_antiguo?: number | null
          id_denominacion: number
          id_etapa: number
          id_modalidad: number
          id_sublinea_vri: number
          id_tipo_trabajo: number
        }
        Update: {
          codigo_proyecto?: string
          estado_tramite?: number
          fecha_registro?: string
          id?: number
          id_antiguo?: number | null
          id_denominacion?: number
          id_etapa?: number
          id_modalidad?: number
          id_sublinea_vri?: number
          id_tipo_trabajo?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_tramites_id_denominacion_dic_denominaciones_id"
            columns: ["id_denominacion"]
            isOneToOne: false
            referencedRelation: "dic_denominaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramites_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramites_id_modalidad_dic_modalidades_id"
            columns: ["id_modalidad"]
            isOneToOne: false
            referencedRelation: "dic_modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramites_id_sublinea_vri_tbl_sublineas_vri_id"
            columns: ["id_sublinea_vri"]
            isOneToOne: false
            referencedRelation: "tbl_sublineas_vri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramites_id_tipo_trabajo_dic_tipo_trabajos_id"
            columns: ["id_tipo_trabajo"]
            isOneToOne: false
            referencedRelation: "dic_tipo_trabajos"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_tramites_historial: {
        Row: {
          comentario: string | null
          estado_tramite_historial: number
          fecha_cambio: string
          id: number
          id_etapa: number
          id_tramite: number
        }
        Insert: {
          comentario?: string | null
          estado_tramite_historial?: number
          fecha_cambio?: string
          id?: number
          id_etapa: number
          id_tramite: number
        }
        Update: {
          comentario?: string | null
          estado_tramite_historial?: number
          fecha_cambio?: string
          id?: number
          id_etapa?: number
          id_tramite?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_tramites_historial_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramites_historial_id_tramite_tbl_tramites_id"
            columns: ["id_tramite"]
            isOneToOne: false
            referencedRelation: "tbl_tramites"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_tramites_metadatos: {
        Row: {
          abstract: string
          conclusiones: string
          estado_tm: number
          fecha: string
          id: number
          id_etapa: number
          id_tramite: number
          keywords: string
          presupuesto: number
          titulo: string
        }
        Insert: {
          abstract: string
          conclusiones: string
          estado_tm?: number
          fecha?: string
          id?: number
          id_etapa: number
          id_tramite: number
          keywords: string
          presupuesto: number
          titulo: string
        }
        Update: {
          abstract?: string
          conclusiones?: string
          estado_tm?: number
          fecha?: string
          id?: number
          id_etapa?: number
          id_tramite?: number
          keywords?: string
          presupuesto?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_tramites_metadatos_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramites_metadatos_id_tramite_tbl_tramites_id"
            columns: ["id_tramite"]
            isOneToOne: false
            referencedRelation: "tbl_tramites"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_tramitesdet: {
        Row: {
          detalle: string | null
          fecha_registro: string
          id: number
          id_docente: number
          id_etapa: number
          id_tramite: number
          id_visto_bueno: number
        }
        Insert: {
          detalle?: string | null
          fecha_registro?: string
          id?: number
          id_docente: number
          id_etapa: number
          id_tramite: number
          id_visto_bueno: number
        }
        Update: {
          detalle?: string | null
          fecha_registro?: string
          id?: number
          id_docente?: number
          id_etapa?: number
          id_tramite?: number
          id_visto_bueno?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_tramitesdet_id_docente_tbl_docentes_id"
            columns: ["id_docente"]
            isOneToOne: false
            referencedRelation: "tbl_docentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramitesdet_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramitesdet_id_tramite_tbl_tramites_id"
            columns: ["id_tramite"]
            isOneToOne: false
            referencedRelation: "tbl_tramites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramitesdet_id_visto_bueno_dic_visto_bueno_id"
            columns: ["id_visto_bueno"]
            isOneToOne: false
            referencedRelation: "dic_visto_bueno"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_tramitesdoc: {
        Row: {
          fecha_registro: string
          id: number
          id_etapa: number
          id_tramite: number
          id_tramites_metadatos: number
        }
        Insert: {
          fecha_registro?: string
          id?: number
          id_etapa: number
          id_tramite: number
          id_tramites_metadatos: number
        }
        Update: {
          fecha_registro?: string
          id?: number
          id_etapa?: number
          id_tramite?: number
          id_tramites_metadatos?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_tramitesdoc_id_etapa_dic_etapas_id"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "dic_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramitesdoc_id_tramite_tbl_tramites_id"
            columns: ["id_tramite"]
            isOneToOne: false
            referencedRelation: "tbl_tramites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_tramitesdoc_id_tramites_metadatos_tbl_tramites_metada"
            columns: ["id_tramites_metadatos"]
            isOneToOne: false
            referencedRelation: "tbl_tramites_metadatos"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_usuarios: {
        Row: {
          apellidos: string | null
          contrasenia: string | null
          correo: string
          correo_google: string | null
          direccion: string | null
          estado: number | null
          fecha_nacimiento: string | null
          id: number
          nombres: string | null
          num_doc_identidad: string
          pais: string | null
          ruta_foto: string | null
          sexo: string | null
          telefono: string | null
          tipo_doc_identidad: string | null
          uuid: string | null
        }
        Insert: {
          apellidos?: string | null
          contrasenia?: string | null
          correo: string
          correo_google?: string | null
          direccion?: string | null
          estado?: number | null
          fecha_nacimiento?: string | null
          id?: number
          nombres?: string | null
          num_doc_identidad: string
          pais?: string | null
          ruta_foto?: string | null
          sexo?: string | null
          telefono?: string | null
          tipo_doc_identidad?: string | null
          uuid?: string | null
        }
        Update: {
          apellidos?: string | null
          contrasenia?: string | null
          correo?: string
          correo_google?: string | null
          direccion?: string | null
          estado?: number | null
          fecha_nacimiento?: string | null
          id?: number
          nombres?: string | null
          num_doc_identidad?: string
          pais?: string | null
          ruta_foto?: string | null
          sexo?: string | null
          telefono?: string | null
          tipo_doc_identidad?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      tbl_usuarios_servicios: {
        Row: {
          estado: number
          fecha_asignacion: string
          id: number
          id_servicio: number
          id_usuario: number
        }
        Insert: {
          estado?: number
          fecha_asignacion?: string
          id?: number
          id_servicio: number
          id_usuario: number
        }
        Update: {
          estado?: number
          fecha_asignacion?: string
          id?: number
          id_servicio?: number
          id_usuario?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tbl_usuarios_servicios_id_servicio_dic_servicios_id"
            columns: ["id_servicio"]
            isOneToOne: false
            referencedRelation: "dic_servicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tbl_usuarios_servicios_id_usuario_tbl_usuarios_id"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "tbl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      get_student_info: {
        Args: { student_id: string }
        Returns: Json
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
