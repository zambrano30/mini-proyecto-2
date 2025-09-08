import { useEffect, useState } from "react";
import { axiosInstance } from '../tools/axios';
import { geoApiInstance } from '../tools/axios/geoApi';
import { SearchModal } from "./SearchModal";

export const TodayInformation = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState({ lat: -1.0278, lon: -79.4647 }); 
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCelsius, setIsCelsius] = useState(true);

  // Temperature conversion functions
  const convertToFahrenheit = (celsius) => (celsius * 9/5) + 32;
  const formatTemperature = (celsius) => {
    const temp = isCelsius ? celsius : convertToFahrenheit(celsius);
    return Math.round(temp);
  };

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

  const getForecast = async (lat, lon) => {
    try {
      const response = await axiosInstance.get('/forecast', {
        params: {
          lat,
          lon,
          units: 'metric'
        }
      });

     
      const days = [];
      const today = new Date();
      for (let i = 1; i <= 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        date.setHours(12, 0, 0, 0); // Set to noon
        days.push(date);
      }

      //
      const processedForecasts = days.map(targetDate => {
        // Convert all forecasts to Date objects once
        const forecastsWithDates = response.data.list.map(item => ({
          ...item,
          dateObj: new Date(item.dt * 1000)
        }));

        // Find the forecast closest to noon for this day
        return forecastsWithDates.reduce((closest, current) => {
          if (!closest) return current;

          const currentDate = current.dateObj;
          const closestDate = closest.dateObj;

          // Check if they're the same day as target
          const isCurrentSameDay = currentDate.getDate() === targetDate.getDate();
          const isClosestSameDay = closestDate.getDate() === targetDate.getDate();

          if (!isClosestSameDay && isCurrentSameDay) return current;
          if (!isCurrentSameDay && isClosestSameDay) return closest;
          if (!isCurrentSameDay && !isClosestSameDay) {
            // Neither is on the target day, pick the closest one
            return Math.abs(currentDate - targetDate) < Math.abs(closestDate - targetDate) 
              ? current : closest;
          }

          // Both are on the target day, pick the one closest to noon
          const currentDiff = Math.abs(currentDate.getHours() - 12);
          const closestDiff = Math.abs(closestDate.getHours() - 12);
          return currentDiff < closestDiff ? current : closest;
        }, null);
      });

      console.log('Processed forecasts:', processedForecasts);
      setForecast(processedForecasts);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          getCurrentWeather(latitude, longitude);
          getForecast(latitude, longitude);
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
      console.log('Search results:', response.data);
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
    const fetchData = async () => {
      console.log('Fetching data for location:', location);
      await getCurrentWeather(location.lat, location.lon);
      await getForecast(location.lat, location.lon);
    };
    fetchData();
  }, [location]);

  return (
    <div className="min-h-screen lg:h-screen bg-gray-950 flex flex-col lg:grid lg:grid-cols-[400px_1fr] lg:overflow-hidden">
      <aside className="bg-blue-950 lg:bg-opacity-50 flex flex-col p-4 lg:p-6 min-w-0 lg:overflow-y-auto">
        <section className="flex justify-between gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-400 px-4 sm:px-6 py-2 rounded-2xl text-white hover:bg-slate-500 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            Search for Places
          </button>
          <button onClick={handleLocationClick} className="hover:opacity-80 transition-opacity shrink-0">
            <img src="../location.svg" alt="Get current location" className="size-8 sm:size-10" />
          </button>
        </section>

        <SearchModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          handleSearch={handleSearch}
          handleCitySelect={handleCitySelect}
        />
        
        <div className="relative flex-grow overflow-hidden">
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
                  className="w-40 sm:w-52 h-40 sm:h-52 my-6 sm:my-10"
                />
              </div>
              <h2 className="text-center text-7xl sm:text-9xl font-bold text-white">
                {formatTemperature(weather.main.temp)}<span className="text-4xl sm:text-6xl relative bottom-6 sm:bottom-8 right-2 sm:right-3">°{isCelsius ? 'C' : 'F'}</span>
              </h2>
              <p className="text-center text-gray-200 mt-2 text-3xl sm:text-4xl capitalize">
                {weather.weather[0].description}
              </p>
              <div className="flex justify-center gap-4 sm:gap-8 mt-4 text-gray-200 text-sm sm:text-base">
                <p>Today</p>
                <p>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="flex justify-center text-gray-100 mt-4 mb-2 gap-2">
                <img src=".//location_on.svg" alt="" className="size-4 sm:size-5" />
                <p className="text-sm sm:text-base">{weather.name}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
      
      <main className="bg-gray-950 bg-opacity-50 flex-1 lg:overflow-y-auto">
        <div className="p-4 lg:p-10 lg:h-full lg:overflow-y-auto">
          {/* Sección superior con el pronóstico */}
          <section className="mb-6 sm:mb-8 lg:mb-6">
            <section className="flex justify-end font-bold text-white gap-2 sm:gap-4 mb-6 lg:mb-4">
              <button
                onClick={() => setIsCelsius(true)}
                className={`border rounded-full text-xl sm:text-2xl flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                  isCelsius ? 'bg-slate-800 border-transparent' : 'hover:bg-slate-800/50'
                }`}
                aria-label="Switch to Celsius"
              >
                °C
              </button>
              <button
                onClick={() => setIsCelsius(false)}
                className={`border rounded-full text-xl sm:text-2xl flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                  !isCelsius ? 'bg-slate-800 border-transparent' : 'hover:bg-slate-800/50'
                }`}
                aria-label="Switch to Fahrenheit"
              >
                °F
              </button>
            </section>
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 text-white text-center">
              {/* Forecast cards */}
              {forecast && forecast.length > 0 ? (
                forecast.map((day, index) => {
                  const date = new Date(day.dt * 1000);
                  const isFirstCard = index === 0;
                  return (
                    <section key={day.dt} className="bg-slate-800 w-full max-w-[180px] min-h-[11rem] p-4 sm:p-5 rounded-lg hover:bg-slate-700 transition-all duration-300 transform hover:scale-105">
                      <p className="text-sm sm:text-base font-medium mb-3 text-gray-300">
                        {isFirstCard ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                      <div className="flex flex-col items-center">
                        <img 
                          className="size-20 sm:size-24 my-2 drop-shadow-lg transform hover:scale-110 transition-transform duration-300" 
                          src={weatherIcons[day.weather[0].icon]} 
                          alt={day.weather[0].description} 
                        />
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 capitalize">
                          {day.weather[0].description}
                        </p>
                      </div>
                      <div className="flex justify-around items-center mt-3 pt-2 border-t border-gray-700">
                        <p className="text-sm sm:text-base font-medium">{formatTemperature(day.main.temp_max)}°{isCelsius ? 'C' : 'F'}</p>
                        <span className="text-gray-600 mx-2">|</span>
                        <p className="text-sm sm:text-base text-gray-400">{formatTemperature(day.main.temp_min)}°{isCelsius ? 'C' : 'F'}</p>
                      </div>
                    </section>
                  );
                })
              ) : (
                <div className="col-span-full flex justify-center">
                  <p className="text-white">Loading forecast data...</p>
                </div>
              )}
            </section>
          </section>

          {/* Sección inferior con los highlights */}
          <section className="text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 lg:mb-6">Today's Highlights</h2>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 lg:mb-6">
              <section className="bg-slate-800 p-6 sm:p-8 rounded-lg hover:bg-slate-700 transition-colors">
                <p className="text-sm sm:text-base text-gray-300 mb-2">Wind Status</p>
                {weather && (
                  <>
                    <p className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
                      {Math.round(weather.wind.speed)} <span className="text-xl sm:text-2xl text-gray-300">mph</span>
                    </p>
                    <div className="flex justify-center items-center gap-3">
                      <div className="bg-slate-700 p-2 rounded-full">
                        <img 
                          src="./navigation.svg" 
                          alt="Wind direction" 
                          className="size-5 sm:size-6 transition-transform duration-500" 
                          style={{ transform: `rotate(${weather.wind.deg}deg)` }}
                        />
                      </div>
                      <p className="text-base sm:text-lg">
                        {(() => {
                          const deg = weather.wind.deg;
                          const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
                          const index = Math.round(deg / 22.5) % 16;
                          return directions[index];
                        })()}
                      </p>
                    </div>
                  </>
                )}
              </section>
              <section className="bg-slate-800 p-6 sm:p-8 rounded-lg hover:bg-slate-700 transition-colors">
                <p className="text-sm sm:text-base text-gray-300 mb-2">Humidity</p>
                <p className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">84<span className="text-xl sm:text-2xl text-gray-300">%</span></p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500" style={{ width: '84%' }}></div>
                </div>
              </section>
              <section className="bg-slate-800 p-6 sm:p-8 rounded-lg hover:bg-slate-700 transition-colors">
                <p className="text-sm sm:text-base text-gray-300 mb-2">Visibility</p>
                <p className="text-3xl sm:text-4xl font-bold">6.4 <span className="text-xl sm:text-2xl text-gray-300">miles</span></p>
              </section>
              <section className="bg-slate-800 p-6 sm:p-8 rounded-lg hover:bg-slate-700 transition-colors">
                <p className="text-sm sm:text-base text-gray-300 mb-2">Air Pressure</p>
                <p className="text-3xl sm:text-4xl font-bold">998 <span className="text-xl sm:text-2xl text-gray-300">mb</span></p>
              </section>
            </div>
            <footer className="text-white text-center pb-4">
              <p className="text-sm sm:text-base">Developed by <span className="font-semibold">Christopher Zambrano</span></p>
            </footer>
          </section>
        </div>
      </main>
    </div>
  );
};
