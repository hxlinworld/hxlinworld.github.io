'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    BookOpenIcon,
    LinkIcon,
    CodeBracketIcon,
    DocumentTextIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from './FormattedBibTeXText';
import PublicationPreviewMedia from './PublicationPreviewMedia';
import GitHubStarsBadge from './GitHubStarsBadge';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

function getDisplayVenue(pub: Publication) {
    const venue = pub.journal || pub.conference || '';
    const acronymMatch = venue.match(/\(([^)]+)\)\s*$/);
    return acronymMatch?.[1] || venue;
}

export default function PublicationsList({ config, publications, embedded = false }: PublicationsListProps) {
    const messages = useMessages();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique years and types for filters
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(publications.map(p => p.year)));
        return uniqueYears.sort((a, b) => b - a);
    }, [publications]);

    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(publications.map(p => p.type)));
        return uniqueTypes.sort();
    }, [publications]);

    // Filter publications
    const filteredPublications = useMemo(() => {
        return publications.filter(pub => {
            const matchesSearch =
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                pub.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.conference?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesType = selectedType === 'all' || pub.type === selectedType;

            return matchesSearch && matchesYear && matchesType;
        });
    }, [publications, searchQuery, selectedYear, selectedType]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-8">
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <p className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
                        {config.description}
                    </p>
                )}
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-8 space-y-4">
                {/* ... (keep existing controls) ... */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={messages.publications.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200",
                            showFilters
                                ? "bg-accent text-white border-accent"
                                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-accent hover:text-accent"
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {messages.publications.filters}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-6">
                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" /> {messages.publications.year}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedYear('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedYear === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full transition-colors",
                                                    selectedYear === year
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-1" /> {messages.publications.type}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedType === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {types.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full capitalize transition-colors",
                                                    selectedType === type
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {type.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Publications Grid */}
            <div className="space-y-4">
                {filteredPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    filteredPublications.map((pub, index) => (
                        <motion.div
                            key={pub.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                            className="publication-card-font bg-white dark:bg-neutral-900 px-4 pt-4 pb-3 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                {pub.preview && (
                                    <div className={`${embedded ? 'w-full md:w-52' : 'w-full md:w-56 lg:w-64'} flex-shrink-0 md:self-end md:mb-3`}>
                                        <div className="aspect-video relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                            <PublicationPreviewMedia preview={pub.preview} title={pub.title} />
                                        </div>
                                    </div>
                                )}
                                <div className="flex-grow min-w-0">
                                    <h3 className={`${embedded ? "text-[17px]" : "text-[18px]"} font-bold text-neutral-950 dark:text-[#9fb7df] mb-1 leading-[1.3]`}>
                                        <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                                    </h3>
                                    <p className={`${embedded ? "text-base" : "text-[16px]"} text-neutral-950 dark:text-neutral-500 mb-1 leading-[1.3]`}>
                                        {pub.authors.map((author, idx) => (
                                            <span key={idx}>
                                                <span className={`${author.isHighlighted ? 'font-semibold text-neutral-950 dark:text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'dark:decoration-accent' : 'decoration-neutral-500'}` : ''}`}>
                                                    {author.name}
                                                </span>
                                                {author.isCorresponding && (
                                                    <sup className={`ml-0 ${author.isHighlighted ? 'text-neutral-950 dark:text-accent' : 'text-neutral-950 dark:text-neutral-500'}`}>*</sup>
                                                )}
                                                {idx < pub.authors.length - 1 && ', '}
                                            </span>
                                        ))}
                                    </p>
                                    <p className={`${embedded ? "text-base" : "text-[16px]"} font-normal text-neutral-950 dark:text-neutral-500 mb-2 leading-[1.3]`}>
                                        <em>{getDisplayVenue(pub)}</em> {pub.year}
                                    </p>

                                    {pub.description && (
                                        <p className={`${embedded ? "text-base" : "text-[16px]"} text-neutral-950 dark:text-neutral-500 mb-2.5 line-clamp-2 leading-[1.3]`}>
                                            {pub.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {pub.url && (
                                            <a
                                                href={pub.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex h-8 items-center px-3.5 rounded-md text-[14px] leading-none font-normal bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-500 hover:bg-accent hover:text-white transition-colors"
                                            >
                                                <LinkIcon className="h-4 w-4 mr-1.5" />
                                                Project Page
                                            </a>
                                        )}
                                        {pub.arxivId && (
                                            <a
                                                href={`https://arxiv.org/abs/${pub.arxivId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex h-8 items-center px-3.5 rounded-md text-[14px] leading-none font-normal bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-500 hover:bg-accent hover:text-white transition-colors"
                                            >
                                                <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                                                arXiv
                                            </a>
                                        )}
                                        {pub.video && (
                                            <a
                                                href={pub.video}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex h-8 items-center px-3.5 rounded-md text-[14px] leading-none font-normal bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-500 hover:bg-accent hover:text-white transition-colors"
                                            >
                                                <VideoCameraIcon className="h-4 w-4 mr-1.5" />
                                                Video
                                            </a>
                                        )}
                                        {pub.code && (
                                            <div className="inline-flex items-center gap-1.5">
                                                <a
                                                    href={pub.code}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex h-8 items-center px-3.5 rounded-md text-[14px] leading-none font-normal bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-500 hover:bg-accent hover:text-white transition-colors"
                                                >
                                                    <CodeBracketIcon className="h-4 w-4 mr-1.5 text-neutral-950 dark:text-neutral-300 group-hover:text-white transition-colors" />
                                                    {messages.publications.code}
                                                </a>
                                                <GitHubStarsBadge codeUrl={pub.code} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
