import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { TblTramite, DicEtapa } from '@/lib/supabase';

interface TesisProgressProps {
  etapaActual: number;
  tramiteActual: TblTramite | null;
  estadosTramite: DicEtapa[];
}

const TesisProgress: React.FC<TesisProgressProps> = ({ 
  etapaActual = 1, 
  tramiteActual = null, 
  estadosTramite = [] 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Define los pasos del proceso con sus grupos correspondientes
  const pasos = [
    // Proyecto de tesis (pasos 1-8)
    { id: 1, title: "Carga de proyecto", group: "Proyecto de tesis" },
    { id: 2, title: "Revisión de formato", group: "Proyecto de tesis" },
    { id: 3, title: "Revisión del Asesor", group: "Proyecto de tesis" },
    { id: 4, title: "Revisión subdirector", group: "Proyecto de tesis" },
    { id: 5, title: "Sorteo de jurados", group: "Proyecto de tesis" },
    { id: 6, title: "Revisión de jurados", group: "Proyecto de tesis" },
    { id: 7, title: "Dictamen", group: "Proyecto de tesis" },
    { id: 8, title: "Proyecto aprobado", group: "Proyecto de tesis" },
    
    // Borrador de tesis (pasos 9-17)
    { id: 9, title: "Habilitación borrador", group: "Borrador de tesis" },
    { id: 10, title: "Carga de borrador", group: "Borrador de tesis" },
    { id: 11, title: "Revisión de formato", group: "Borrador de tesis" },
    { id: 12, title: "Revisión por jurados", group: "Borrador de tesis" },
    { id: 13, title: "Dictamen de borrador", group: "Borrador de tesis" },
    { id: 14, title: "Preparación sustentación", group: "Borrador de tesis" },
    { id: 15, title: "Sustentación programada", group: "Borrador de tesis" },
    { id: 16, title: "Archivo final", group: "Borrador de tesis" },
    { id: 17, title: "Concluido", group: "Borrador de tesis" }
];

  // Animación al cargar y cuando cambia etapa
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 800);
    return () => clearTimeout(timer);
  }, [etapaActual]);

  // Determinar qué pasos mostrar
  const visibleSteps = expanded 
    ? pasos 
    : pasos.filter((paso) => paso.id <= etapaActual + 2);

  // Agrupar pasos visibles por grupo
  const grupos = [...new Set(visibleSteps.map(paso => paso.group))];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
    >
      <h3 className="font-medium text-base text-gray-800 dark:text-white mb-4">Progreso de Tesis</h3>
      
      <div className="space-y-6">
        <AnimatePresence>
          {grupos.map((grupo, groupIndex) => {
            const pasosFiltrados = visibleSteps.filter(paso => paso.group === grupo);
            const totalPasos = pasos.filter(paso => paso.group === grupo).length;
            const completados = pasos.filter(paso => paso.group === grupo && paso.id < etapaActual).length;
            const porcentaje = (completados / totalPasos) * 100;
            
            const esProyecto = grupo === "Proyecto de tesis";
            const colorClase = esProyecto 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-purple-600 dark:text-purple-400";
            const bgClase = esProyecto 
              ? "bg-blue-500 dark:bg-blue-600" 
              : "bg-purple-500 dark:bg-purple-600";
            const bgClaroClase = esProyecto 
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300" 
              : "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300";
            
            return (
              <motion.div
                key={grupo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="space-y-4"
              >
                {/* Encabezado del grupo con barra de progreso */}
                <div className="flex items-center justify-between">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: groupIndex * 0.1 + 0.2, type: "spring" }}
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${bgClaroClase}`}
                  >
                    {grupo}
                  </motion.span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {completados} de {totalPasos}
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${bgClase}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentaje}%` }}
                    transition={{ duration: 1, delay: groupIndex * 0.1 + 0.3, ease: "easeOut" }}
                  />
                </div>
                
                {/* Pasos en formato vertical */}
                <div className="space-y-0.5">
                  <AnimatePresence>
                    {pasosFiltrados.map((paso, index) => {
                      const isCompleted = paso.id < etapaActual;
                      const isCurrent = paso.id === etapaActual;
                      
                      return (
                        <motion.div 
                          key={paso.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                            isCurrent 
                              ? esProyecto 
                                ? "bg-blue-50/50 dark:bg-blue-900/10" 
                                : "bg-purple-50/50 dark:bg-purple-900/10"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          {/* Círculo indicador */}
                          <motion.div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCompleted 
                                ? `${bgClase} text-white`
                                : isCurrent 
                                  ? `border-2 ${esProyecto ? "border-blue-500" : "border-purple-500"} bg-white dark:bg-gray-900`
                                  : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                            }`}
                            animate={isCurrent && animate ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.6 }}
                          >
                            {isCompleted ? (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1 }}
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </motion.svg>
                            ) : (
                              <span className="text-md font-medium" style={{
                                color: isCurrent ? (esProyecto ? '#3b82f6' : '#8b5cf6') : '#9ca3af'
                              }}>
                                {paso.id}
                              </span>
                            )}
                          </motion.div>
                          
                          {/* Título */}
                          <div className="ml-3 flex-grow">
                            <span 
                              className={`text-sm transition-all duration-300 ${
                                isCompleted 
                                  ? colorClase
                                  : isCurrent 
                                    ? "font-medium text-gray-800 dark:text-white" 
                                    : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {paso.title}
                            </span>
                          </div>
                          
                          {/* Indicador de etapa actual */}
                          {isCurrent && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="ml-2 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Botón para expandir/contraer */}
      <AnimatePresence>
        {!expanded && visibleSteps.length < pasos.length && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setExpanded(true)}
            className="mt-5 w-full flex items-center justify-center py-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors border-t border-gray-100 dark:border-gray-800"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Ver todas las etapas
          </motion.button>
        )}
        
        {expanded && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setExpanded(false)}
            className="mt-5 w-full flex items-center justify-center py-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors border-t border-gray-100 dark:border-gray-800"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Ver menos
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TesisProgress;