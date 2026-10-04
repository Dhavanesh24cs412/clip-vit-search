import React from 'react';
import { getImageUrl } from '../api';

const ResultCard = ({ result }) => {
    return (
        <div className="group flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-100 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
                {/* Image */}
                <img 
                    src={getImageUrl(result.image_url)} 
                    alt={result.image_name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-neutral-800 text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                    #{result.rank}
                </div>

                {/* Score Badge */}
                <div className="absolute bottom-3 right-3 bg-indigo-600/95 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {(result.score * 100).toFixed(1)}%
                </div>
            </div>
            
            <div className="p-3 border-t border-neutral-50 bg-neutral-50/50">
                <div className="text-xs font-medium text-neutral-500 truncate" title={result.image_name}>
                    {result.image_name}
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
