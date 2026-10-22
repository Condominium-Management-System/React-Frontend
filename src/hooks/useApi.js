import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result.data.data || result.data);
      return result.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'An error occurred';
      setError(message);
      if (options.showToast !== false) {
        toast.error(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, options.showToast]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      execute();
    }
  }, [execute, options.autoFetch]);

  return { data, loading, error, execute, refetch: execute };
};