import Container from '@/components/shared/Container'
import Categories from './Categories'
import ArticleList from './ArticleList'
import { useHelpCenterStore } from '@/services/store/helpCenterStore'

const BodySection = () => {
    const queryText = useHelpCenterStore((state) => state.queryText)
    const selectedTopic = useHelpCenterStore((state) => state.selectedTopic)

    return (
        <div className="my-12 bg-white dark:bg-gray-800">
            <Container>
                <div className="max-w-[1200px] mx-auto px-6">
                    {queryText || selectedTopic ? (
                        <ArticleList query={queryText} topic={selectedTopic} />
                    ) : (
                        <Categories />
                    )}
                </div>
            </Container>
        </div>
    )
}

export default BodySection