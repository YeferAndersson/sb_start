// src/views/pilar_pregrado/estudiantes/components/FAQ.tsx
import React, { useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

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
                <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                >
                    <button
                        className={`w-full text-left px-5 py-4 flex justify-between items-center ${openIndex === index
                            ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primary'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                        <span className="font-medium">
                            {faq.question}
                        </span>
                        {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                    </button>

                    {openIndex === index && (
                        <div className="px-5 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-gray-700 dark:text-gray-200">{faq.answer}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FAQ;