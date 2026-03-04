import { useEffect, type RefObject } from 'react';

const useClickOutside = (ref: RefObject<Element>, callback: () => void) => {
    const handleClick = (e: MouseEvent) => {
        // If the referenced element exists and does NOT contain the clicked target,
        // execute the callback function.
        if (ref.current && !ref.current.contains(e.target as Node)) {
            callback();
        }
    };

    useEffect(() => {
        // Add event listener to the entire document on mount (using "mousedown" often works better than "click" with certain elements).
        document.addEventListener('mousedown', handleClick);

        return () => {
            // Clean up the event listener on unmount.
            document.removeEventListener('mousedown', handleClick);
        };
    }, [ref, callback]); // Re-run effect if ref or callback changes
};

export default useClickOutside;
