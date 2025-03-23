import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Компонент, който скролва страницата най-отгоре при всяка промяна на маршрута
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;