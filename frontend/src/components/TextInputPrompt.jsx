import React from 'react';

const TextInputPrompt = ({ prompt, onPromptChange }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                2. Search Prompt
            </label>
            <div className="relative">
                <textarea
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    placeholder="Describe the venue (e.g., 'pink themed glowing lights venue')"
                    className="w-full h-[220px] bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm placeholder:text-neutral-400"
                />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
                Powered by CLIP Multi-Modal Search
            </p>
        </div>
    );
};

export default TextInputPrompt;
