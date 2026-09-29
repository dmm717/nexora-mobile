import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed: number = 30, delay: number = 0, startTyping: boolean = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsCompleted(false);

    if (!startTyping || !text) return;

    let intervalId: ReturnType<typeof setInterval>;
    
    const timeoutId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(intervalId);
          setIsCompleted(true);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, delay, startTyping]);

  return { displayedText, isCompleted };
}
