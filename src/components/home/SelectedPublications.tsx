'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    CodeBracketIcon,
    DocumentTextIcon,
    LinkIcon,
    VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from '@/components/publications/FormattedBibTeXText';
import PublicationPreviewMedia from '@/components/publications/PublicationPreviewMedia';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
    enableOnePageMode?: boolean;
}

function getDisplayVenue(pub: Publication) {
    const venue = pub.journal || pub.conference || '';
    const acronymMatch = venue.match(/\(([^)]+)\)\s*$/);
    return acronymMatch?.[1] || venue;
}

export default function SelectedPublications({ publications, title, enableOnePageMode = false }: SelectedPublicationsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.selectedPublications;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{resolvedTitle}</h2>
                <Link
                    href={enableOnePageMode ? "/#publications" : "/publications"}
                    prefetch={true}
                    className="text-accent hover:text-accent-dark text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                >
                    {messages.home.viewAll} →
                </Link>
            </div>
            <div className="space-y-4">
                {publications.map((pub, index) => (
                    <motion.div
                        key={pub.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="publication-card-font bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            {pub.preview && (
                                <div className="w-full md:w-52 flex-shrink-0 md:self-center">
                                    <div className="aspect-video relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                        <PublicationPreviewMedia preview={pub.preview} title={pub.title} />
                                    </div>
                                </div>
                            )}
                            <div className="flex-grow">
                                <h3 className="text-[18px] font-bold text-neutral-950 dark:text-neutral-100 mb-1 leading-[1.3]">
                                    <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                                </h3>
                                <p className="text-[16px] text-neutral-950 dark:text-neutral-200 mb-1 leading-[1.3]">
                                    {pub.authors.map((author, idx) => (
                                        <span key={idx}>
                                            <span className={`${author.isHighlighted ? 'font-semibold text-neutral-950 dark:text-neutral-100' : ''} ${author.isCoAuthor ? `underline underline-offset-4 decoration-neutral-500` : ''}`}>
                                                {author.name}
                                            </span>
                                            {author.isCorresponding && (
                                                <sup className="ml-0 text-neutral-950 dark:text-neutral-200">*</sup>
                                            )}
                                            {idx < pub.authors.length - 1 && ', '}
                                        </span>
                                    ))}
                                </p>
                                <p className="text-[16px] font-normal text-neutral-950 dark:text-neutral-200 mb-2 leading-[1.3]">
                                    <em>{getDisplayVenue(pub)}</em> {pub.year}
                                </p>
                                {pub.description && (
                                    <p className="text-[16px] text-neutral-950 dark:text-neutral-200 mb-2.5 line-clamp-2 leading-[1.3]">
                                        {pub.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-1.5">
                                    {pub.url && (
                                        <a
                                            href={pub.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-5 items-center px-2 rounded-md text-[12px] leading-none font-normal bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-200 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <LinkIcon className="h-3 w-3 mr-1" />
                                            Project Page
                                        </a>
                                    )}
                                    {pub.arxivId && (
                                        <a
                                            href={`https://arxiv.org/abs/${pub.arxivId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-5 items-center px-2 rounded-md text-[12px] leading-none font-normal bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-200 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <DocumentTextIcon className="h-3 w-3 mr-1" />
                                            arXiv
                                        </a>
                                    )}
                                    {pub.code && (
                                        <a
                                            href={pub.code}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-5 items-center px-2 rounded-md text-[12px] leading-none font-normal bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-200 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <CodeBracketIcon className="h-3 w-3 mr-1" />
                                            {messages.publications.code}
                                        </a>
                                    )}
                                    {pub.video && (
                                        <a
                                            href={pub.video}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-5 items-center px-2 rounded-md text-[12px] leading-none font-normal bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-200 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <VideoCameraIcon className="h-3 w-3 mr-1" />
                                            Video
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
