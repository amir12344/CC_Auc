/**
 * Backend Integration File
 */

import axios from 'axios';
import { z } from 'zod';

// Create an Axios instance for internal API calls
const internalApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});

// --- Interceptors --- for future when we work on marketplace

// Request interceptor (e.g., to add auth token)
internalApiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: unknown) => { 
    return Promise.reject(error);
  }
);

// Response interceptor
internalApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status /*, data */ } = error.response;
      if (status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        console.log('Unauthorized access - redirecting to login...');
        // window.location.href = '/login'; // Consider using router for SPA navigation
      } else if (status === 403) {
        // Handle forbidden access
        console.log('Forbidden access');
      } else if (status >= 500) {
        // Handle server errors
        console.error('Server error occurred');
      }
    }
    return Promise.reject(error);
  }
);

// --- API Service Definitions ---

const EarlyAccessPayloadSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  companyName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().optional(), // Optional phone number
});

// Infer the TypeScript type from the Zod schema
type EarlyAccessPayload = z.infer<typeof EarlyAccessPayloadSchema>;

const earlyAccessApi = {
  register: async (payload: EarlyAccessPayload) => {
    try {
      // Validate payload against the schema before sending
      const validatedPayload = EarlyAccessPayloadSchema.parse(payload);
      // Use the correct API endpoint
      const response = await internalApiClient.post('http://localhost:5000/api/earlyAccessRegistrations/register', validatedPayload);
      return response.data;
    } catch (error: unknown) { 
      // Handle Zod validation errors specifically
      if (error instanceof z.ZodError) {
      }
      throw error;
    }
  },
};

export {
  internalApiClient,
  earlyAccessApi,
};
