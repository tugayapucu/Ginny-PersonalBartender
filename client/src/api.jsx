import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Adjust if your backend is hosted elsewhere
});

export const fetchCocktails = () => API.get('/cocktails');
