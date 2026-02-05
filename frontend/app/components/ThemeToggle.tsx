import React from "react";
import { Pressable, StyleSheet, Text, View, Animated } from "react-native";
import { useTheme } from "../provider/ThemeContext";

export default function ThemeToggle() {
  const { mode, setMode, theme, scheme } = useTheme();
  const C = theme.colors;

  const isDark = mode === "dark";
  const animatedValue = React.useRef(new Animated.Value(isDark ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [isDark]);

  const sliderPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 75], // Half width of the toggle
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#1a1a1a'],
  });

  return (
    <View
      style={[
        styles.wrap,
        { 
          backgroundColor: scheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          borderColor: C.border,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.slider,
          {
            backgroundColor,
            transform: [{ translateX: sliderPosition }],
            shadowColor: scheme === "dark" ? "#ffffff" : "#000000",
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          },
        ]}
      />
      
      <Pressable
        onPress={() => setMode("light")}
        style={styles.half}
      >
        <Text 
          style={[
            styles.txt, 
            { 
              color: !isDark ? C.primary : C.textMuted,
              fontWeight: !isDark ? "900" : "600",
            }
          ]}
        >
          ☀️ LIGHT
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setMode("dark")}
        style={styles.half}
      >
        <Text 
          style={[
            styles.txt, 
            { 
              color: isDark ? C.primary : C.textMuted,
              fontWeight: isDark ? "900" : "600",
            }
          ]}
        >
          🌙 DARK
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 999,
    height: 36,
    width: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 74,
    height: 30,
    borderRadius: 999,
    zIndex: 1,
  },
  half: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  txt: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
