import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Mode } from '../types';
import { C, R } from '../theme';

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export function ModeSwitch({ mode, onModeChange }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const indicatorWidth = trackWidth > 0 ? (trackWidth - 10) / 2 : 0;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: mode === 'tonight' ? 0 : 1,
      friction: 20,
      tension: 180,
      useNativeDriver: false,
    }).start();
  }, [mode, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, indicatorWidth],
  });

  return (
    <View
      style={styles.track}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      {/* Sliding indicator */}
      {indicatorWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}

      {/* Tap targets */}
      <Pressable
        onPress={() => onModeChange('tonight')}
        style={styles.pill}
      >
        <Text
          style={[
            styles.pillText,
            mode === 'tonight' && styles.pillTextActive,
          ]}
        >
          Tonight
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onModeChange('archive')}
        style={styles.pill}
      >
        <Text
          style={[
            styles.pillText,
            mode === 'archive' && styles.pillTextActive,
          ]}
        >
          Archive
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: C.surface,
    borderColor: C.surfaceBorder,
    borderRadius: R.md,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 5,
    position: 'relative',
  },
  indicator: {
    backgroundColor: C.paperWarm,
    borderRadius: R.md - 2,
    bottom: 5,
    left: 5,
    position: 'absolute',
    top: 5,
  },
  pill: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 11,
    zIndex: 1,
  },
  pillText: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  pillTextActive: {
    color: C.textDark,
  },
});
