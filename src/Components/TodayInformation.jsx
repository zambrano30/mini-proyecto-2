import { useEffect, useState } from "react";
import { axiosInstance } from '../tools/axios';
import { geoApiInstance } from '../tools/axios/geoApi';
import { SearchModal } from "./SearchModal";

export const TodayInformation = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState({ lat: -1.0278, lon: -79.4647 }); // Default to Quevedo coordinates
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Weather icon mapping based on OpenWeather codes
  const weatherIcons = {
    '01d': '01d.png', // clear sky day
    '01n': '01n.png', // clear sky night
    '02d': '02d.png', // few clouds day
    '02n': '02n.png', // few clouds night
    '03d': '03d.png', // scattered clouds day
    '03n': '03n.png', // scattered clouds night
    '04d': '04d.png', // broken clouds day
    '04n': '04n.png', // broken clouds night
    '09d': '09d.png', // shower rain day
    '09n': '09n.png', // shower rain night
    '10d': '10d.png', // rain day
    '10n': '10n.png', // rain night
    '11d': '11d.png', // thunderstorm day
    '11n': '11n.png', // thunderstorm night
    '13d': '13d.png', // snow day
    '13n': '13n.png', // snow night
    '50d': '50d.png', // mist day
    '50n': '50n.png', // mist night
  };
  

  const getCurrentWeather = async (lat, lon) => {
    try {
      const response = await axiosInstance.get('/weather', {
        params: {
          lat,
          lon,
          units: 'metric'
        }
      });
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          getCurrentWeather(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await geoApiInstance.get('/direct', {
        params: {
          q: searchQuery,
          limit: 5
        }
      });
      setSearchResults(response.data);
      console.log('Search results:', response.data); // Para debugging
    } catch (error) {
      console.error('Error searching city:', error);
    }
  };

  const handleCitySelect = (city) => {
    setLocation({ lat: city.lat, lon: city.lon });
    setSearchResults([]);
    setSearchQuery("");
    setIsModalOpen(false);
  };

  

  useEffect(() => {
    getCurrentWeather(location.lat, location.lon);
  }, [location]);
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col lg:grid lg:grid-cols-[400px_1fr] lg:gap-6 overflow-y-auto lg:overflow-hidden">
      <aside className="bg-blue-950 min-h-[500px] lg:h-screen lg:bg-opacity-50 flex flex-col">
        <section className="flex justify-around p-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-400 px-8 py-2 rounded-2xl text-white hover:bg-slate-500 transition-colors"
          >
            Search for Places
          </button>
          <button onClick={handleLocationClick} className="hover:opacity-80 transition-opacity">
            <img src="../location.svg" alt="Get current location" className="size-10" />
          </button>
        </section>

        {/* Modal de búsqueda */}
        <SearchModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          handleSearch={handleSearch}
          handleCitySelect={handleCitySelect}
        />
        <div className="relative flex-grow">
          <img
            src=".//Cloud-background.png"
            alt="Nubes de fondo"
            className="opacity-10 w-full h-full absolute top-0 left-0 object-cover"
          />
          {weather && (
            <div className="relative z-10">
              <div className="flex justify-center">
                <img
                  src={weatherIcons[weather.weather[0].icon]}
                  alt={weather.weather[0].description}
                  className="w-52 h-52 my-10"
                />
              </div>
              <h2 className="text-center text-9xl font-bold text-white">
                {Math.round(weather.main.temp)}<span className="text-6xl relative bottom-8 right-3">°C</span>
              </h2>
              <p className="text-center text-gray-200 mt-2 text-4xl capitalize">
                {weather.weather[0].description}
              </p>
              <div className="flex justify-center gap-8 mt-4 text-gray-200">
                <p>Today</p>
                <p>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="flex justify-center text-gray-100 mt-4 mb-2 gap-2">
                <img src=".//location_on.svg" alt="" className="size-5" />
                <p>{weather.name}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
      
      <main className="bg-gray-950 bg-opacity-50 min-h-[500px] lg:h-screen overflow-y-auto flex flex-col lg:px-24">
        {/* Sección superior con el pronóstico */}
        <section className="p-4 md:p-6 lg:p-8">
          <section className="flex justify-end font-bold text-white gap-4">
            <section className="border rounded-full text-2xl flex items-center justify-center size-12 hover:bg-slate-800 cursor-pointer transition-colors">
              °C
            </section>
            <section className="border rounded-full text-2xl flex items-center justify-center size-12 hover:bg-slate-800 cursor-pointer transition-colors">
              °F
            </section>
          </section>
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 place-content-center place-items-center gap-3 md:gap-4 lg:gap-6 text-white text-center mt-8">
            <section className="bg-slate-800 w-30 h-40">
              <p>Today</p>
              <img 
                className="size-20 mx-auto" 
                src="09d.png" 
                alt="Weather icon" 
              />
              <div className="flex justify-around mt-4">
                <p>32°C</p>
                <p>21°C</p>
              </div>
            </section>
          </section>
        </section>

        {/* Sección inferior con los highlights */}
        <section className="text-white p-4 md:p-6 lg:p-8 flex-grow">
          <h2 className="text-2xl font-bold mb-4 md:mb-6">Today's Highlights</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <section className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors">
              <p className="text-lg text-gray-300 mb-2">Wind Status</p>
              <p className="text-4xl font-bold mb-4">5.66 <span className="text-2xl text-gray-300">mph</span></p>
              <div className="flex justify-center items-center gap-3">
                <div className="bg-slate-700 p-2 rounded-full">
                  <img src="./navigation.svg" alt="" className="size-6" />
                </div>
                <p className="text-lg">SSW</p>
              </div>
            </section>
            <section className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors">
              <p className="text-lg text-gray-300 mb-2">Humidity</p>
              <p className="text-4xl font-bold mb-4">84<span className="text-2xl text-gray-300">%</span></p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500" style={{ width: '84%' }}></div>
              </div>
            </section>
            <section className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors">
              <p className="text-lg text-gray-300 mb-2">Visibility</p>
              <p className="text-4xl font-bold">6.4 <span className="text-2xl text-gray-300">miles</span></p>
            </section>
            <section className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors">
              <p className="text-lg text-gray-300 mb-2">Air Pressure</p>
              <p className="text-4xl font-bold">998 <span className="text-2xl text-gray-300">mb</span></p>
            </section>
          </div>
        </section>
      </main>

      <footer className="bg-blue-950 bg-opacity-50 text-white text-center p-1 lg:col-span-2">
        <p>Developed by <span className="font-semibold">Christopher Zambrano</span></p>
      </footer>
    </div>
  );
};
