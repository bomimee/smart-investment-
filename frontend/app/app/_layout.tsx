import { Stack } from "expo-router";
import { ThemeProvider } from "../provider/ThemeProvider";
import { MarketProvider } from "../provider/MarketContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <MarketProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </MarketProvider>
    </ThemeProvider>
  );
}
