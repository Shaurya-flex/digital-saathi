import { ARTICLES } from '@/lib/articles';
import { ArticleView } from './view';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.id }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  return <ArticleView slug={params.slug} />;
}
