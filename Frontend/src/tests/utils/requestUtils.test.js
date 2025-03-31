import { describe, it, expect } from 'vitest';
import { isRequestCanceled } from '../../utils/requestUtils';

describe('isRequestCanceled функция', () => {
  it('връща true за грешка с име CanceledError', () => {
    const error = { name: 'CanceledError' };
    expect(isRequestCanceled(error)).toBe(true);
  });

  it('връща true за грешка с име AbortError', () => {
    const error = { name: 'AbortError' };
    expect(isRequestCanceled(error)).toBe(true);
  });

  it('връща true за грешка с код ERR_CANCELED', () => {
    const error = { code: 'ERR_CANCELED' };
    expect(isRequestCanceled(error)).toBe(true);
  });

  it('връща false за други типове грешки', () => {
    const error = { name: 'NetworkError', code: 'ERR_NETWORK' };
    expect(isRequestCanceled(error)).toBe(false);
  });

  it('връща false за неопределена грешка', () => {
    expect(isRequestCanceled(undefined)).toBe(false);
  });

  it('връща false за null грешка', () => {
    expect(isRequestCanceled(null)).toBe(false);
  });

  it('връща false за обект на грешка с липсващи свойства', () => {
    const error = { message: 'Нещо се обърка' };
    expect(isRequestCanceled(error)).toBe(false);
  });
});