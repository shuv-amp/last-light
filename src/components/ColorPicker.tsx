import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { C, R, S, curatedPalettes } from '../theme';
import { buildColorGrid, generatePaletteFromColor } from '../utils/color';

type Props = {
  selectedIndex: number;
  customPalette: string[] | null;
  onSelectCurated: (index: number) => void;
  onSelectCustom: (colors: string[]) => void;
};

export function ColorPicker({
  customPalette,
  onSelectCurated,
  onSelectCustom,
  selectedIndex,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const isCustom = customPalette !== null && selectedIndex === -1;

  return (
    <View style={styles.container}>
      {/* Curated palette grid — 3×3 */}
      <View style={styles.grid}>
        {curatedPalettes.map((palette, index) => {
          const active = selectedIndex === index && !isCustom;
          return (
            <Pressable
              key={palette.name}
              onPress={() => onSelectCurated(index)}
              style={({ pressed }) => [
                styles.paletteThumb,
                active && styles.paletteThumbActive,
                pressed && styles.paletteThumbPressed,
              ]}
            >
              <View style={styles.paletteStrip}>
                {palette.colors.map((color, ci) => (
                  <View
                    key={`${palette.name}-${ci}`}
                    style={[styles.thumbBand, { backgroundColor: color }]}
                  />
                ))}
              </View>
              <View style={[styles.labelRow, active && styles.labelRowActive]}>
                <Text style={[styles.paletteName, active && styles.paletteNameActive]}>
                  {palette.name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Pick your light */}
      <Pressable
        onPress={() => setPickerOpen(true)}
        style={({ pressed }) => [
          styles.customButton,
          isCustom && styles.customButtonActive,
          pressed && styles.customButtonPressed,
        ]}
      >
        {isCustom && customPalette ? (
          <View style={styles.customPreview}>
            {customPalette.map((color, i) => (
              <View
                key={`custom-${i}`}
                style={[styles.customDot, { backgroundColor: color }]}
              />
            ))}
          </View>
        ) : null}
        <Text
          style={[
            styles.customButtonText,
            isCustom && styles.customButtonTextActive,
          ]}
        >
          {isCustom ? 'edit color' : 'choose a color'}
        </Text>
      </Pressable>

      {/* Custom picker modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
        transparent
        visible={pickerOpen}
      >
        <CustomPickerSheet
          onClose={() => setPickerOpen(false)}
          onSelect={(colors) => {
            onSelectCustom(colors);
            setPickerOpen(false);
          }}
        />
      </Modal>
    </View>
  );
}

// Static color grid generated once on load
const COLOR_GRID = buildColorGrid();

// ─── Custom picker sheet ────────────────────────────────────────────────────

function CustomPickerSheet({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (colors: string[]) => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });
  const preview = selectedColor
    ? generatePaletteFromColor(selectedColor)
    : null;

  function handleTouch(evt: any) {
    if (gridSize.width === 0 || gridSize.height === 0) return;
    const { locationX, locationY } = evt.nativeEvent;

    const colWidth = gridSize.width / 12;
    const rowHeight = gridSize.height / 6;

    const col = Math.max(0, Math.min(11, Math.floor(locationX / colWidth)));
    const row = Math.max(0, Math.min(5, Math.floor(locationY / rowHeight)));

    const color = COLOR_GRID[row]?.[col];
    if (color && color !== selectedColor) {
      setSelectedColor(color);
    }
  }

  return (
    <View style={sheet.backdrop}>
      <Pressable style={sheet.dismissArea} onPress={onClose} />
      <View style={sheet.sheet}>
        <View style={sheet.handle} />

        <Text style={sheet.title}>Pick your light</Text>
        <Text style={sheet.subtitle}>
          Slide across — your palette follows
        </Text>

        <View
          onLayout={(e) => {
            setGridSize({
              width: e.nativeEvent.layout.width,
              height: e.nativeEvent.layout.height,
            });
          }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleTouch}
          onResponderMove={handleTouch}
          style={sheet.gridContainer}
        >
          {COLOR_GRID.map((row, ri) => (
            <View key={ri} style={sheet.gridRow} pointerEvents="none">
              {row.map((color, ci) => {
                const active = selectedColor === color;
                return (
                  <View
                    key={`${ri}-${ci}`}
                    style={[
                      sheet.gridCell,
                      { backgroundColor: color },
                      active && sheet.gridCellActive,
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>

        {/* Live palette preview */}
        <View style={sheet.previewSection}>
          <Text style={sheet.previewTitle}>
            {preview ? 'Your palette' : 'Tap a color above'}
          </Text>
          {preview ? (
            <View style={sheet.previewStrip}>
              {preview.map((color, i) => (
                <View
                  key={`pv-${i}`}
                  style={[sheet.previewBand, { backgroundColor: color }]}
                />
              ))}
            </View>
          ) : (
            <View style={sheet.previewEmpty} />
          )}
        </View>

        {/* Actions */}
        <View style={sheet.actions}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              sheet.cancelBtn,
              pressed && sheet.cancelBtnPressed,
            ]}
          >
            <Text style={sheet.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            disabled={!preview}
            onPress={() => preview && onSelect(preview)}
            style={({ pressed }) => [
              sheet.doneBtn,
              !preview && sheet.doneBtnDisabled,
              pressed && preview && sheet.doneBtnPressed,
            ]}
          >
            <Text style={sheet.doneText}>Use this palette</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  paletteThumb: {
    borderColor: C.transparent,
    borderRadius: R.sm,
    borderWidth: 2,
    flexGrow: 1,
    overflow: 'hidden',
    width: '30%',
  },
  paletteThumbActive: {
    borderColor: C.accentLight,
  },
  paletteThumbPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  paletteStrip: {
    flexDirection: 'row',
    height: 48,
  },
  thumbBand: {
    flex: 1,
  },
  labelRow: {
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  labelRowActive: {
    backgroundColor: '#1C1A14',
  },
  paletteName: {
    color: C.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  paletteNameActive: {
    color: C.accentGold,
  },
  customButton: {
    alignItems: 'center',
    backgroundColor: C.surfaceAlt,
    borderColor: C.surfaceBorder,
    borderRadius: R.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: S.sm,
    justifyContent: 'center',
    paddingHorizontal: S.md,
    paddingVertical: 13,
  },
  customButtonActive: {
    borderColor: C.accentLight,
    backgroundColor: '#1C1A14',
  },
  customButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  customPreview: {
    flexDirection: 'row',
    gap: 4,
  },
  customDot: {
    borderRadius: R.pill,
    height: 14,
    width: 14,
  },
  customButtonText: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  customButtonTextActive: {
    color: C.accentGold,
  },
});

const sheet = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    alignSelf: 'center',
    backgroundColor: C.surface,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    maxHeight: '85%',
    maxWidth: 430,
    paddingBottom: 34,
    paddingHorizontal: 20,
    paddingTop: 12,
    width: '100%',
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: C.surfaceBorder,
    borderRadius: R.pill,
    height: 5,
    marginBottom: 18,
    width: 40,
  },
  title: {
    color: C.textPrimary,
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    color: C.textSecondary,
    fontSize: 14,
    marginBottom: 18,
  },
  gridContainer: {
    gap: 6,
    paddingBottom: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  gridCell: {
    aspectRatio: 1,
    borderRadius: 10,
    flex: 1,
  },
  gridCellActive: {
    borderColor: C.white,
    borderWidth: 2.5,
    transform: [{ scale: 1.08 }],
  },

  // Preview section
  previewSection: {
    borderTopColor: C.surfaceBorder,
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
  },
  previewTitle: {
    color: C.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  previewStrip: {
    borderColor: C.surfaceBorder,
    borderRadius: R.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: 64,
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewBand: {
    flex: 1,
  },
  previewEmpty: {
    borderColor: C.surfaceBorder,
    borderRadius: R.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    height: 64,
    marginBottom: 16,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    alignItems: 'center',
    borderColor: C.surfaceBorder,
    borderRadius: R.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  cancelBtnPressed: {
    backgroundColor: C.surfaceAlt,
  },
  cancelText: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: '800',
  },
  doneBtn: {
    alignItems: 'center',
    backgroundColor: C.accent,
    borderRadius: R.md,
    flex: 2,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  doneBtnDisabled: {
    opacity: 0.35,
  },
  doneBtnPressed: {
    backgroundColor: '#C07A4A',
  },
  doneText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '900',
  },
});
