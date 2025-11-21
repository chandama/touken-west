import { useState, useEffect } from 'react';
import { parseSwordData } from '../utils/csvParser.js';
import { enrichWithMeitoData } from '../utils/meitoUtils.js';

/**
 * Custom hook for loading and managing sword data from CSV
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

        // Load the CSV file from the data directory
        const data = await parseSwordData('/data/index.csv');

        // Enrich sword data with Meito (famous sword) information
        const enrichedData = enrichWithMeitoData(data);

        const meitoCount = enrichedData.filter(s => s.isMeito).length;
        console.log(`Loaded ${data.length} swords from database (${meitoCount} Meito)`);
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
