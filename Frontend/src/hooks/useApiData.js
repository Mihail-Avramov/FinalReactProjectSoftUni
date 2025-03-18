import { useState, useEffect, useRef } from 'react';
import { isRequestCanceled } from '../utils/requestUtils';

function useApiData(fetchFunction, dependencies = [], errorMessage) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Използваме useRef, за да запазим последната функция без да предизвикваме повторно изпълнение на ефекта
  const fetchFunctionRef = useRef(fetchFunction);
  
  // Актуализираме ref при промяна на fetchFunction
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);
  
  // Главният useEffect за извличане на данни
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;
    
    async function fetchData() {
      try {
        setLoading(true);
        // Използваме ref.current вместо директната функция
        const result = await fetchFunctionRef.current(abortController.signal);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (error) {
        if (!isRequestCanceled(error) && isMounted) {
          setError(errorMessage || 'Не успяхме да заредим данните. Моля, опитайте по-късно.');
          console.error('Error fetching data:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
  
  return { data, loading, error };
}

export default useApiData;