import axios from "axios";

export const geoApiInstance = axios.create({
  baseURL: 'https://api.openweathermap.org/geo/1.0',
  timeout: 5000,
  params: {
    appid: import.meta.env.VITE_WEATHER_API_KEY
  }
});
