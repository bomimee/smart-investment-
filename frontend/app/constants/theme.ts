/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export type ThemeMode = "system" | "light" | "dark";

export const THEME = {
  light: {
    name: "light",
    colors: {
      background: "#F6F7F2",
      card: "#FFFFF0",
      text: "#2D3640",
      textMuted: "#5A7863",
      border: "#C8D6C2",
      primary: "#3B4953",
      primaryText: "#FFFFF0",
      accent: "#90AB8B",
      danger: "crimson",
    },
    // 라이트는 배경 이미지 없음
    backgroundImage: null as any,
  },
  dark: {
    name: "dark",
    colors: {
      background: "#0B0A16",
      card: "rgba(10,10,18,0.62)",
      text: "#F4F2FF",
      textMuted: "#B9B6D6",
      border: "rgba(255,255,255,0.16)",
      primary: "rgba(244,242,255,0.16)",
      primaryText: "#F4F2FF",
      accent: "#7C6EF6",
      danger: "#FF5A6A",
    },
    // ✅ 다크에서만 너가 고른 이미지 사용
    backgroundImage: require("../assets/images/Lawrencium.jpg"),
  },
} as const;


export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
