import Avatar from '@/components/ui/Avatar'
import IconText from '@/components/shared/IconText'
import { getIconComponent, categoryLabel } from './utils'
import classNames from '@/utils/classNames'
import { useNavigate } from 'react-router-dom'
import { TbEye, TbMessage } from 'react-icons/tb'

type ArticleProps = {
    id: string
    isLastChild: boolean
    category: string
    title: string
    timeToRead: number
    viewCount: number
    commentCount: number
}

const Article = ({
    id,
    isLastChild,
    category,
    title,
    timeToRead,
    viewCount,
    commentCount,
}: ArticleProps) => {
    const navigate = useNavigate()

    const handleArticleClick = () => {
        navigate(`/support/article/${id}`)
    }

    return (
        <div
            className={classNames(
                'flex items-center justify-between py-6 border-gray-200 dark:border-gray-700 group cursor-pointer',
                isLastChild && 'border-b',
            )}
            role="button"
            onClick={handleArticleClick}
        >
            <div className="flex items-center gap-4">
                <Avatar
                    className="bg-gray-100 dark:bg-gray-700"
                    size={50}
                    icon={
                        <span className="heading-text">
                            {getIconComponent(category)}
                        </span>
                    }
                    shape="round"
                />
                <div>
                    <h6 className="font-bold group-hover:text-primary dark:text-white">
                        {title}
                    </h6>
                    <div className="flex items-center gap-2 dark:text-gray-400">
                        <span>{timeToRead} min lectura</span>
                        <span>•</span>
                        <span>{categoryLabel[category] || category}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 dark:text-gray-300">
                <IconText
                    className="font-semibold"
                    icon={<TbEye className="text-xl" />}
                >
                    {viewCount}
                </IconText>
                <IconText
                    className="font-semibold"
                    icon={<TbMessage className="text-xl" />}
                >
                    {commentCount}
                </IconText>
            </div>
        </div>
    )
}

export default Article