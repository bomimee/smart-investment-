import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useMarket } from '../provider/MarketContext';
import { useTheme } from '../provider/ThemeContext';

export default function MarketToggle() {
  const { market, setMarket } = useMarket();
  const { theme } = useTheme();
  const C = theme.colors;
  const styles = createStyles(C);

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          market === 'KOREA' && styles.activeButton,
          market === 'KOREA' && { backgroundColor: C.primary },
        ]}
        onPress={() => setMarket('KOREA')}
      >
        <Text
          style={[
            styles.buttonText,
            market === 'KOREA' && styles.activeButtonText,
            market === 'KOREA' && { color: C.primaryText },
          ]}
        >
          한국
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.button,
          market === 'US' && styles.activeButton,
          market === 'US' && { backgroundColor: C.primary },
        ]}
        onPress={() => setMarket('US')}
      >
        <Text
          style={[
            styles.buttonText,
            market === 'US' && styles.activeButtonText,
            market === 'US' && { color: C.primaryText },
          ]}
        >
          미국
        </Text>
      </Pressable>
    </View>
  );
}

function createStyles(C: any) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: C.card,
      borderRadius: 8,
      padding: 2,
      gap: 2,
    },
    button: {
      flex: 1,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.border,
    },
    activeButton: {
      borderWidth: 0,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '700',
      color: C.text,
    },
    activeButtonText: {
      fontWeight: '900',
    },
  });
}