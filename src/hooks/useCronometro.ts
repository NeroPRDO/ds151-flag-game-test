import { useState, useEffect } from 'react';

export function useCronometro(segundosIniciais: number, onZero?: () => void, resetKey?: unknown) {
  const [tempo, setTempo] = useState(segundosIniciais);
  const [activeResetKey, setActiveResetKey] = useState(resetKey);

  useEffect(() => {
    setTempo(segundosIniciais);
    setActiveResetKey(resetKey);
  }, [segundosIniciais, resetKey]);

  useEffect(() => {
    if (activeResetKey !== resetKey) return;

    if (tempo <= 0) {
      if (onZero) onZero();
      return;
    }

    const intervalo = setInterval(() => setTempo((t) => t - 1), 1000);
    return () => clearInterval(intervalo);
  }, [tempo, onZero, resetKey, activeResetKey]);

  return tempo;
}
