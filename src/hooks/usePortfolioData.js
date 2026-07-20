import { useState, useEffect } from 'react';

export function usePortfolioData() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/data/data.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to load portfolio data", err));
  }, []);
  
  return data;
}
