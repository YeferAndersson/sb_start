import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@/components/shared/Container';
import { apiGetSupportHubArticleDetails } from '@/services/HelpCenterService';
import { TbArrowNarrowLeft, TbEye, TbMessage, TbClock } from 'react-icons/tb';
import { categoryLabel } from './utils';
import useSWR from 'swr';
import { Avatar } from '@/components/ui';
import IconText from '@/components/shared/IconText';
import type { GetSupportHubArticleDetailsResponse } from './types';

const renderMarkdown = (markdown: string): string => {
    if (!markdown) return '';
    
    const htmlBlocks: string[] = [];
    let preservedMarkdown = markdown.replace(/<(iframe|video|div)[^>]*>[\s\S]*?<\/(iframe|video|div)>/gi, (match) => {
      htmlBlocks.push(match);
      return `HTML_BLOCK_${htmlBlocks.length - 1}`;
    });
    
    const lines = preservedMarkdown.split('\n');
    let html = '';
    let inList = false;
    let listType = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('HTML_BLOCK_')) {
        const blockIndex = parseInt(line.replace('HTML_BLOCK_', ''));
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
          inList = false;
        }
        html += `<div class="video-container my-6">${htmlBlocks[blockIndex]}</div>`;
        continue;
      }
      
      if (line.startsWith('# ')) {
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
          inList = false;
        }
        html += `<h1 class="text-3xl font-bold mt-6 mb-4 dark:text-white">${line.substring(2)}</h1>`;
      } 
      else if (line.startsWith('## ')) {
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
          inList = false;
        }
        html += `<h2 class="text-2xl font-bold mt-5 mb-3 dark:text-white">${line.substring(3)}</h2>`;
      } 
      else if (line.startsWith('### ')) {
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
          inList = false;
        }
        html += `<h3 class="text-xl font-bold mt-4 mb-2 dark:text-white">${line.substring(4)}</h3>`;
      } 
      else if (line.startsWith('#### ')) {
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
          inList = false;
        }
        html += `<h4 class="text-lg font-bold mt-3 mb-2 dark:text-white">${line.substring(5)}</h4>`;
      }
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList || listType !== 'ul') {
          if (inList) html += `</ul>`;
          html += `<ul class="list-disc pl-6 my-3">`;
          inList = true;
          listType = 'ul';
        }
        html += `<li class="mb-1 dark:text-gray-300">${line.substring(2)}</li>`;
      }
      else if (/^\d+\.\s/.test(line)) {
        if (!inList || listType !== 'ol') {
          if (inList) html += `</ol>`;
          html += `<ol class="list-decimal pl-6 my-3">`;
          inList = true;
          listType = 'ol';
        }
        html += `<li class="mb-1 dark:text-gray-300">${line.substring(line.indexOf('.')+2)}</li>`;
      }
      else if (line === '') {
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
          inList = false;
        }
        html += '<br>';
      }
      else {
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
          inList = false;
        }
        html += `<p class="my-2 dark:text-gray-300">${line}</p>`;
      }
    }
    
    if (inList) {
      html += listType === 'ul' ? '</ul>' : '</ol>';
    }
    
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">$1</a>');
    
    return html;
  };

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, error } = useSWR(
    id ? [`/api/helps/articles/${id}`] : null,
    () => apiGetSupportHubArticleDetails<GetSupportHubArticleDetailsResponse>(id || '')
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    navigate('/support');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-transparent dark:bg-gray-800 pt-20">
        <Container className='rounded-xl'>
          <div className="max-w-[800px] mx-auto px-6 pt-8 bg-white dark:bg-gray-800">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-primary hover:text-primary-dark transition-colors"
            >
              <TbArrowNarrowLeft className="mr-2" /> Volver al Centro de Ayuda
            </button>
            <div className="text-center py-16">
              <h2 className="text-2xl text-gray-800 dark:text-white mb-4">Artículo no encontrado</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Lo sentimos, el artículo que estás buscando no está disponible.
              </p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-transparent dark:bg-gray-800 pt-20">
        <Container className='rounded-xl'>
          <div className="max-w-[800px] mx-auto px-6 pt-8 bg-white dark:bg-gray-800">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
              <div className="flex mb-8">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent dark:bg-gray-800">
      <Container className="bg-white dark:bg-gray-800 rounded-xl py-20">
        <div className="max-w-[800px] mx-auto px-6 pt-8 bg-white dark:bg-gray-800">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center text-primary hover:text-primary-dark dark:hover:text-primary-mild transition-colors"
          >
            <TbArrowNarrowLeft className="mr-2" /> Volver al Centro de Ayuda
          </button>

          <div className="mb-8 bg-white dark:bg-gray-800">
            <div className="flex items-center mb-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 mr-3">
                  {categoryLabel[data.category] || data.category}
                </span>
                <IconText
                  icon={<TbClock className="text-lg" />}
                  className="mr-4"
                >
                  {data.timeToRead} min lectura
                </IconText>
                <IconText
                  icon={<TbEye className="text-lg" />}
                  className="mr-4"
                >
                  {data.viewCount}
                </IconText>
                <IconText
                  icon={<TbMessage className="text-lg" />}
                >
                  {data.commentCount}
                </IconText>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{data.title}</h1>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12 article-content bg-white dark:bg-gray-800">
            <div 
              dangerouslySetInnerHTML={{ __html: renderMarkdown(data.content) }} 
              className="pb-12 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 pb-12 bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">¿Te fue útil este artículo?</h3>
            <div className="flex space-x-4">
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                Sí, me ayudó
              </button>
              <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                No, necesito más ayuda
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ArticleDetail;