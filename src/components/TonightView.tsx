import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { Token } from '../types';
import { C, R, S, curatedPalettes } from '../theme';
import { ColorPicker } from './ColorPicker';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  isFirstLaunch: boolean;
  onSave: (word: string, colors: string[]) => Promise<Token>;
  onSaved: (token: Token) => void;
  onFocusInput?: () => void;
};

export function TonightView({ isFirstLaunch, onSave, onSaved, onFocusInput }: Props) {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [customPalette, setCustomPalette] = useState<string[] | null>(null);
  const [word, setWord] = useState('');
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const activeColors =
    customPalette && paletteIndex === -1
      ? customPalette
      : curatedPalettes[paletteIndex]?.colors ?? curatedPalettes[0].colors;

  const paletteName =
    paletteIndex >= 0 ? curatedPalettes[paletteIndex].name : 'your palette';

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      Keyboard.dismiss();
      const token = await onSave(word, activeColors);
      onSaved(token);
      setWord('');
    } finally {
      setSaving(false);
    }
  }

  function handleFocus() {
    setFocused(true);
    onFocusInput?.();
  }

  function handleBlur() {
    setFocused(false);
  }

  function handleSelectCurated(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPaletteIndex(index);
    setCustomPalette(null);
  }

  function handleSelectCustom(colors: string[]) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCustomPalette(colors);
    setPaletteIndex(-1);
  }

  return (
    <View style={styles.container}>
      {/* Hero tagline — first launch only */}
      {isFirstLaunch && (
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Keep the color{'\n'}a day ended in.
          </Text>
          <Text style={styles.heroSub}>One color. One word. Before sleep.</Text>
        </View>
      )}

      {/* ── Large palette preview ──────────────────────── */}
      <View style={styles.previewCard}>
        <View style={styles.colorField}>
          {activeColors.map((color, i) => (
            <View
              key={`field-${i}`}
              style={[
                styles.colorBand,
                {
                  backgroundColor: color,
                  flex: i === 2 ? 1.35 : 1,
                },
              ]}
            />
          ))}
          {/* Bottom vignette for label readability */}
          <View style={styles.vignette} />
          <View style={styles.previewOverlay}>
            <View style={styles.previewPill}>
              <Text style={styles.previewLabel}>{paletteName}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Color picker ───────────────────────────────── */}
      <ColorPicker
        customPalette={customPalette}
        onSelectCurated={handleSelectCurated}
        onSelectCustom={handleSelectCustom}
        selectedIndex={paletteIndex}
      />

      {/* ── Word input + save ──────────────────────────── */}
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.wordRow,
          focused && styles.wordRowFocused,
        ]}
      >
        <View style={styles.wordInputWrap}>
          <View style={styles.kickerRow}>
            <Text style={styles.kicker}>One word</Text>
            {word.length > 0 && (
              <Text style={styles.charCount}>{word.length}/18</Text>
            )}
          </View>
          <TextInput
            ref={inputRef}
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit
            maxLength={18}
            onBlur={handleBlur}
            onChangeText={setWord}
            onFocus={handleFocus}
            onSubmitEditing={handleSave}
            placeholder="before sleep"
            placeholderTextColor={C.textDarkMuted}
            returnKeyType="done"
            style={styles.wordInput}
            value={word}
          />
        </View>
        <Pressable
          disabled={saving}
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            saving && styles.saveDisabled,
            pressed && !saving && styles.savePressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator color={C.white} size="small" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </Pressable>
      </Pressable>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 14,
    marginBottom: 18,
  },

  // Hero (first launch)
  hero: {
    marginBottom: S.xs,
  },
  heroTitle: {
    color: C.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 38,
  },
  heroSub: {
    color: C.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: S.sm,
  },

  // Palette preview — the hero element
  previewCard: {
    backgroundColor: C.surface,
    borderColor: C.surfaceBorder,
    borderRadius: R.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  colorField: {
    aspectRatio: 1.65,
    flexDirection: 'row',
    position: 'relative',
  },
  colorBand: {
    minWidth: 1,
  },
  vignette: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    bottom: 0,
    height: 48,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  previewOverlay: {
    bottom: 12,
    position: 'absolute',
    right: 14,
  },
  previewPill: {
    backgroundColor: 'rgba(14,17,19,0.55)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  previewLabel: {
    color: 'rgba(255,246,234,0.75)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Word row — production polish
  wordRow: {
    alignItems: 'center',
    backgroundColor: C.paperWarm,
    borderColor: 'transparent',
    borderRadius: R.xl,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: S.md - 2,
    // Subtle warm shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  wordRowFocused: {
    borderColor: C.accentLight,
    // Ambient glow when focused
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  wordInputWrap: {
    flex: 1,
    minWidth: 0,
  },
  kickerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  kicker: {
    color: C.textDarkSecondary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  charCount: {
    color: C.textDarkMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    opacity: 0.65,
  },
  wordInput: {
    color: C.textDark,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    paddingVertical: 2,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: C.accent,
    borderRadius: R.md - 2,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 28,
    // Elevated save CTA
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveDisabled: {
    opacity: 0.45,
  },
  savePressed: {
    backgroundColor: '#C07A4A',
    transform: [{ scale: 0.96 }],
  },
  saveText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '900',
  },
});
