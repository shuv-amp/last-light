import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Token } from '../types';
import { C, R, S } from '../theme';
import { TokenCard } from './TokenCard';

type Props = {
  mode: 'day' | 'month';
  token?: Token | null; // used in 'day' mode
  weeks?: (any | null)[][]; // used in 'month' mode
  viewMonth?: number; // used in 'month' mode
  viewYear?: number; // used in 'month' mode
  filledCount?: number; // used in 'month' mode
  totalDays?: number; // used in 'month' mode
  visible: boolean;
  onClose: () => void;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const CELL_GAP = 5;

export function ShareModal({
  mode,
  token,
  weeks,
  viewMonth,
  viewYear,
  filledCount,
  totalDays,
  visible,
  onClose,
}: Props) {
  const viewRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const displayDate = mode === 'day' && token ? token.date : '';
  const monthName = mode === 'month' && viewMonth !== undefined ? MONTHS[viewMonth] : '';

  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));

      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1.0,
      });

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        const filename = mode === 'day' && token
          ? `${token.date.toLowerCase().replace(' ', '_')}_light.png`
          : `${monthName.toLowerCase()}_in_light.png`;
        link.download = filename;
        link.click();
      } else {
        const available = await Sharing.isAvailableAsync();
        if (available) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: mode === 'day' ? `Share Keepsake` : `Share Month Grid`,
            UTI: 'public.png',
          });
        } else {
          alert('Sharing is not supported on this device.');
        }
      }
    } catch (err) {
      console.warn('Share failed:', err);
      alert('Could not generate shareable card.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          
          <View style={styles.previewContainer}>
            {/* 9:16 Canvas to capture */}
            <View ref={viewRef} collapsable={false} style={styles.storyFrame}>
              <View style={styles.storyContent}>
                
                {/* Header Section */}
                {mode === 'day' ? (
                  <View style={styles.storyHeader}>
                    <Text style={styles.storyHeaderTag}>keepsake</Text>
                  </View>
                ) : (
                  <View style={styles.monthHeader}>
                    <Text style={styles.monthTitle}>{monthName}</Text>
                    <Text style={styles.monthSubTitle}>in light</Text>
                    <Text style={styles.monthMeta}>
                      {viewYear} · {filledCount} of {totalDays} days kept
                    </Text>
                  </View>
                )}

                {/* Center Section (Keepsake Card OR Calendar Grid) */}
                {mode === 'day' && token ? (
                  <View style={styles.cardContainer}>
                    <TokenCard token={token} />
                  </View>
                ) : mode === 'month' && weeks ? (
                  <View style={styles.gridContainer}>
                    {/* Day headers */}
                    <View style={styles.dayHeaders}>
                      {DAY_HEADERS.map((label, i) => (
                        <View key={i} style={styles.dayHeaderCell}>
                          <Text style={styles.dayHeaderText}>{label}</Text>
                        </View>
                      ))}
                    </View>
                    {/* Grid body */}
                    <View style={styles.calendarBody}>
                      {weeks.map((week, wi) => (
                        <View key={wi} style={styles.weekRow}>
                          {week.map((cell, ci) => {
                            if (!cell) {
                              return (
                                <View key={`pad-${wi}-${ci}`} style={[styles.cell, styles.cellInvisible]} />
                              );
                            }
                            
                            const hasToken = cell.token !== null;
                            if (hasToken) {
                              return (
                                <View key={cell.isoDate} style={styles.cell}>
                                  <View style={styles.miniPalette}>
                                    {cell.token.colors.map((color: string, bi: number) => (
                                      <View
                                        key={bi}
                                        style={[styles.miniBand, { backgroundColor: color }]}
                                      />
                                    ))}
                                  </View>
                                </View>
                              );
                            }
                            
                            return (
                              <View key={cell.isoDate} style={[styles.cell, styles.cellEmpty]}>
                                <Text style={styles.cellDayNum}>{cell.day}</Text>
                              </View>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {/* Footer Section */}
                <View style={styles.storyFooter}>
                  <View style={styles.brandMark}>
                    <View style={styles.brandLine} />
                    <Text style={styles.brandTitle}>Last Light</Text>
                  </View>
                  <Text style={styles.brandTagline}>
                    keeps the color a day ended in.
                  </Text>
                </View>

              </View>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              disabled={sharing}
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && styles.cancelBtnPressed,
              ]}
            >
              <Text style={styles.cancelText}>Back</Text>
            </Pressable>
            
            <Pressable
              disabled={sharing}
              onPress={handleShare}
              style={({ pressed }) => [
                styles.shareBtn,
                pressed && styles.shareBtnPressed,
              ]}
            >
              {sharing ? (
                <ActivityIndicator color={C.white} size="small" />
              ) : (
                <Text style={styles.shareText}>
                  {Platform.OS === 'web' ? 'Save Image' : 'Export Keepsake'}
                </Text>
              )}
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(9,11,12,0.92)',
    flex: 1,
    justifyContent: 'center',
    padding: S.md,
  },
  sheet: {
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: 430,
    width: '100%',
  },
  previewContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  storyFrame: {
    aspectRatio: 9 / 16,
    backgroundColor: C.bg,
    borderColor: '#1D2224',
    borderRadius: R.xl,
    borderWidth: 1,
    height: '92%',
    maxHeight: 680,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
  },
  storyContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 48,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  
  // Header styles
  storyHeader: {
    alignItems: 'center',
  },
  storyHeaderTag: {
    color: C.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  
  // Month header styles
  monthHeader: {
    alignItems: 'center',
    marginTop: 8,
  },
  monthTitle: {
    color: C.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  monthSubTitle: {
    color: C.accent,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  monthMeta: {
    color: C.textDim,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    opacity: 0.8,
  },

  // Content Container styles
  cardContainer: {
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },

  // Grid container styles
  gridContainer: {
    alignSelf: 'stretch',
    backgroundColor: C.surface,
    borderColor: C.surfaceBorder,
    borderRadius: R.xl,
    borderWidth: 1,
    padding: S.md,
  },
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
  calendarBody: {
    gap: CELL_GAP,
  },
  weekRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  cell: {
    aspectRatio: 1,
    borderRadius: 10,
    flex: 1,
    overflow: 'hidden',
  },
  cellInvisible: {
    opacity: 0,
  },
  miniPalette: {
    flex: 1,
    flexDirection: 'row',
  },
  miniBand: {
    flex: 1,
  },
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

  // Footer styles
  storyFooter: {
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  brandLine: {
    backgroundColor: C.accent,
    borderRadius: R.pill,
    height: 14,
    width: 2.5,
  },
  brandTitle: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  brandTagline: {
    color: C.textDim,
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.2,
    opacity: 0.75,
  },
  
  // Action Buttons
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 10,
  },
  cancelBtn: {
    alignItems: 'center',
    borderColor: C.surfaceBorder,
    borderRadius: R.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  cancelBtnPressed: {
    backgroundColor: C.surfaceAlt,
  },
  cancelText: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: '800',
  },
  shareBtn: {
    alignItems: 'center',
    backgroundColor: C.accent,
    borderRadius: R.md,
    flex: 2.2,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  shareBtnPressed: {
    backgroundColor: '#C07A4A',
  },
  shareText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '900',
  },
});
