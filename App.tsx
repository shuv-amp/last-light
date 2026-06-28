import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  UIManager,
  View,
  useWindowDimensions,
} from 'react-native';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { Mode, Token } from './src/types';
import { C, S } from './src/theme';
import { useTokenStore } from './src/hooks/useTokenStore';
import { ModeSwitch } from './src/components/ModeSwitch';
import { TonightView } from './src/components/TonightView';
import { ArchiveView } from './src/components/ArchiveView';

export default function App() {
  const { width } = useWindowDimensions();
  const { tokens, loading, isFirstLaunch, saveTonight, deleteToken } = useTokenStore();
  const [mode, setMode] = useState<Mode>('tonight');
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  function handleFocusInput() {
    // Wait for keyboard to rise, then scroll input into view
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 350);
    // Safety net for slower devices
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 600);
  }

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.style.backgroundColor = C.bg;
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    }
  }, []);

  function handleModeChange(newMode: Mode) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMode(newMode);
  }

  const shellWidth = Math.min(width - 32, 430);

  function handleSaved(token: Token) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedArchiveId(token.id);
    setMode('archive');
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingMark}>
            <View style={styles.markLine} />
            <Text style={styles.markText}>Last Light</Text>
          </View>
          <ActivityIndicator color={C.accent} style={{ marginTop: S.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Pinned Navigation Header */}
        <View style={styles.pinnedHeader}>
          <View style={[styles.pinnedHeaderContent, { width: shellWidth }]}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <View style={styles.mark}>
                <View style={styles.markLine} />
                <Text style={styles.markText}>Last Light</Text>
              </View>
            </View>

            {/* Mode switch */}
            <ModeSwitch mode={mode} onModeChange={handleModeChange} />
          </View>
        </View>

        {/* Scrollable Content Container */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.shell, { width: shellWidth }]}>
            {/* Active view */}
            {mode === 'tonight' ? (
              <TonightView
                isFirstLaunch={isFirstLaunch}
                onSave={saveTonight}
                onSaved={handleSaved}
                onFocusInput={handleFocusInput}
              />
            ) : (
              <ArchiveView
                onSelect={setSelectedArchiveId}
                selectedId={selectedArchiveId}
                tokens={tokens}
                onDelete={deleteToken}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: C.bg,
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  pinnedHeader: {
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 12 : 12,
    width: '100%',
    zIndex: 10,
  },
  pinnedHeaderContent: {
    alignSelf: 'center',
    paddingBottom: 0,
  },
  page: {
    alignItems: 'center',
    backgroundColor: C.bg,
    flexGrow: 1,
    paddingBottom: 34,
    paddingTop: 24,
  },
  shell: {
    maxWidth: 430,
  },

  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: S.md,
  },
  mark: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  markLine: {
    backgroundColor: C.accent,
    borderRadius: 999,
    height: 22,
    width: 4,
  },
  markText: {
    color: C.textPrimary,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingMark: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
});
