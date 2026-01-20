import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../provider/ThemeContext";

export default function TabLayout() {
  const { theme } = useTheme();
  const C = theme.colors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: C.card },
        headerTitleStyle: { color: C.text },
        headerTintColor: C.text,

        // 탭 라벨 스타일
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginBottom: Platform.OS === "android" ? 6 : 0,
        },

        // 탭 색상
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textMuted,

        // ✅ 탭바 스타일(여기서 대부분 바꿈)
        tabBarStyle: {
          backgroundColor: C.card,
          borderTopColor: "transparent", // 위 경계선 제거
          height: 64,
          paddingTop: 8,
          paddingBottom: 10,

          // 둥글게 + 떠있는 느낌
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 50,
          borderTopLeftRadius: 18, // ✅
          borderTopRightRadius: 18,
          overflow: "hidden",


          // 그림자(iOS) / elevation(Android)
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        },

        // (선택) 탭 아이템 간격/정렬
        tabBarItemStyle: {
          borderRadius: 14,
          marginHorizontal: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarLabel: "홈",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="analysis"
        options={{
          title: "AI 분석",
          tabBarLabel: "분석",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "analytics" : "analytics-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarLabel: "Login",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "happy-outline" : "sad-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "setting",
          tabBarLabel: "Setting",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

//npx expo start
