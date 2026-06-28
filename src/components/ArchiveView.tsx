import { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Token } from '../types';
import { C, R, S } from '../theme';
import { TokenCard } from './TokenCard';
import { ShareModal } from './ShareModal';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  tokens: Token[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete?: (id: string) => void;
};

// ─── Constants ──────────────────────────────────────────────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ─── Types ──────────────────────────────────────────────────────────────────

type DayCell = {
  day: number;
  isoDate: string;
  token: Token | null;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function ArchiveView({ onSelect, selectedId, tokens, onDelete }: Props) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [sharingToken, setSharingToken] = useState<Token | null>(null);
  const [sharingMonth, setSharingMonth] = useState(false);

  // Lookup: isoDate → Token
  const tokenMap = useMemo(() => {
    const map = new Map<string, Token>();
    for (const t of tokens) map.set(t.isoDate, t);
    return map;
  }, [tokens]);

  // Build calendar as week rows
  const { weeks, filledCount, totalDays } = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const offset = (firstDow + 6) % 7; // Monday = 0

    const allCells: (DayCell | null)[] = [];

    // Leading padding
    for (let i = 0; i < offset; i++) allCells.push(null);

    let filled = 0;
    for (let d = 1; d <= total; d++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const token = tokenMap.get(iso) ?? null;
      if (token) filled++;
      allCells.push({ day: d, isoDate: iso, token });
    }

    // Trailing padding to complete last week
    while (allCells.length % 7 !== 0) allCells.push(null);

    // Split into weeks
    const weekRows: (DayCell | null)[][] = [];
    for (let i = 0; i < allCells.length; i += 7) {
      weekRows.push(allCells.slice(i, i + 7));
    }

    return { weeks: weekRows, filledCount: filled, totalDays: total };
  }, [viewYear, viewMonth, tokenMap]);

  const selectedToken = useMemo(
    () => tokens.find((t) => t.id === selectedId) ?? null,
    [tokens, selectedId],
  );

  function navigate(dir: -1 | 1) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (dir === -1) {
      if (viewMonth === 0) {
        setViewYear((y) => y - 1);
        setViewMonth(11);
      } else {
        setViewMonth((m) => m - 1);
      }
    } else {
      if (viewMonth === 11) {
        setViewYear((y) => y + 1);
        setViewMonth(0);
      } else {
        setViewMonth((m) => m + 1);
      }
    }
  }

  function handleSelect(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onSelect(id);
  }

  function handleDelete(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onDelete?.(id);
    onSelect(null);
  }

  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.monthTitle}>
              {MONTHS[viewMonth]}
            </Text>
            <Text style={styles.yearText}> in light</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => navigate(-1)}
              style={({ pressed }) => [
                styles.navBtn,
                pressed && styles.navBtnPressed,
              ]}
            >
              <Text style={styles.navArrow}>‹</Text>
            </Pressable>
            <Pressable
              disabled={isCurrentMonth}
              onPress={() => navigate(1)}
              style={({ pressed }) => [
                styles.navBtn,
                isCurrentMonth && styles.navBtnDisabled,
                pressed && !isCurrentMonth && styles.navBtnPressed,
              ]}
            >
              <Text
                style={[styles.navArrow, isCurrentMonth && styles.navArrowDim]}
              >
                ›
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Sub-header */}
        <View style={styles.subHeader}>
          <Text style={styles.countText}>
            {viewYear} · {filledCount} of {totalDays}
          </Text>
        </View>

        {/* ── Day-of-week headers ────────────────────────── */}
        <View style={styles.dayHeaders}>
          {DAY_HEADERS.map((label, i) => (
            <View key={i} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Calendar grid — rendered week by week ──────── */}
        <View style={styles.calendarBody}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((cell, ci) => {
                // Padding cell (before/after month)
                if (!cell) {
                  return (
                    <View key={`pad-${wi}-${ci}`} style={[styles.cell, styles.cellInvisible]} />
                  );
                }

                const hasToken = cell.token !== null;
                const isSelected = cell.token?.id === selectedId;

                // ── Filled cell: mini palette ──
                if (hasToken) {
                  return (
                    <Pressable
                      key={cell.isoDate}
                      onPress={() => handleSelect(cell.token!.id)}
                      style={({ pressed }) => [
                        styles.cell,
                        isSelected && styles.cellSelected,
                        pressed && styles.cellPressed,
                      ]}
                    >
                      <View style={styles.miniPalette}>
                        {cell.token!.colors.map((color, bi) => (
                          <View
                            key={bi}
                            style={[styles.miniBand, { backgroundColor: color }]}
                          />
                        ))}
                      </View>
                    </Pressable>
                  );
                }

                // ── Empty cell: day number ──
                return (
                  <View key={cell.isoDate} style={[styles.cell, styles.cellEmpty]}>
                    <Text style={styles.cellDayNum}>{cell.day}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Export month action */}
        {filledCount > 0 && (
          <Pressable
            onPress={() => setSharingMonth(true)}
            style={({ pressed }) => [
              styles.exportMonthBtn,
              pressed && styles.exportMonthBtnPressed,
            ]}
          >
            <Text style={styles.exportMonthText}>Export {MONTHS[viewMonth].toLowerCase()} in light</Text>
          </Pressable>
        )}
      </View>

      {/* ── Selected token or empty state ──────────────── */}
      {selectedToken ? (
        <View style={styles.selectedDetailWrap}>
          <TokenCard token={selectedToken} />
          
          <Pressable
            onPress={() => setSharingToken(selectedToken)}
            style={({ pressed }) => [
              styles.shareBtn,
              pressed && styles.shareBtnPressed,
            ]}
          >
            <Text style={styles.shareBtnText}>Export keepsake</Text>
          </Pressable>

          <Pressable
            onPress={() => handleDelete(selectedToken.id)}
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && styles.deleteBtnPressed,
            ]}
          >
            <Text style={styles.deleteBtnText}>Remove entry</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyStrip}>
            <View style={[styles.emptyBand, { backgroundColor: '#2A3B52' }]} />
            <View style={[styles.emptyBand, { backgroundColor: '#4A6580' }]} />
            <View style={[styles.emptyBand, { backgroundColor: '#8BA4BD' }]} />
          </View>
          <Text style={styles.emptyTitle}>
            {filledCount === 0 ? 'Begin tonight' : 'Tap a day'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filledCount === 0
              ? 'Save your first color before sleep'
              : 'Each color is a night you kept'}
          </Text>
        </View>
      )}
      {/* Share Modal overlay for single day */}
      <ShareModal
        mode="day"
        token={sharingToken}
        visible={sharingToken !== null}
        onClose={() => setSharingToken(null)}
      />
      {/* Share Modal overlay for whole month */}
      <ShareModal
        mode="month"
        weeks={weeks}
        viewMonth={viewMonth}
        viewYear={viewYear}
        filledCount={filledCount}
        totalDays={totalDays}
        visible={sharingMonth}
        onClose={() => setSharingMonth(false)}
      />
    </View>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const CELL_GAP = 5;

const styles = StyleSheet.create({
  container: {
    gap: 18,
    marginBottom: 18,
  },

  panel: {
    backgroundColor: C.surface,
    borderColor: C.surfaceBorder,
    borderRadius: R.xl,
    borderWidth: 1,
    padding: S.md,
  },

  // Header
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  monthTitle: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  yearText: {
    color: C.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  navBtn: {
    alignItems: 'center',
    backgroundColor: C.surfaceAlt,
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  navBtnPressed: {
    backgroundColor: '#252B2E',
    transform: [{ scale: 0.92 }],
  },
  navBtnDisabled: {
    opacity: 0.25,
  },
  navArrow: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  navArrowDim: {
    color: C.textDim,
  },

  // Sub-header
  subHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 4,
  },
  countText: {
    color: C.textDim,
    fontSize: 13,
    fontWeight: '700',
  },
  exportMonthBtn: {
    alignItems: 'center',
    borderTopColor: C.surfaceBorder,
    borderTopWidth: 1,
    justifyContent: 'center',
    marginTop: S.md,
    paddingTop: S.md,
  },
  exportMonthBtnPressed: {
    opacity: 0.6,
  },
  exportMonthText: {
    color: C.accentGold,
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Day headers
  dayHeaders: {
    flexDirection: 'row',
    gap: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  dayHeaderCell: {
    alignItems: 'center',
    flex: 1,
  },
  dayHeaderText: {
    color: C.textDim,
    fontSize: 11,
    fontWeight: '800',
    opacity: 0.7,
  },

  // Calendar body
  calendarBody: {
    gap: CELL_GAP,
  },
  weekRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },

  // Cells
  cell: {
    aspectRatio: 1,
    borderColor: 'transparent',
    borderRadius: 10,
    borderWidth: 2.5,
    flex: 1,
    overflow: 'hidden',
  },
  cellInvisible: {
    opacity: 0,
  },
  cellSelected: {
    borderColor: C.accentLight,
  },
  cellPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.92 }],
  },

  // Filled cell — mini palette
  miniPalette: {
    flex: 1,
    flexDirection: 'row',
  },
  miniBand: {
    flex: 1,
  },

  // Empty cell
  cellEmpty: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    justifyContent: 'center',
  },
  cellDayNum: {
    color: 'rgba(255,255,255,0.22)',
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    backgroundColor: C.surface,
    borderColor: C.surfaceBorder,
    borderRadius: R.xl,
    borderWidth: 1,
    paddingHorizontal: S.lg,
    paddingVertical: 36,
  },
  emptyStrip: {
    borderRadius: 8,
    flexDirection: 'row',
    height: 6,
    marginBottom: 16,
    overflow: 'hidden',
    width: 60,
  },
  emptyBand: {
    flex: 1,
  },
  emptyTitle: {
    color: C.textSecondary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: C.textDim,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Selected Detail Actions
  selectedDetailWrap: {
    gap: 8,
  },
  shareBtn: {
    alignItems: 'center',
    backgroundColor: C.surface,
    borderColor: C.surfaceBorder,
    borderRadius: R.md - 2,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: S.sm,
    paddingVertical: 14,
  },
  shareBtnPressed: {
    backgroundColor: C.surfaceAlt,
    transform: [{ scale: 0.98 }],
  },
  shareBtnText: {
    color: C.accentGold,
    fontSize: 14,
    fontWeight: '800',
  },
  deleteBtn: {
    alignSelf: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteBtnPressed: {
    opacity: 0.6,
  },
  deleteBtnText: {
    color: '#E06D6D',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    opacity: 0.75,
  },
});
