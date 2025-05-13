import {
    GetSupportHubCategoriesResponse,
    GetSupportHubArticlesResponse,
    GetSupportHubArticleDetailsResponse
  } from '../views/support/types';
  
  // Datos estáticos para demostración
  const mockCategories: GetSupportHubCategoriesResponse = {
    categories: [
      {
        name: "Primeros Pasos",
        topics: [
          {
            id: "getting-started",
            name: "Comienza a usar ResearchHub",
            description: "Guías para empezar a utilizar la plataforma",
            articleCounts: 5
          },
          {
            id: "account-settings",
            name: "Configuración de Cuenta",
            description: "Cómo configurar y personalizar tu cuenta",
            articleCounts: 3
          }
        ]
      },
      {
        name: "Funcionalidades",
        topics: [
          {
            id: "data-management",
            name: "Gestión de Datos",
            description: "Cómo almacenar y gestionar tus datos de investigación",
            articleCounts: 4
          },
          {
            id: "features",
            name: "Funcionalidades",
            description: "Aprende sobre todas las funcionalidades disponibles",
            articleCounts: 6
          },
          {
            id: "integrations",
            name: "Integraciones",
            description: "Conecta con otras herramientas y plataformas",
            articleCounts: 3
          }
        ]
      },
      {
        name: "Soporte Técnico",
        topics: [
          {
            id: "troubleshooting",
            name: "Solución de Problemas",
            description: "Resuelve problemas técnicos comunes",
            articleCounts: 7
          },
          {
            id: "faq",
            name: "Preguntas Frecuentes",
            description: "Respuestas a las preguntas más comunes",
            articleCounts: 8
          }
        ]
      }
    ],
    popularArticles: [
      {
        id: "article-1",
        category: "getting-started",
        title: "Cómo crear tu primer proyecto de investigación",
        timeToRead: 5,
        viewCount: 2450,
        commentCount: 18
      },
      {
        id: "article-2",
        category: "data-management",
        title: "Importación de datos desde Excel y CSV",
        timeToRead: 3,
        viewCount: 1820,
        commentCount: 12
      },
      {
        id: "article-3",
        category: "troubleshooting",
        title: "Solución a problemas de sincronización",
        timeToRead: 4,
        viewCount: 1540,
        commentCount: 9
      },
      {
        id: "article-4",
        category: "faq",
        title: "Preguntas frecuentes sobre privacidad y seguridad",
        timeToRead: 6,
        viewCount: 1350,
        commentCount: 7
      }
    ]
  };
  
  // Artículos de ejemplo para cada categoría
  const mockArticles: Record<string, GetSupportHubArticlesResponse> = {
    'getting-started': [
      {
        id: "article-1",
        category: "getting-started",
        title: "Cómo crear tu primer proyecto de investigación",
        timeToRead: 5,
        viewCount: 2450,
        commentCount: 18
      },
      {
        id: "article-5",
        category: "getting-started",
        title: "Registrando tu cuenta y configurando tu perfil",
        timeToRead: 4,
        viewCount: 1850,
        commentCount: 10
      },
      {
        id: "article-6",
        category: "getting-started",
        title: "Guía de la interfaz de usuario",
        timeToRead: 6,
        viewCount: 1620,
        commentCount: 8
      },
      {
        id: "article-7",
        category: "getting-started",
        title: "Conectando con otros investigadores",
        timeToRead: 3,
        viewCount: 1480,
        commentCount: 15
      },
      {
        id: "article-8",
        category: "getting-started",
        title: "Empezando con la visualización de datos",
        timeToRead: 7,
        viewCount: 1320,
        commentCount: 12
      }
    ],
    'data-management': [
      {
        id: "article-2",
        category: "data-management",
        title: "Importación de datos desde Excel y CSV",
        timeToRead: 3,
        viewCount: 1820,
        commentCount: 12
      },
      {
        id: "article-9",
        category: "data-management",
        title: "Organización de datos por categorías",
        timeToRead: 4,
        viewCount: 1380,
        commentCount: 7
      },
      {
        id: "article-10",
        category: "data-management",
        title: "Exportación de resultados en múltiples formatos",
        timeToRead: 5,
        viewCount: 1250,
        commentCount: 9
      },
      {
        id: "article-11",
        category: "data-management",
        title: "Configuración de respaldos automáticos",
        timeToRead: 3,
        viewCount: 980,
        commentCount: 5
      }
    ],
    'troubleshooting': [
      {
        id: "article-3",
        category: "troubleshooting",
        title: "Solución a problemas de sincronización",
        timeToRead: 4,
        viewCount: 1540,
        commentCount: 9
      },
      {
        id: "article-12",
        category: "troubleshooting",
        title: "Errores comunes al importar datos",
        timeToRead: 5,
        viewCount: 1280,
        commentCount: 14
      },
      {
        id: "article-13",
        category: "troubleshooting",
        title: "Problemas con el editor de texto enriquecido",
        timeToRead: 3,
        viewCount: 950,
        commentCount: 8
      },
      {
        id: "article-14",
        category: "troubleshooting",
        title: "¿Por qué mis gráficos no se visualizan correctamente?",
        timeToRead: 6,
        viewCount: 1120,
        commentCount: 11
      }
    ]
  };
  
  // Detalles de artículos
  // Detalles de artículos
const mockArticleDetails: Record<string, GetSupportHubArticleDetailsResponse> = {
    "article-1": {
      id: "article-1",
      category: "getting-started",
      title: "Cómo crear tu primer proyecto de investigación",
      content: `
  # Cómo crear tu primer proyecto de investigación
  
  ## Introducción
  ResearchHub permite crear y gestionar proyectos de investigación de manera sencilla y organizada. Este artículo te guiará a través del proceso para crear tu primer proyecto.
  
  ## Pasos para crear un proyecto
  <div class="video-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/xKOp1CAkMHs" 
    frameborder="0" 
    allowfullscreen>
  </iframe>
</div>

  
  ### 1. Accede a tu dashboard
  Después de iniciar sesión, accede a tu panel principal haciendo clic en "Dashboard" en la barra de navegación superior.
  
  ### 2. Crea un nuevo proyecto
  - Haz clic en el botón "+ Nuevo Proyecto" ubicado en la esquina superior derecha.
  - Se abrirá un formulario para introducir los detalles del proyecto.
  
  ### 3. Completa la información del proyecto
  - **Título**: Asigna un nombre descriptivo a tu proyecto.
  - **Descripción**: Escribe una breve descripción que explique el objetivo de tu investigación.
  - **Área de investigación**: Selecciona el área o categoría principal relacionada con tu proyecto.
  - **Etiquetas**: Añade palabras clave para facilitar la búsqueda y organización.
  - **Privacidad**: Elige si quieres que tu proyecto sea público, privado o compartido solo con colaboradores específicos.
  
  ### 4. Establece la estructura del proyecto
  Después de crear el proyecto, puedes organizarlo en diferentes secciones:
  - **Datos**: Para almacenar y gestionar tus conjuntos de datos.
  - **Análisis**: Para guardar tus análisis estadísticos y visualizaciones.
  - **Documentos**: Para almacenar documentos relacionados con la investigación.
  - **Bibliografía**: Para gestionar referencias y citas.
  
  ### 5. Invita colaboradores
  Si trabajas en equipo, puedes invitar a otros investigadores a colaborar en tu proyecto:
  - Haz clic en "Configuración" dentro de la vista del proyecto.
  - Selecciona "Colaboradores".
  - Introduce los correos electrónicos de tus colaboradores y asígnales roles específicos.
  
  ## Consejos útiles
  - Utiliza una nomenclatura clara y consistente para facilitar la organización.
  - Crea una estructura de carpetas lógica desde el principio.
  - Actualiza regularmente la descripción y los metadatos del proyecto para reflejar su evolución.
  - Establece hitos y objetivos para mantener un seguimiento claro del progreso.
  
  ## Próximos pasos
  Una vez creado tu proyecto, puedes:
  - [Importar datos](https://example.com/importar-datos)
  - [Crear visualizaciones](https://example.com/visualizaciones)
  - [Configurar la colaboración](https://example.com/configurar-colaboracion)
  
  ¿Necesitas más ayuda? Contacta con nuestro [equipo de soporte](mailto:soporte@researchhub.com).
      `,
      timeToRead: 5,
      viewCount: 2450,
      commentCount: 18
    },
    "article-2": {
      id: "article-2",
      category: "data-management",
      title: "Importación de datos desde Excel y CSV",
      content: `
  # Importación de datos desde Excel y CSV
  
  ## Visión general
  ResearchHub permite importar datos de diferentes fuentes para analizarlos y visualizarlos. Este artículo explica cómo importar datos desde archivos Excel (.xlsx, .xls) y CSV.
  
  ## Formatos compatibles
  - Excel: .xlsx, .xls
  - CSV: .csv (valores separados por comas)
  - TSV: .tsv (valores separados por tabulaciones)
  
  ## Requisitos previos
  - Tamaño máximo de archivo: 50MB
  - Los archivos Excel pueden contener múltiples hojas
  - Los archivos CSV deben estar codificados en UTF-8 para soportar caracteres especiales
  
  ## Proceso de importación
  
  ### Desde el dashboard
  1. Accede a tu proyecto
  2. Navega a la sección "Datos"
  3. Haz clic en "Importar datos" en la esquina superior derecha
  4. Selecciona "Desde archivo local"
  5. Arrastra o selecciona tu archivo Excel o CSV
  6. Espera a que se complete la carga
  
  ### Opciones de importación avanzadas
  Durante la importación, puedes configurar varias opciones:
  
  #### Para archivos Excel:
  - Seleccionar qué hojas importar
  - Establecer una fila específica como encabezados
  - Ignorar filas o columnas específicas
  - Especificar los tipos de datos para cada columna
  
  #### Para archivos CSV:
  - Definir el delimitador (coma, punto y coma, tabulación, etc.)
  - Establecer el marcador de texto (comillas simples o dobles)
  - Configurar el formato de fecha
  - Especificar la codificación del archivo
  
  ## Validación de datos
  Después de cargar tu archivo, ResearchHub realizará una validación básica para detectar:
  - Valores faltantes
  - Tipos de datos inconsistentes
  - Errores de formato
  
  ## Transformación durante la importación
  Puedes aplicar transformaciones básicas durante la importación:
  - Eliminar filas con valores faltantes
  - Convertir tipos de datos
  - Renombrar columnas
  - Filtrar filas basadas en criterios simples
  
  ## Solución de problemas comunes
  - **Error de formato**: Asegúrate de que tu archivo CSV esté correctamente delimitado
  - **Caracteres extraños**: Verifica la codificación del archivo (preferiblemente UTF-8)
  - **Datos truncados**: Comprueba si hay límites en las celdas de Excel (especialmente para textos largos)
  - **Importación lenta**: Considera dividir archivos muy grandes en conjuntos más pequeños
  
  ## Próximos pasos
  Una vez importados tus datos, puedes:
  - [Explorar y visualizar datos](https://example.com/visualizar-datos)
  - [Aplicar análisis estadísticos](https://example.com/analisis-estadisticos)
  - [Generar informes automáticos](https://example.com/generar-informes)
  
  ¿Necesitas importar desde otras fuentes? Consulta nuestra guía sobre [importación desde bases de datos](https://example.com/importar-desde-bases-de-datos).
      `,
      timeToRead: 3,
      viewCount: 1820,
      commentCount: 12
    },
    "article-3": {
      id: "article-3",
      category: "troubleshooting",
      title: "Solución a problemas de sincronización",
      content: `
  # Solución a problemas de sincronización
  
  ## Descripción del problema
  Los problemas de sincronización pueden ocurrir cuando los datos no se actualizan correctamente entre diferentes dispositivos o cuando hay conflictos entre versiones locales y en la nube. Este artículo te ayudará a diagnosticar y resolver estos problemas.
  
  ## Causas comunes
  1. **Conexión a internet inestable**: La sincronización puede fallar si tu conexión es lenta o intermitente.
  2. **Conflictos de versiones**: Cuando el mismo archivo se modifica en diferentes dispositivos al mismo tiempo.
  3. **Caché obsoleto**: Datos antiguos almacenados localmente que no se han actualizado correctamente.
  4. **Problemas con permisos**: Falta de permisos necesarios para modificar o sincronizar archivos.
  5. **Error del servidor**: Problemas temporales con nuestros servidores de sincronización.
  
  ## Soluciones paso a paso
  
  ### 1. Verificar conexión a internet
  - Asegúrate de tener una conexión estable a internet
  - Comprueba si puedes acceder a otros sitios web
  - Intenta cambiar de Wi-Fi o usar datos móviles como alternativa
  
  ### 2. Forzar sincronización manual
  - Ve a "Configuración" > "Sincronización"
  - Haz clic en "Sincronizar ahora"
  - Espera a que se complete el proceso
  
  ### 3. Limpiar caché de la aplicación
  - Ve a "Configuración" > "Avanzado"
  - Selecciona "Limpiar caché"
  - Cierra y vuelve a abrir la aplicación
  - Inicia sesión nuevamente si es necesario
  
  ### 4. Resolver conflictos de versiones
  Cuando se detectan conflictos, ResearchHub te mostrará una notificación:
  - Revisa ambas versiones del archivo en conflicto
  - Selecciona "Mantener ambas versiones" o elige una específica
  - Confirma tu elección
  
  ### 5. Verificar permisos
  - Asegúrate de tener los permisos adecuados para los proyectos
  - Contacta al administrador del proyecto si necesitas permisos adicionales
  
  ### 6. Reiniciar la aplicación
  - Cierra completamente la aplicación (no solo minimizar)
  - Reinicia tu dispositivo
  - Vuelve a abrir la aplicación e intenta sincronizar
  
  ## Situaciones específicas
  
  ### Sincronización bloqueada en "Pendiente"
  Si la sincronización permanece en estado "Pendiente" por más de 5 minutos:
  1. Cancela la operación actual
  2. Verifica tu conexión a internet
  3. Intenta sincronizar un archivo a la vez
  
  ### Error "No se puede sincronizar en este momento"
  Este error generalmente indica un problema temporal:
  1. Espera unos minutos y vuelve a intentarlo
  2. Verifica el estado de nuestros servidores en [status.researchhub.com](https://status.researchhub.com)
  
  ### Datos faltantes después de la sincronización
  Si algunos datos no aparecen después de la sincronización:
  1. Verifica en la papelera de reciclaje
  2. Revisa el historial de versiones del archivo
  3. Consulta la sección "Actividad reciente" en el dashboard
  
  ## Prevención de problemas futuros
  - Sincroniza regularmente para evitar grandes cambios acumulados
  - No modifiques el mismo archivo en múltiples dispositivos simultáneamente
  - Mantén actualizada la aplicación a la última versión
  - Establece una buena estructura de carpetas para evitar conflictos
  
  Si has seguido todos estos pasos y sigues experimentando problemas, por favor contacta a nuestro [equipo de soporte](mailto:soporte@researchhub.com) con detalles sobre el problema.
      `,
      timeToRead: 4,
      viewCount: 1540,
      commentCount: 9
    },
    "article-5": {
      id: "article-5",
      category: "getting-started",
      title: "Registrando tu cuenta y configurando tu perfil",
      content: `
  # Registrando tu cuenta y configurando tu perfil
  
  ## Introducción
  Crear una cuenta en ResearchHub es el primer paso para acceder a todas las funcionalidades de nuestra plataforma. Un perfil bien configurado te ayudará a conectar con otros investigadores y destacar tu experiencia profesional.
  
  ## Creación de cuenta
  
  ### 1. Registro inicial
  - Visita [www.researchhub.com](https://www.researchhub.com)
  - Haz clic en "Registrarse" en la esquina superior derecha
  - Completa el formulario con tu información básica:
    - Nombre completo
    - Correo electrónico (preferiblemente institucional)
    - Contraseña segura
  - Acepta los términos y condiciones
  - Haz clic en "Crear cuenta"
  
  ### 2. Verificación de correo electrónico
  - Recibirás un correo de verificación
  - Haz clic en el enlace de verificación o introduce el código proporcionado
  - Esto activará tu cuenta y te permitirá iniciar sesión
  
  ## Configuración del perfil
  
  ### 1. Información básica
  Una vez que hayas iniciado sesión, completa tu perfil:
  - Foto de perfil profesional
  - Título académico o profesional
  - Institución o afiliación actual
  - Ubicación geográfica
  
  ### 2. Experiencia profesional
  Añade detalles sobre tu trayectoria:
  - Puestos actuales y anteriores
  - Instituciones donde has trabajado
  - Fechas relevantes
  - Breve descripción de responsabilidades
  
  ### 3. Formación académica
  Incluye tu formación:
  - Grados académicos
  - Instituciones educativas
  - Fechas de graduación
  - Especializaciones o áreas de estudio
  
  ### 4. Áreas de investigación
  Especifica tus campos de interés:
  - Selecciona áreas principales desde nuestro catálogo
  - Añade palabras clave específicas
  - Indica nivel de experiencia en cada área
  
  ### 5. Publicaciones y logros
  Destaca tus contribuciones:
  - Añade tus publicaciones (manualmente o importando desde ORCID/Scopus)
  - Incluye premios y reconocimientos
  - Menciona proyectos destacados
  - Añade enlaces a tu sitio web o perfiles académicos
  
  ## Configuración de privacidad
  
  ### 1. Visibilidad del perfil
  Configura quién puede ver tu información:
  - Perfil público (visible para todos)
  - Visible solo para usuarios registrados
  - Visible solo para conexiones
  - Perfil privado (visible solo para ti)
  
  ### 2. Configuración de notificaciones
  Personaliza cómo quieres recibir actualizaciones:
  - Notificaciones por correo electrónico
  - Notificaciones en la plataforma
  - Frecuencia de resúmenes y actualizaciones
  
  ## Conectando con otros investigadores
  
  ### 1. Búsqueda de contactos
  - Utiliza la función de búsqueda
  - Filtra por institución, área de investigación o ubicación
  - Revisa sugerencias personalizadas basadas en tu perfil
  
  ### 2. Estableciendo conexiones
  - Envía solicitudes de conexión
  - Incluye un mensaje personalizado
  - Responde a solicitudes pendientes
  
  ## Consejos para un perfil efectivo
  - Mantén tu información actualizada
  - Usa una foto profesional y reconocible
  - Escribe una biografía concisa pero informativa
  - Destaca tus áreas de especialización
  - Incluye enlaces a trabajos recientes relevantes
  - Sé específico sobre tus intereses de investigación
  
  ## Solución de problemas comunes
  - **No recibo el correo de verificación**: Verifica tu carpeta de spam o solicita un reenvío
  - **No puedo cambiar mi correo principal**: Contacta con soporte para asistencia
  - **Mi institución no aparece en la lista**: Puedes sugerir que se añada a nuestra base de datos
  
  ¿Necesitas más ayuda? Nuestro [equipo de soporte](mailto:soporte@researchhub.com) está disponible para asistirte.
      `,
      timeToRead: 4,
      viewCount: 1850,
      commentCount: 10
    }
  };
  
  // Para los demás artículos, generamos contenido simulado
  for (const category in mockArticles) {
    mockArticles[category].forEach(article => {
      if (!mockArticleDetails[article.id]) {
        mockArticleDetails[article.id] = {
          ...article,
          content: `
  # ${article.title}
  
  ## Descripción
  Este es un artículo de ejemplo en la categoría ${article.category}.
  
  ## Contenido principal
  Aquí encontrarás información detallada sobre este tema. El contenido específico está en desarrollo.
  
  ## Pasos a seguir
  1. Primer paso de ejemplo
  2. Segundo paso de ejemplo
  3. Tercer paso de ejemplo
  
  ## Consejos útiles
  - Consejo 1: Ejemplo de un consejo útil
  - Consejo 2: Otro consejo útil
  - Consejo 3: Un último consejo
  
  ## Conclusión
  Gracias por leer este artículo. Si necesitas más información, no dudes en contactar con nuestro equipo de soporte.
          `
        };
      }
    });
  }
  
  // Funciones de API para recuperar datos
  export const apiGetSupportHubCategories = <T>(): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCategories as unknown as T);
      }, 500);
    });
  };
  
  export const apiGetSupportHubArticles = <T, P extends { query?: string; topic?: string }>(
    params: P
  ): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [];
        
        if (params.topic) {
          result = mockArticles[params.topic] || [];
        } else if (params.query) {
          const query = params.query.toLowerCase();
          // Buscar en todos los artículos de todas las categorías
          const allArticles = Object.values(mockArticles).flat();
          result = allArticles.filter(
            article => article.title.toLowerCase().includes(query) || 
                      article.category.toLowerCase().includes(query)
          );
        }
        
        resolve(result as unknown as T);
      }, 500);
    });
  };
  
  export const apiGetSupportHubArticleDetails = <T>(id: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const article = mockArticleDetails[id];
        if (article) {
          resolve(article as unknown as T);
        } else {
          reject(new Error("Article not found"));
        }
      }, 500);
    });
  };