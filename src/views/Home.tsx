import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const SIICPlatform = () => {
    // Estado para modo oscuro/claro
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Estado para controlar el menú en móvil
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Referencias para elementos DOM
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef(null);
    const imagesRef = useRef<HTMLDivElement[]>([])

    // Valores de scroll para animaciones
    const { scrollYProgress } = useScroll({
        target: scrollRef,
        offset: ["start start", "end end"]
    });

    // Transformaciones basadas en scroll
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
    const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

    // Valores de resorte para animaciones más fluidas
    const scrollYSpring = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Imágenes para visualización (en producción se usarían imágenes reales de investigación académica)
    const academicImages = [
        { src: "/img/institucional/logo_vri.png", width: 230, height: 230, type: "research" },
        { src: "/img/institucional/Logo_UNAP.png", width: 200, height: 200, type: "lab" },
        { src: "/img/institucional/logo_ii.jpeg", width: 220, height: 280, type: "student" },
        { src: "/img/institucional/pilar_pos.png", width: 210, height: 260, type: "thesis" },
        { src: "/img/institucional/pilar-tes.png", width: 220, height: 180, type: "collaboration" },
        { src: "/img/institucional/logo_ii.jpeg", width: 250, height: 180, type: "paper" },
        { src: "/img/institucional/Logo_UNAP.png", width: 180, height: 180, type: "publication" },
        { src: "/img/institucional/logo_vri.png", width: 180, height: 220, type: "campus" },
        { src: "/img/institucional/pilar_pos.png", width: 240, height: 160, type: "data" },
        { src: "/img/institucional/pilar-tes.png", width: 200, height: 250, type: "research" },
        { src: "/img/institucional/Logo_UNAP.png", width: 230, height: 230, type: "lab" },
        { src: "/img/institucional/logo_ii.jpeg", width: 190, height: 240, type: "conference" },
    ];

    // Configuración para la distribución de imágenes
    // Algunas estarán configuradas para moverse hacia el centro
    const imagePositions = [
        { x: 15, y: 20, scale: 1.0, rotation: -4, delay: 0.2, moveToCenter: true, centerDelay: 5 },
        { x: 75, y: 15, scale: 0.85, rotation: 3, delay: 0.5, moveToCenter: false },
        { x: 25, y: 70, scale: 0.9, rotation: -2, delay: 0.3, moveToCenter: false },
        { x: 80, y: 65, scale: 1.05, rotation: 5, delay: 0.7, moveToCenter: true, centerDelay: 6 },
        { x: 10, y: 40, scale: 0.95, rotation: -3, delay: 0.4, moveToCenter: false },
        { x: 60, y: 10, scale: 0.9, rotation: 2, delay: 0.6, moveToCenter: false },
        { x: 70, y: 80, scale: 1.1, rotation: -5, delay: 0.2, moveToCenter: true, centerDelay: 7 },
        { x: 20, y: 85, scale: 0.85, rotation: 4, delay: 0.8, moveToCenter: false },
        { x: 40, y: 30, scale: 1.0, rotation: -2, delay: 0.5, moveToCenter: true, centerDelay: 8 },
        { x: 85, y: 40, scale: 0.9, rotation: 3, delay: 0.3, moveToCenter: false },
        { x: 45, y: 75, scale: 0.95, rotation: -4, delay: 0.6, moveToCenter: false },
        { x: 55, y: 50, scale: 1.0, rotation: 2, delay: 0.4, moveToCenter: true, centerDelay: 9 },
    ];


    // Función para cambiar el tema
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Toggle para el menú móvil
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Efecto para manejar el evento de scroll suave
    // Efecto para manejar el evento de scroll suave
    useEffect(() => {
        const handleScrollClick = (e: Event, targetId: string) => {
            e.preventDefault();
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
            if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        // Para el botón de explorar funcionalidades, mejor usar un enfoque directo
        const scrollButton = document.getElementById('scroll-button');
        if (scrollButton) {
            // Usar un manejador de clic simple para dispositivos móviles
            const scrollToFlowSection = (e: Event) => {
                e.preventDefault();
                const flowSection = document.getElementById('flow-section');
                if (flowSection) {
                    flowSection.scrollIntoView({ behavior: 'smooth' });
                }
            };

            // Eliminar manejadores anteriores para evitar duplicados
            scrollButton.removeEventListener('click', scrollToFlowSection);
            // Agregar el nuevo manejador
            scrollButton.addEventListener('click', scrollToFlowSection);
        }

        // Resto del código...

        return () => {
            // Limpieza...
            const scrollButton = document.getElementById('scroll-button');
            if (scrollButton) {
                scrollButton.removeEventListener('click', (e) => {
                    const flowSection = document.getElementById('flow-section');
                    if (flowSection) {
                        flowSection.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        };
    }, [isMobileMenuOpen]);

    // Bloqueo del scroll cuando el menú móvil está abierto
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]);

    // Efecto para ocultar el menú móvil al hacer scroll
    useEffect(() => {
        const handleScroll = () => {
            if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isMobileMenuOpen]);


    const navigate = useNavigate();
    
    return (
        <div
            ref={containerRef}
            className={`min-h-screen transition-colors duration-700 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'
                }`}
        >
            <div ref={scrollRef} className="relative">
                {/* Imágenes flotantes con animaciones - ocultas en móvil para mejor rendimiento */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
                    {academicImages.map((img, index) => {
                        const position = imagePositions[index % imagePositions.length];

                        return (
                            <motion.div
                                key={index}
                                ref={(el) => { if (el) imagesRef.current[index] = el; }}
                                className="absolute rounded-md overflow-hidden shadow-lg"
                                style={{
                                    width: img.width * position.scale * 0.55,
                                    height: img.height * position.scale * 0.55,
                                    left: `${position.x}%`,
                                    top: `${position.y}%`,
                                    zIndex: index % 5,
                                    originX: 0.5,
                                    originY: 0.5,
                                    rotate: position.rotation,
                                    opacity: 0,
                                    willChange: 'transform, opacity'
                                }}
                                initial={{
                                    opacity: 0,
                                    scale: 0.8,
                                    x: 0,
                                    y: 0,
                                }}
                                animate={{
                                    opacity: 0.8,
                                    scale: 1,
                                    x: position.moveToCenter ? ["10%", "25%", "0%"] : 0,
                                    y: position.moveToCenter ? ["0%", "20%", "10%"] : 0,
                                    transition: {
                                        delay: position.delay * 1.3,
                                        duration: position.moveToCenter ? 3 : 5,
                                        repeat: position.moveToCenter ? Infinity : Infinity,
                                        repeatType: "reverse",
                                        repeatDelay: position.moveToCenter ? position.centerDelay : 0,
                                        ease: "easeInOut",
                                    }
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                                    transition: { duration: 0.2, ease: "easeOut" } // Fixed hover animation speed
                                }}
                            >
                                <motion.div
                                    className="w-full h-full relative"
                                    animate={{
                                        rotate: position.moveToCenter ? 0 : [0, position.rotation < 0 ? -1 : 1, 0],
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        ease: "easeInOut"
                                    }}
                                >
                                    <img
                                        src={img.src}
                                        alt={`${img.type} image`}
                                        className="w-full h-full object-cover"
                                        style={{
                                            filter: isDarkMode ? 'brightness(0.8) contrast(1.1)' : 'contrast(1)',
                                        }}
                                    />
                                    <motion.div
                                        className={`absolute inset-0 ${isDarkMode ? 'border border-gray-800' : 'border-2 border-white shadow-md'
                                            }`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: position.delay + 0.5, duration: 0.8 }}
                                    />
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Overlay semitransparente con gradiente */}
                <motion.div
                    className={`fixed inset-0 ${isDarkMode ? 'bg-gradient-to-b from-gray-950 to-gray-900' : 'bg-gradient-to-b from-gray-50 to-gray-100'
                        }`}
                    animate={{ opacity: isDarkMode ? 0.85 : 0.7 }}
                    transition={{ duration: 1 }}
                />

                {/* Hero Section */}
                <motion.div
                    className="relative min-h-screen flex flex-col z-10"
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                >
                    {/* Barra de navegación */}
                    <motion.header
                        className="fixed top-0 w-full flex justify-center py-4 md:py-6 z-30"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <motion.div
                            className={`w-11/12 md:w-auto flex items-center justify-between gap-4 px-4 md:px-8 py-3 rounded-full ${isDarkMode
                                ? 'bg-gray-900/90 backdrop-blur-lg border border-gray-800'
                                : 'bg-white/90 backdrop-blur-lg border border-gray-100 shadow-sm'
                                }`}
                            whileHover={{
                                y: -2,
                                boxShadow: isDarkMode
                                    ? '0 10px 25px rgba(0,0,0,0.3)'
                                    : '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                            transition={{ duration: 0.2, ease: "easeOut" }} // Consistent hover animation
                        >
                            {/* Logo/icono */}
                            <motion.div
                                className="flex items-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2, ease: "easeOut" }} // Consistent hover animation
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'
                                    }`}>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <span className="font-bold text-lg">SIIC</span>
                            </motion.div>

                            {/* Enlaces de navegación para desktop */}
                            <nav className="hidden md:flex items-center gap-6">
                                {['Inicio', 'Documentos', 'Ayuda'].map((item, i) => (
                                    <motion.a
                                        key={item}
                                        href={`#${item.toLowerCase()}`}
                                        className="nav-link text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 0.8 }}
                                        transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        {item}
                                    </motion.a>
                                ))}
                            </nav>

                            {/* Botones de acceso desktop */}
                            <div className="hidden md:flex items-center gap-3">
                                <motion.button
                                    className={`px-5 py-2 text-sm rounded-full border transition-colors ${isDarkMode
                                        ? 'border-gray-700 text-white hover:bg-gray-800'
                                        : 'border-gray-200 text-gray-800 hover:bg-gray-100'
                                        }`}
                                    onClick={() => navigate(`/sign-in`)}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Iniciar sesión
                                </motion.button>

                                <motion.button
                                    className={`px-5 py-2 text-sm rounded-full transition-colors ${isDarkMode
                                        ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                    onClick={() => navigate(`/sign-up`)}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Registrarse
                                </motion.button>
                            </div>

                            {/* Botón de menú móvil */}
                            <motion.button
                                className="md:hidden flex items-center justify-center w-10 h-10"
                                onClick={toggleMobileMenu}
                                whileTap={{ scale: 0.9 }}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    {isMobileMenuOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </motion.button>
                        </motion.div>
                    </motion.header>

                    {/* Menú móvil desplegable */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                className="fixed inset-0 z-20 pt-20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    className={`w-full h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'
                                        } flex flex-col px-6 py-8`}
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <nav className="flex flex-col gap-6 mb-8">
                                        {['Inicio', 'Documentos', 'Ayuda'].map((item, i) => (
                                            <motion.a
                                                key={item}
                                                href={`#${item.toLowerCase()}`}
                                                className="nav-link text-xl font-medium"
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {item}
                                            </motion.a>
                                        ))}
                                    </nav>

                                    <div className="flex flex-col gap-4 mt-auto">
                                        <motion.button
                                            className={`w-full py-3 text-center text-base rounded-full border transition-colors ${isDarkMode
                                                ? 'border-gray-700 text-white hover:bg-gray-800'
                                                : 'border-gray-200 text-gray-800 hover:bg-gray-100'
                                                }`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.3 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Iniciar sesión
                                        </motion.button>

                                        <motion.button
                                            className={`w-full py-3 text-center text-base rounded-full transition-colors ${isDarkMode
                                                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                }`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.4 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Registrarse
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Contenido principal del hero */}
                    <motion.main className="flex-grow flex flex-col items-center justify-center px-4 pb-20">
                        <motion.h1
                            className={`text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-4 text-center ${isDarkMode ? 'text-white' : ''
                                }`}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 1,
                                delay: 0.3,
                                type: "spring",
                                stiffness: 100
                            }}
                        >
                            SIIC
                            <motion.span
                                className="align-super text-sm"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1.3 }}
                            >®</motion.span>
                        </motion.h1>

                        <motion.div
                            className="mt-6 max-w-2xl text-center mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.9 }}
                        >
                            <motion.h2
                                className={`text-xl md:text-2xl mb-4 ${isDarkMode ? 'text-white' : ''
                                    }`}
                                animate={{ opacity: [0.85, 1, 0.85] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                Sistema Integral de Investigación Científica
                            </motion.h2>
                            <motion.div
                                className={`inline-flex items-center px-4 py-2 rounded-full ${isDarkMode ? 'bg-indigo-900/80' : 'bg-indigo-50'
                                    }`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 1.1 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <span className="text-base sm:text-lg font-medium">
                                    Gestión académica universitaria
                                </span>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.2 }}
                        >
                            <motion.button
                                className={`px-6 sm:px-8 py-3 rounded-full font-medium ${isDarkMode
                                    ? 'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
                                    }`}
                                onClick={() => navigate(`/sign-in`)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }} // Consistent hover animation
                            >
                                Comenzar ahora
                            </motion.button>

                            <motion.button
                                className={`px-6 sm:px-8 py-3 rounded-full font-medium border ${isDarkMode
                                    ? 'border-gray-700 text-white hover:bg-gray-800 active:bg-gray-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }} // Consistent hover animation
                            >
                                Ver demostración
                            </motion.button>
                        </motion.div>
                    </motion.main>

                    {/* Indicador de scroll con animación mejorada */}
                    <motion.div
                        id="scroll-button"
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        role="button"
                        tabIndex={0}
                        aria-label="Explorar funcionalidades"
                    >
                        <motion.span
                            className={`mb-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        >
                            Explorar funcionalidades
                        </motion.span>
                        <motion.div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'
                                }`}
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
                            whileHover={{ scale: 1.1, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                        >
                            <motion.svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                animate={{ y: [0, 3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                            >
                                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                            </motion.svg>
                        </motion.div>
                    </motion.div>

                    {/* Selector de tema (fixed) - Corregido para permanecer visible siempre */}

                </motion.div>
                <motion.div
                    className="fixed bottom-6 left-6 z-20"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                // Eliminar la transformación basada en scroll para mantenerlo visible
                >
                    {/* Mantener siempre el selector completo visible, quitamos la condición */}
                    <motion.div
                        className={`px-1 py-1 rounded-full border flex items-center ${isDarkMode ? 'border-gray-700 bg-gray-900/70 backdrop-blur-md' : 'border-gray-200 bg-white/70 backdrop-blur-md shadow-sm'
                            }`}
                        whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                        transition={{ duration: 0.2, ease: "easeOut" }} // Consistencia en animaciones
                    >
                        <motion.button
                            onClick={() => setIsDarkMode(true)}
                            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-white font-medium' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            whileHover={!isDarkMode ? { backgroundColor: 'rgba(0,0,0,0.05)' } : {}}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }} // Consistencia en animaciones
                        >
                            Oscuro
                        </motion.button>
                        <motion.button
                            onClick={() => setIsDarkMode(false)}
                            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${!isDarkMode ? 'bg-gray-200 text-black font-medium' : 'text-gray-400 hover:text-gray-300'
                                }`}
                            whileHover={isDarkMode ? { backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }} // Consistencia en animaciones
                        >
                            Claro
                        </motion.button>
                    </motion.div>
                </motion.div>


                {/* Sección Flujo de Trabajo con corrección para el tema oscuro */}
                <section id='flow-section' className={`relative z-10 py-20 sm:py-32 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50'
                    }`}>
                    <div className="container mx-auto px-4 sm:px-6 md:px-8">
                        <motion.h2
                            
                            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center ${isDarkMode ? ' text-white ' : ''
                            }`}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                        >
                            Optimice su flujo de trabajo académico
                        </motion.h2>

                        <motion.p
                            className={`text-lg sm:text-xl text-center max-w-3xl mx-auto mb-16 sm:mb-20 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Gestione todo el ciclo de trámites académicos, desde la solicitud hasta la sustentación final
                        </motion.p>

                        {/* Timeline de proceso con animaciones mejoradas */}
                        <div className="max-w-4xl mx-auto">
                            {[
                                {
                                    title: "Registro de trámites",
                                    description: "Inicie el proceso con el registro detallado de la solicitud, asociando tesistas, líneas de investigación y modalidades.",
                                    icon: (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: "Iteraciones y revisiones",
                                    description: "Facilite el proceso de mejora a través de iteraciones del documento con registro histórico de cada versión.",
                                    icon: (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    )
                                },
                                {
                                    title: "Conformación de jurados",
                                    description: "Gestione la asignación de jurados para evaluación de tesis, considerando especialidades y evitando conflictos de interés.",
                                    icon: (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: "Correcciones y observaciones",
                                    description: "Recopile y gestione sistemáticamente las observaciones de los revisores para asegurar la calidad de los trabajos.",
                                    icon: (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: "Programación de sustentación",
                                    description: "Coordine fecha, lugar y detalles para la sustentación final, con notificaciones automáticas a todos los participantes.",
                                    icon: (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: "Registro de actas y dictámenes",
                                    description: "Genere automáticamente actas de sustentación con los resultados y conclusiones del proceso académico.",
                                    icon: (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )
                                }
                            ].map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="flex mb-12 last:mb-0"
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.06,
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 20
                                    }}
                                    whileHover={{
                                        x: index % 2 === 0 ? -5 : 5,
                                        transition: { duration: 0.2, ease: "easeOut" } // Consistencia en animaciones
                                    }}
                                >
                                    <div className={`flex-shrink-0 w-14 sm:w-16 h-14 sm:h-16 rounded-full flex items-center justify-center mr-4 sm:mr-6 ${isDarkMode ? 'bg-indigo-900/80 shadow-lg shadow-indigo-900/20' : 'bg-indigo-100 shadow-md shadow-indigo-200/50'
                                        }`}>
                                        <div className={isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}>
                                            {step.icon}
                                        </div>
                                    </div>

                                    <div className="flex-grow pt-1">
                                        <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : ''
                                        }`}
                                        >{step.title}</h3>
                                        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>





                {/* Footer con mejor contraste y responsividad */}
                <footer className={`relative z-10 py-12 sm:py-16 ${isDarkMode ? 'bg-gray-950 border-t border-gray-800 text-white' : 'bg-gray-100 border-t border-gray-200'
                    }`}>
                    <div className="container mx-auto px-4 sm:px-6 md:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                            {/* Columna principal con logo y descripción */}
                            <motion.div
                                className="md:col-span-4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="flex items-center mb-6">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${isDarkMode ? 'bg-indigo-600 shadow-lg shadow-indigo-900/30' : 'bg-indigo-600 shadow-md shadow-indigo-500/20'
                                        }`}>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <span className="text-2xl font-bold">SIIC</span>
                                </div>

                                <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                    Sistema Integral de Investigación Científica: Plataforma académica para la gestión completa de trámites, tesis, investigación y sustentaciones en el ámbito universitario.
                                </p>

                                <div className="flex space-x-4 mb-8">
                                    {['facebook', 'twitter', 'linkedin', 'github'].map((social, index) => (
                                        <motion.a
                                            key={social}
                                            href={`#${social}`}
                                            className={`h-10 w-10 rounded-full flex items-center justify-center border ${isDarkMode
                                                ? 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white hover:bg-gray-800'
                                                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-200'
                                                }`}
                                            whileHover={{ scale: 1.1, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            initial={{ opacity: 0, scale: 0 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.2,
                                                ease: "easeOut",
                                                type: "spring",
                                                stiffness: 260,
                                                damping: 20,
                                                delay: 0.2 + index * 0.1
                                            }}
                                        >
                                            <span className="sr-only">{social}</span>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                                            </svg>
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Enlaces y navegación */}
                            <div className="md:col-span-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                    {[
                                        {
                                            title: "Plataforma",
                                            links: ["Características", "Seguridad", "Precios", "Implementación", "Soporte"]
                                        },
                                        {
                                            title: "Recursos",
                                            links: ["Documentación", "Guías", "Tutoriales", "API", "Descargas"]
                                        },
                                        {
                                            title: "Empresa",
                                            links: ["Acerca de", "Equipo", "Instituciones", "Blog", "Contacto"]
                                        }
                                    ].map((column, colIndex) => (
                                        <motion.div
                                            key={colIndex}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: 0.2 + colIndex * 0.1 }}
                                        >
                                            <h3 className="font-bold text-lg mb-4">{column.title}</h3>
                                            <ul className="space-y-3">
                                                {column.links.map((link, linkIndex) => (
                                                    <motion.li
                                                        key={linkIndex}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 0.4, delay: 0.3 + colIndex * 0.1 + linkIndex * 0.05 }}
                                                    >
                                                        <a
                                                            href={`#${link.toLowerCase()}`}
                                                            className={`text-sm hover:underline ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                                                }`}
                                                        >
                                                            {link}
                                                        </a>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Copyright y términos */}
                        <motion.div
                            className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-300'
                                } flex flex-col md:flex-row justify-between items-center`}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                } mb-4 md:mb-0 text-center md:text-left`}>
                                © 2025 SIIC. Sistema Integral de Investigación Científica. Todos los derechos reservados.
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
                                {['Términos', 'Privacidad', 'Seguridad'].map((item, index) => (
                                    <motion.a
                                        key={item}
                                        href={`#${item.toLowerCase()}`}
                                        className={`text-sm hover:underline ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        whileHover={{ y: -1 }}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                                    >
                                        {item}
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </footer>

                {/* Botón para volver arriba con animación mejorada - Corregido para ser visible */}

            </div>
        </div>
    );
};

export default SIICPlatform;