import { useState } from "react";

export function SearchModal({ isOpen, onClose, searchQuery, setSearchQuery, searchResults, handleSearch, handleCitySelect }) {
  return (
    isOpen && (
      <div className="fixed inset-0 lg:inset-y-0 lg:left-0 lg:right-auto bg-black bg-opacity-50 lg:bg-opacity-0 z-50 flex">
        <div className="bg-blue-950 w-full lg:w-[400px] min-h-[500px] lg:h-screen p-8 lg:bg-opacity-95">
          <div className="flex justify-end mb-6">
            <button 
              onClick={onClose}
              className="text-white hover:opacity-80 transition-opacity"
            >
              <img src="/close.svg" alt="Close" className="size-8" />
            </button>
          </div>
          
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Search location"
              className="bg-slate-400 px-4 py-2 rounded-lg flex-grow text-white placeholder-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus
            />
            <button 
              onClick={handleSearch}
              className="bg-slate-600 px-4 py-2 rounded-lg text-white hover:bg-slate-700"
            >
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {searchResults.map((city, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-slate-800 cursor-pointer text-white border-b border-slate-700"
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
    )
  );
}