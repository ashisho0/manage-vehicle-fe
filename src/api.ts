import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Driver, TimelineResponse, TimelineRequest, DriversResponse, TimelineGetResponse } from './types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const timelineAPI = {
  // Get all drivers
  getDrivers: async (): Promise<Driver[]> => {
    const response = await api.get<DriversResponse>('/api/drivers');
    return response.data.data;
  },

  // Get timeline for a specific driver and date range
  getTimeline: async (driverId: number, startDate: string, endDate: string): Promise<TimelineResponse> => {
    const response = await api.get<TimelineGetResponse>('/api/timeline', {
      params: { driverId, startDate, endDate },
    });
    return response.data.data;
  },

  // Save timeline data
  saveTimeline: async (data: TimelineRequest): Promise<any> => {
    const response = await api.post('/api/timeline', data);
    return response.data;
  },
};

// React Query hooks
export const useDrivers = () => {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: timelineAPI.getDrivers,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useTimeline = (driverId: number | null, startDate: string, endDate: string) => {

  return useQuery({
    queryKey: ['timeline', driverId, startDate, endDate],
    queryFn: () => {
      return timelineAPI.getTimeline(driverId!, startDate, endDate);
    },
    enabled: !!driverId && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSaveTimeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timelineAPI.saveTimeline,
    onSuccess: (data, variables) => {
      // Invalidate and refetch timeline data after successful save
      queryClient.invalidateQueries({ queryKey: ['timeline'] });

      // Also invalidate drivers to refresh any driver-related data
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error) => {
      console.error('Error saving timeline:', error);
    },
  });
};

export default api;
