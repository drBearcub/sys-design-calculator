import { useState, useEffect } from 'react';

// Custom hook for synchronizing state with URL query parameters
export function useQueryParamState(key, defaultValue = '') {
  const [value, setValue] = useState(() => {
    // Initialize state from URL query parameter or use default
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || defaultValue;
  });

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (value !== defaultValue) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Construct the new URL
    const newUrl = `${window.location.pathname}?${params}`;
    window.history.pushState({}, '', newUrl);
  }, [key, value, defaultValue]);

  // Update state when URL changes (e.g., back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setValue(params.get(key) || defaultValue);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [key, defaultValue]);

  return [value, setValue];
}
