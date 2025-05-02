'use client';

import React, { useEffect, useState } from 'react';

// Generic data loading HOC
export function withData<P extends object, T>(
  Component: React.ComponentType<P & { data: T }>,
  fetchData: () => Promise<T>,
  options = { revalidate: 60 } // Default revalidation time in seconds
) {
  const WithData = (props: P) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          const result = await fetchData();
          setData(result);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
          setLoading(false);
        }
      };

      loadData();

      // Set up revalidation timer if needed
      if (options.revalidate > 0) {
        const intervalId = setInterval(loadData, options.revalidate * 1000);
        return () => clearInterval(intervalId);
      }
    }, []);

    if (loading) {
      return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (error) {
      return (
        <div className="flex justify-center items-center min-h-screen text-red-500">
          Error: {error.message}
        </div>
      );
    }

    if (!data) {
      return <div className="flex justify-center items-center min-h-screen">No data available</div>;
    }

    return <Component {...props} data={data} />;
  };

  return WithData;
}

