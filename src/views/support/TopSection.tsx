import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Container from '@/components/shared/Container'
import { useHelpCenterStore } from '@/services/store/helpCenterStore'
import { TbArrowNarrowLeft, TbSearch } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom';

const TopSection = () => {
    const navigate = useNavigate()
    const inputRef = useRef<HTMLInputElement>(null)
    const setQueryText = useHelpCenterStore((state) => state.setQueryText)
    const setSelectedTopic = useHelpCenterStore(
        (state) => state.setSelectedTopic,
    )

    const handleSetQueryText = () => {
        const value = inputRef.current?.value

        if (value) {
            setQueryText(inputRef.current?.value as string)
            setSelectedTopic('')
        }
    }

    return (
        <section className="flex flex-col justify-center h-[300px] bg-gradient-to-tr from-indigo-100 via-violet-100 to-fuchsia-100 dark:from-indigo-800 dark:via-violet-900 dark:to-fuchsia-900">
            
            <Container className="flex flex-col items-center px-4">
                <div className="mb-6 flex flex-col items-center">
                    <h2 className="flex items-center gap-4 mb-4 text-center dark:text-white pr-12">
                    <button
                        className=" outline-none rounded-full p-2 text-xl bg-white hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:hover:text-gray-100 shadow-sm transition-colors duration-200"
                        onClick={() => navigate('/')}
                    >
                        <TbArrowNarrowLeft />
                    </button>
                        Centro de Asistencia y Soporte
                    </h2>
                    <p className="max-w-[350px] text-center dark:text-gray-200">
                        Busca respuestas, explora nuestras preguntas frecuentes y accede a recursos de soporte en un solo lugar.
                    </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl min-h-[50px] px-3 flex flex-col bg-white dark:bg-gray-800 max-w-[800px] w-full">
                    <div className="flex items-center gap-2 w-full h-[56px]">
                        <input
                            ref={inputRef}
                            className="flex-1 h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-semibold font-semibold bg-transparent focus:outline-none heading-text dark:text-white"
                            placeholder="Escribe para buscar un artículo"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleSetQueryText()
                                }

                                if (
                                    event.key === 'Backspace' &&
                                    (event.target as HTMLInputElement).value
                                        .length <= 1
                                ) {
                                    setQueryText('')
                                }
                            }}
                        />
                        <Button
                            size="xs"
                            shape="circle"
                            variant="solid"
                            icon={<TbSearch />}
                            onClick={handleSetQueryText}
                        />
                    </div>
                </div>
            </Container>
        </section>
    )
}

export default TopSection