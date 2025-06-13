// src/views/ServicePages/TesistaService/components/FAQ.tsx - Con animaciones motion
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaChevronUp, FaChevronDown, FaQuestionCircle } from 'react-icons/fa';

// Datos de preguntas frecuentes
const faqData = [
    {
        question: "¿Cuánto tiempo tengo para desarrollar mi proyecto de tesis?",
        answer: "Desde la aprobación del proyecto de tesis tienes un mínimo de 90 días y un máximo de 2 años para iniciar el proceso de Borrador de tesis. Este plazo está establecido en el reglamento académico."
    },
    {
        question: "¿Qué documentos necesito para iniciar el proceso de borrador de tesis?",
        answer: "Necesitas presentar: 1) Copia simple de DNI, 2) Copia legalizada o fedateada del grado de bachiller, 3) Copia simple de la Resolución Rectoral del bachiller, y 4) Copia simple del acta de aprobación del proyecto de tesis."
    },
    {
        question: "¿Qué sucede si los jurados no responden en el plazo establecido?",
        answer: "Si los jurados no emiten dictaminación alguna dentro de los cinco días establecidos, se considera que están de acuerdo con el proyecto. Esto se denomina 'Aprobación por reglamento' según el Art. 12° del reglamento."
    },
    {
        question: "¿Puedo modificar el título de mi proyecto durante el proceso?",
        answer: "Sí, durante la etapa de borrador de tesis es posible modificar el título, resumen, palabras clave y conclusiones, siempre que haya consenso con todos los jurados y el asesor/director del proyecto."
    },
    {
        question: "¿Cómo se lleva a cabo la sustentación de tesis?",
        answer: "La sustentación es un acto formal y público que se realiza en las instalaciones de la universidad. Tienes 25 minutos para presentar los resultados, seguido de preguntas de los jurados (máximo 90 minutos en total). Se requiere la presencia de al menos 3 miembros del jurado."
    }
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // Primera pregunta abierta por defecto

    return (
        <div className="space-y-4">
            {faqData.map((faq, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                >
                    <motion.div
                        className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden
                                 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300"
                        whileHover={{ scale: 1.01 }}
                        layout
                    >
                        <motion.button
                            className={`w-full text-left px-5 py-4 flex justify-between items-center transition-all duration-300 ${
                                openIndex === index
                                    ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primary'
                                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className="flex items-start space-x-3">
                                <motion.div
                                    className={`p-1 rounded-full ${openIndex === index ? 'text-primary' : 'text-gray-400'}`}
                                    animate={{ rotate: openIndex === index ? 360 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <FaQuestionCircle size={16} />
                                </motion.div>
                                <span className="font-medium">
                                    {faq.question}
                                </span>
                            </div>
                            <motion.div
                                animate={{ rotate: openIndex === index ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                            </motion.div>
                        </motion.button>

                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <motion.div
                                        initial={{ y: -10 }}
                                        animate={{ y: 0 }}
                                        exit={{ y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="px-5 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600"
                                    >
                                        <motion.p 
                                            className="text-gray-700 dark:text-gray-200 leading-relaxed"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            {faq.answer}
                                        </motion.p>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            ))}

            {/* Información adicional */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: faqData.length * 0.1 + 0.2 }}
                className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
            >
                <div className="flex space-x-3">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                        <FaQuestionCircle className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                    </motion.div>
                    <div>
                        <h3 className="font-semibold text-blue-700 dark:text-blue-400">
                            ¿Tienes más preguntas?
                        </h3>
                        <p className="text-blue-600 dark:text-blue-300 text-sm">
                            Si no encuentras la respuesta a tu pregunta, puedes contactar al coordinador de tu escuela 
                            o enviar un correo electrónico al área de apoyo académico.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FAQ;