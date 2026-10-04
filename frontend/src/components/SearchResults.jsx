import React from 'react';
import ResultCard from './ResultCard';

const SearchResults = ({ results, timing }) => {
    if (!results) return null;

    if (results.length === 0) {
        return (
            <div className="mt-8 p-10 bg-white rounded-2xl text-center text-neutral-500 border border-neutral-200/60 shadow-sm flex flex-col items-center">
                <svg className="w-12 h-12 mb-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">No visually similar images found.</p>
                <p className="text-sm mt-1">Try another image or event type.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200/60 h-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 pb-4 border-b border-neutral-100 gap-4">
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Top Matches
                </h2>
                {timing && (
                    <div className="flex items-center gap-3 text-xs font-medium text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-100">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Vector Embed: <span className="text-neutral-600">{timing.embedding_seconds}s</span>
                        </span>
                        <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            Search: <span className="text-neutral-600">{timing.search_seconds}s</span>
                        </span>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {results.map((result) => (
                    <ResultCard key={result.rank} result={result} />
                ))}
            </div>
        </div>
    );
};

export default SearchResults;
