import { useState, useEffect, useRef, useMemo } from 'react';
import { isRequestCanceled } from '../utils/requestUtils';

function useApiData(fetchFunction, dependencies = [], errorMessage) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
   // Използваме useRef, за да запазим последната функция за извличане на данни
  // и последното съобщение за грешка, което сме получили
  const fetchFunctionRef = useRef(fetchFunction);
  const errorMessageRef = useRef(errorMessage);
  
  // Актуализираме ref при промяна на fetchFunction
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  // Актуализираме errorMessage ref
  useEffect(() => {
    errorMessageRef.current = errorMessage;
  }, [errorMessage]);

  // Създаваме стабилен ключ, базиран на съдържанието на dependencies
  // Това решава проблема със spread оператора в dependency array
  const dependenciesKey = useMemo(() => {
    try {
      return JSON.stringify(dependencies);
    } catch {
      // Като резервен вариант, ако масивът съдържа нестрингифицируеми стойности
      return String(Math.random()); // Гарантира нов ефект
    }
  }, [dependencies]); // Използваме масива директно като зависимост
  
  // Главният useEffect за извличане на данни
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;
    
    async function fetchData() {
      try {
        setLoading(true);
        const result = await fetchFunctionRef.current(abortController.signal);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (error) {
        if (!isRequestCanceled(error) && isMounted) {
          setError(errorMessageRef.current || 'Не успяхме да заредим данните. Моля, опитайте по-късно.');
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

  }, [dependenciesKey]); // Използваме стрингифицирания ключ
  
  return { data, loading, error };
}

export default useApiData;