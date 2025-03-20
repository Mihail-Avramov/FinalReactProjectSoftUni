import { useCallback } from 'react';
import useApiData from '../useApiData';
import ConfigApi from '../../api/ConfigApi';

export function useConfig() {
  const fetchConfig = useCallback(
    (signal) => ConfigApi.getConfig(signal),
    []
  );
  
  return useApiData(
    fetchConfig,
    [],
    'Не успяхме да заредим конфигурацията'
  );
}