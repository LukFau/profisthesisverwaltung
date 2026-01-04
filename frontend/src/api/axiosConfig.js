import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Adresse deines Spring Boot Backends
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;