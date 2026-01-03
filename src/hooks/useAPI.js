import { useState, useEffect } from 'react';
import { templeTimingsAPI, eventsAPI } from '../services/api';

/**
 * Hook to fetch temple timings from backend
 * @returns {object} { timings, loading, error }
 */
export const useTempleTimings = () => {
  const [timings, setTimings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimings = async () => {
      try {
        setLoading(true);
        const response = await templeTimingsAPI.getAll();
        console.log('Timings response:', response);
        setTimings(Array.isArray(response.data) ? response.data : response.data.timings || []);
        setError(null);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch temple timings';
        setError(errorMsg);
        console.error('Error fetching temple timings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimings();
  }, []);

  return { timings, loading, error };
};

/**
 * Hook to fetch upcoming events from backend
 * @returns {object} { events, loading, error, refetch }
 */
export const useUpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getUpcoming();
      console.log('Events response:', response);
      console.log('Events data:', response.data);
      setEvents(Array.isArray(response.data) ? response.data : response.data.events || []);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch events';
      setError(errorMsg);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
};

/**
 * Hook to fetch all events from backend
 * @returns {object} { events, loading, error }
 */
export const useAllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getAll();
        console.log('All Events response:', response);
        setEvents(Array.isArray(response.data) ? response.data : response.data.events || []);
        setError(null);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch events';
        setError(errorMsg);
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};

/**
 * Hook to fetch Telugu calendar timings for today (PLACEHOLDER - Backend endpoint not yet available)
 * @returns {object} { calendarData, loading, error }
 */
export const useTeluguCalendarToday = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('Telugu Calendar API not yet available');

  // TODO: Implement when backend provides /api/telugu-calendar/today endpoint

  return { calendarData, loading, error };
};

/**
 * Hook for refetching data with manual trigger
 * Useful for refresh buttons
 */
export const useRefetch = (fetchFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const response = await fetchFunction();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

/**
 * Generic hook for fetching data from any API endpoint
 * @param {function} apiFunction - API function to call (e.g., priestsAPI.getAll)
 * @returns {object} { data, loading, error }
 */
export const useAPI = (apiFunction) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiFunction();
        console.log('API response:', response);
        setData(Array.isArray(response.data) ? response.data : response.data || []);
        setError(null);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch data';
        setError(errorMsg);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (apiFunction) {
      fetchData();
    }
  }, [apiFunction]);

  return { data, loading, error };
};

const useAPIExports = {
  useTempleTimings,
  useUpcomingEvents,
  useAllEvents,
  useTeluguCalendarToday,
  useRefetch,
  useAPI,
};

export default useAPIExports;
