import { useState, useEffect, useCallback } from 'react';
import { enrichWithMeitoData } from '../utils/meitoUtils.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Custom hook for loading and managing sword data from MongoDB API
 * Uses progressive loading: fast initial load, then background fetch for full data
 * @returns {Object} Object containing swords array, loading state, and error state
 */
const useSwordData = () => {
  const [swords, setSwords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Check for pre-rendered data in the HTML (for SEO)
  const getPrerenderedData = useCallback(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_SWORD_DATA__) {
      return window.__INITIAL_SWORD_DATA__;
    }
    return null;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);

        // Step 1: Check for pre-rendered data first (instant)
        const prerendered = getPrerenderedData();
        if (prerendered && prerendered.swords && prerendered.swords.length > 0) {
          console.log(`Using ${prerendered.swords.length} pre-rendered swords`);
          const enrichedInitial = enrichWithMeitoData(prerendered.swords);
          setSwords(enrichedInitial);
          setTotalCount(prerendered.total || prerendered.swords.length);
          setLoading(false);
        } else {
          // Step 2: Fast initial load (first 100 swords)
          setLoading(true);
          const initialResponse = await fetch(`${API_BASE}/swords/initial`);

          if (!initialResponse.ok) {
            throw new Error(`Failed to fetch initial swords: ${initialResponse.statusText}`);
          }

          const initialResult = await initialResponse.json();
          const initialData = initialResult.swords || [];

          // Show initial data immediately
          const enrichedInitial = enrichWithMeitoData(initialData);
          setSwords(enrichedInitial);
          setTotalCount(initialResult.total || initialData.length);
          setLoading(false);

          console.log(`Fast loaded ${initialData.length} swords (${initialResult.total} total)`);
        }

        // Step 3: Background fetch for full data (non-blocking)
        // Use requestIdleCallback or setTimeout to defer this
        const loadFullData = async () => {
          try {
            const fullResponse = await fetch(`${API_BASE}/swords?limit=50000`);

            if (!fullResponse.ok) {
              console.warn('Background fetch failed, keeping initial data');
              return;
            }

            const fullResult = await fullResponse.json();
            const fullData = fullResult.swords || [];

            // Enrich and update with full data
            const enrichedFull = enrichWithMeitoData(fullData);
            const meitoCount = enrichedFull.filter(s => s.isMeito).length;

            setSwords(enrichedFull);
            setTotalCount(fullData.length);
            setIsFullyLoaded(true);

            console.log(`Background loaded ${fullData.length} swords (${meitoCount} Meito)`);
          } catch (err) {
            console.warn('Background fetch error:', err);
            // Keep initial data on background fetch failure
          }
        };

        // Defer full load to not block initial render
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => loadFullData(), { timeout: 2000 });
        } else {
          setTimeout(loadFullData, 100);
        }

      } catch (err) {
        console.error('Error loading sword data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [getPrerenderedData]);

  return { swords, totalCount, loading, isFullyLoaded, error };
};

export default useSwordData;
