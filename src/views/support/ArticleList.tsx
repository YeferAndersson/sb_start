import { useEffect } from 'react'
import Article from './Article'
import { categoryLabel } from './utils'
import { useHelpCenterStore } from '@/services/store/helpCenterStore'
import { apiGetSupportHubArticles } from '@/services/HelpCenterService'
import isLastChild from '@/utils/isLastChild'
import NoDataFound from '@/assets/svg/NoDataFound'
import useSWRMutation from 'swr/mutation'
import { TbArrowNarrowLeft } from 'react-icons/tb'
import type { GetSupportHubArticlesResponse } from './types'

type ArticlesProps = {
    query: string
    topic: string
}

const ArticleList = ({ query, topic }: ArticlesProps) => {
    const { trigger, data } = useSWRMutation(
        [`/api/helps/articles`, { query, topic }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) =>
            apiGetSupportHubArticles<
                GetSupportHubArticlesResponse,
                { query: string; topic: string }
            >(params),
    )

    const setQueryText = useHelpCenterStore((state) => state.setQueryText)
    const setSelectedTopic = useHelpCenterStore(
        (state) => state.setSelectedTopic,
    )

    useEffect(() => {
        if (topic || query) {
            trigger()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic, query])

    const handleBack = () => {
        setQueryText('')
        setSelectedTopic('')
    }

    return (
        <div className="bg-white dark:bg-gray-800">
            {query && data && data.length > 0 && (
                <div className="mb-6">
                    <h3 className="dark:text-white">
                        <span className="font-normal">Resultados de: </span>
                        <span className="font-semibold"> {query}</span>
                    </h3>
                </div>
            )}
            {query && data && data.length === 0 && (
                <div className="text-center mt-20">
                    <div className="flex justify-center">
                        <NoDataFound height={280} width={280} />
                    </div>
                    <h3 className="mt-8 dark:text-white">¡No se encontraron artículos!</h3>
                </div>
            )}
            {topic && data && (
                <div className="mb-6">
                    <h4 className="flex items-center gap-4 dark:text-white">
                        <button
                            className="outline-none rounded-full p-2 text-xl bg-white dark:bg-gray-700 hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-600 dark:hover:text-gray-100 transition-colors"
                            onClick={handleBack}
                        >
                            <TbArrowNarrowLeft />
                        </button>
                        {categoryLabel[topic]}
                    </h4>
                </div>
            )}
            {data &&
                data.map((article, index) => (
                    <Article
                        key={article.id}
                        id={article.id}
                        category={article.category}
                        title={article.title}
                        timeToRead={article.timeToRead}
                        viewCount={article.viewCount}
                        commentCount={article.commentCount}
                        isLastChild={!isLastChild(data, index)}
                    />
                ))}
        </div>
    )
}

export default ArticleList