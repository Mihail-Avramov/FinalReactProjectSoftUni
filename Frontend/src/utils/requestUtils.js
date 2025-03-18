/**
 * Проверява дали грешката е от отменена заявка
 */
export const isRequestCanceled = (error) => {
  return (
    error?.name === 'CanceledError' || 
    error?.name === 'AbortError' || 
    error?.code === 'ERR_CANCELED'
  );
};