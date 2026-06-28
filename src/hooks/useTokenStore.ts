import { useCallback, useEffect, useState } from 'react';
import { Token } from '../types';
import { loadTokens, persistTokens } from '../storage/tokens';

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useTokenStore() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  // Load on mount
  useEffect(() => {
    (async () => {
      const stored = await loadTokens();
      if (stored && stored.length > 0) {
        setTokens(stored);
      } else {
        setIsFirstLaunch(true);
      }
      setLoading(false);
    })();
  }, []);

  // Save tonight's token
  const saveTonight = useCallback(
    async (word: string, colors: string[]): Promise<Token> => {
      const now = new Date();
      const newToken: Token = {
        id: `token-${Date.now()}`,
        isoDate: formatIsoDate(now),
        date: formatDisplayDate(now),
        day: formatDay(now),
        time: formatTime(now),
        word: word.trim() || 'tonight',
        colors,
      };

      const updated = [
        newToken,
        ...tokens.filter((t) => t.isoDate !== newToken.isoDate),
      ];
      setTokens(updated);
      setIsFirstLaunch(false);
      await persistTokens(updated);
      return newToken;
    },
    [tokens],
  );

  // Delete a token
  const deleteToken = useCallback(
    async (id: string) => {
      const updated = tokens.filter((t) => t.id !== id);
      setTokens(updated);
      await persistTokens(updated);
    },
    [tokens],
  );

  return { tokens, loading, isFirstLaunch, saveTonight, deleteToken };
}

// ─── Date formatting helpers ────────────────────────────────────────────────

function formatIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
];

function formatDisplayDate(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function formatDay(d: Date): string {
  return DAYS[d.getDay()];
}

function formatTime(d: Date): string {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}
