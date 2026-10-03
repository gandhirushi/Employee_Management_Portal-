import { useEffect } from 'react';

/**
 * Custom hook to detect clicks outside of a referenced element.
 * @param {React.RefObject} ref
 * @param {Function} handler Callback when click occurs outside
 */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(event) {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    }

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default useClickOutside;
