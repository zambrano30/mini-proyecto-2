import { useState } from "react";

export function SearchModal({ isOpen, onClose, searchQuery, setSearchQuery, searchResults, handleSearch, handleCitySelect }) {
  return (
    isOpen && (
      <div className="fixed inset-0 lg:inset-y-0 lg:left-0 lg:right-auto bg-black bg-opacity-50 lg:bg-opacity-0 z-50 flex">
        <div className="bg-blue-950 w-full lg:w-[400px] min-h-[500px] lg:h-screen p-6 lg:p-8 lg:bg-opacity-95">
          <div className="flex justify-end mb-8">
            <button 
              onClick={onClose}
              className="text-white hover:opacity-80 transition-opacity"
            >
              <img src="/close.svg" alt="Close" className="size-8" />
            </button>
          </div>
          
          <div className="max-w-[85%] mx-auto flex flex-col gap-8">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search location"
                className="bg-slate-400 px-6 py-3 rounded-lg flex-grow text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                autoFocus
              />
              <button 
                onClick={handleSearch}
                className="bg-slate-600 px-6 py-3 rounded-lg text-white hover:bg-slate-700 transition-colors"
              >
                Search
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-[calc(100vh-300px)] lg:max-h-[600px] overflow-y-auto">
                {searchResults.map((city, index) => (
                  <div
                    key={index}
                    className="p-6 hover:bg-slate-800 cursor-pointer text-white border-b border-slate-700 transition-colors"
                    onClick={() => handleCitySelect(city)}
                  >
                    {city.name}, {city.country}
                    {city.state && `, ${city.state}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
}
