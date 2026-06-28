import { StyleSheet, Text, View } from 'react-native';
import { Token } from '../types';
import { C, R, S } from '../theme';

type Props = {
  token: Token;
};

export function TokenCard({ token }: Props) {
  return (
    <View style={styles.outerShadow}>
      <View style={styles.card}>
        {/* Date meta */}
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{token.date}</Text>
          <Text style={styles.dayText}>
            {token.day} · {token.time}
          </Text>
        </View>

        {/* Palette swatches — the memory */}
        <View style={styles.swatchRow}>
          {token.colors.map((color, i) => (
            <View
              key={`${token.id}-sw-${i}`}
              style={[
                styles.swatch,
                {
                  backgroundColor: color,
                  flex: i === token.colors.length - 1 ? 1.2 : 1,
                },
              ]}
            />
          ))}
        </View>

        {/* Word + tagline */}
        <View style={styles.bottomRow}>
          <Text
            style={styles.wordText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {token.word}
          </Text>
          <Text style={styles.tagline}>
            proof that{'\n'}a day happened
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 14,
  },

  card: {
    backgroundColor: C.paper,
    borderRadius: R.xl,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingBottom: 22,
    paddingTop: 22,
  },

  // Date
  metaRow: {
    marginBottom: 16,
  },
  dateText: {
    color: C.textDark,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  dayText: {
    color: C.textDarkSecondary,
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 3,
    opacity: 0.8,
  },

  // Palette — the main event
  swatchRow: {
    borderRadius: R.md,
    flexDirection: 'row',
    height: 160,
    overflow: 'hidden',
  },
  swatch: {
    minWidth: 1,
  },

  // Bottom
  bottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  wordText: {
    color: '#2A2420',
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  tagline: {
    color: C.textDarkSecondary,
    flexShrink: 1,
    fontSize: 9.5,
    fontWeight: '800',
    lineHeight: 13,
    marginLeft: S.sm,
    maxWidth: 100,
    opacity: 0.55,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
});
