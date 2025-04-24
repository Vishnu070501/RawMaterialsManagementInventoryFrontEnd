import { useState } from 'react';

export const useInventories = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return { data, loading, error };
};