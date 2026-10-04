import React, { useState } from 'react';
import EventSelector from './components/EventSelector';
import ImageUploader from './components/ImageUploader';
import TextInputPrompt from './components/TextInputPrompt';
import SearchResults from './components/SearchResults';
import { searchSimilarImages, searchText } from './api';

function App() {
    const [selectedEvent, setSelectedEvent] = useState('');
    const [searchMode, setSearchMode] = useState('image'); // 'image' or 'text'
    const [referenceImage, setReferenceImage] = useState(null);
    const [prompt, setPrompt] = useState('');
    
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState(null);
    const [timing, setTiming] = useState(null);
    const [error, setError] = useState(null);

    const canSearch = searchMode === 'image' 
        ? (selectedEvent !== '' && referenceImage !== null && !isSearching)
        : (selectedEvent !== '' && prompt.trim() !== '' && !isSearching);

    const handleSearch = async () => {
        if (!canSearch) return;

        setIsSearching(true);
        setError(null);
        setResults(null);
        setTiming(null);

        try {
            let data;
            if (searchMode === 'image') {
                data = await searchSimilarImages(selectedEvent, referenceImage);
            } else {
                data = await searchText(selectedEvent, prompt);
            }
            setResults(data.results);
            setTiming(data.timing);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                        <span className="bg-indigo-600 text-white p-1.5 rounded-md">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </span>
                        CLIP Search
                    </h1>
                    <div className="text-sm text-neutral-500 font-medium">Multi-Modal Prototype</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Controls Sidebar */}
                    <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/60 sticky top-24">
                        <h2 className="text-lg font-semibold mb-6">Search Parameters</h2>
                        
                        <div className="space-y-6">
                            <EventSelector 
                                selectedEvent={selectedEvent} 
                                onEventSelect={setSelectedEvent} 
                            />

                            {/* Tabs */}
                            <div className="flex p-1 space-x-1 bg-neutral-100 rounded-xl">
                                <button
                                    onClick={() => setSearchMode('image')}
                                    className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all ${
                                        searchMode === 'image' 
                                            ? 'bg-white text-neutral-900 shadow-sm' 
                                            : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'
                                    }`}
                                >
                                    Visual Search
                                </button>
                                <button
                                    onClick={() => setSearchMode('text')}
                                    className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all ${
                                        searchMode === 'text' 
                                            ? 'bg-white text-neutral-900 shadow-sm' 
                                            : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'
                                    }`}
                                >
                                    Text Search
                                </button>
                            </div>
                            
                            {searchMode === 'image' ? (
                                <ImageUploader onImageSelect={setReferenceImage} />
                            ) : (
                                <TextInputPrompt prompt={prompt} onPromptChange={setPrompt} />
                            )}
                            
                            {error && (
                                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                onClick={handleSearch}
                                disabled={!canSearch}
                                className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex justify-center items-center gap-2
                                    ${canSearch 
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 hover:shadow-indigo-300' 
                                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSearching ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Search Database
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="lg:col-span-8">
                        {results === null && !isSearching ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-neutral-400 bg-white/50 border border-neutral-200/50 rounded-2xl border-dashed">
                                <svg className="w-16 h-16 mb-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="text-lg font-medium">Ready to search</p>
                                <p className="text-sm">Select an event type and upload an image or type a prompt to begin.</p>
                            </div>
                        ) : (
                            <SearchResults results={results} timing={timing} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
