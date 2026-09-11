import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { ARTICLES } from '@/lib/articles';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { ArticleView } from './view';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.id }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = ARTICLES.find((x) => x.id === params.slug);
  if (!a) return { title: 'Learn', robots: { index: false } };
  const description = a.body.slice(0, 155).replace(/\s+\S*$/, '') + '…';
  return {
    title: a.title,
    description,
    alternates: { canonical: `/learn/${a.id}` },
    openGraph: { type: 'article', title: a.title, description, url: `/learn/${a.id}`, section: a.cat },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = ARTICLES.find((x) => x.id === params.slug);
  return (
    <>
      {a ? (
        <>
          <JsonLd data={articleJsonLd(a)} />
          <JsonLd data={breadcrumbJsonLd([['Home', '/'], ['Learn', '/learn'], [a.title, `/learn/${a.id}`]])} />
        </>
      ) : null}
      <ArticleView slug={params.slug} />
    </>
  );
}
