import React, { useState, useRef } from 'react';

const ImageUploader = ({ onImageSelect }) => {
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleFile = (file) => {
        if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp")) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onImageSelect(file);
        } else {
            alert("Please select a valid image file (JPEG, PNG, WEBP).");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                2. Reference Image
            </label>
            <div 
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
                className="mt-1 group relative flex flex-col items-center justify-center w-full min-h-[220px] p-6 border-2 border-neutral-300 border-dashed rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all bg-neutral-50 overflow-hidden"
                onClick={() => fileInputRef.current.click()}
            >
                {preview ? (
                    <div className="absolute inset-0 w-full h-full p-2">
                        <img 
                            src={preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-xl shadow-sm" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl m-2">
                            <span className="text-white font-medium text-sm px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm">
                                Click to replace image
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 text-center">
                        <div className="p-4 bg-white rounded-full shadow-sm text-indigo-500 group-hover:scale-110 group-hover:text-indigo-600 transition-transform duration-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-neutral-700">
                                <span className="text-indigo-600 hover:text-indigo-500">Upload a file</span> or drag and drop
                            </p>
                            <p className="text-xs text-neutral-400">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                    </div>
                )}
                <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

export default ImageUploader;
