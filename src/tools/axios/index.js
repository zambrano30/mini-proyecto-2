import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 5000,
  params: {
    appid: import.meta.env.VITE_WEATHER_API_KEY
  }
});

axiosInstance.interceptors.response.use(function onFulfilled(response) {
    return response;
  }, function onRejected(error) {
    if(error.status===401){
        console.log("Error en las credenciales")
    }
    return Promise.reject(error);
  });