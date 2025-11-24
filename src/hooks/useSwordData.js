import { useState, useEffect } from 'react';
import { enrichWithMeitoData } from '../utils/meitoUtils.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Custom hook for loading and managing sword data from MongoDB API
 * @returns {Object} Object containing swords array, loading state, and error state
 */
const useSwordData = () => {
  const [swords, setSwords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all swords from MongoDB API
        // Using a high limit to get all swords at once
        const response = await fetch(`${API_BASE}/swords?limit=20000`);

        if (!response.ok) {
          throw new Error(`Failed to fetch swords: ${response.statusText}`);
        }

        const result = await response.json();
        const data = result.swords || [];

        // Enrich sword data with Meito (famous sword) information
        const enrichedData = enrichWithMeitoData(data);

        const meitoCount = enrichedData.filter(s => s.isMeito).length;
        console.log(`Loaded ${data.length} swords from MongoDB (${meitoCount} Meito)`);
        setSwords(enrichedData);
      } catch (err) {
        console.error('Error loading sword data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { swords, loading, error };
};

export default useSwordData;
