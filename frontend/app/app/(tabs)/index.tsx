import React, { useMemo, useState } from "react";
import { router } from "expo-router";
import { useTheme } from "../../provider/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from "react-native";
import WebView from "react-native-webview";
import { Dimensions } from "react-native";
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;
const CHART_HEIGHT = Math.floor(Dimensions.get("window").height * 0.45);
type OHLCV = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
type Signal = { time: string; type: "BUY" | "SELL"; price: number };

export default function HomeScreen() {
  const { theme, scheme } = useTheme();
  const C = theme.colors;
  const styles = useMemo(() => createStyles(C, scheme), [C, scheme]);

  // 다크면 배경이미지, 라이트면 그냥 View
  const Container: any = scheme === "dark" ? ImageBackground : View;
  const containerProps =
    scheme === "dark"
      ? { source: theme.backgroundImage, resizeMode: "cover" as const }
      : {};

  const [code, setCode] = useState<string>("068270");
  const [start, setStart] = useState<string>("20240101");
  const [end, setEnd] = useState<string>("20250114");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const [data, setData] = useState<{
    ohlcv: OHLCV[];
    signals: Signal[];
    summary: any;
    code: string;
  } | null>(null);

  const [analysisLoading, setAnalysisLoading] = useState(false);

  const isValidCode = (v: string) => /^[0-9]{6}$/.test(v.trim());
  const isValidDate = (v: string) => /^[0-9]{8}$/.test(v.trim());

  const fetchChart = async () => {
    const c = code.trim();
    const s = start.trim();
    const e = end.trim();

    if (!isValidCode(c)) {
      setErr("종목코드는 6자리 숫자(예: 005930)로 입력해줘.");
      return;
    }
    if (!isValidDate(s) || !isValidDate(e)) {
      setErr("날짜는 YYYYMMDD 형식(예: 20240101)으로 입력해줘.");
      return;
    }

    setErr("");
    setLoading(true);
    setData(null);

    try {
      const url = `${API_BASE}/api/chart?code=${encodeURIComponent(
        c
      )}&start=${encodeURIComponent(s)}&end=${encodeURIComponent(
        e
      )}&period=D&is_mock=false`;

      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`서버 오류 (${res.status}): ${text}`);
      }

      const json = await res.json();

      if (!json.ohlcv || !Array.isArray(json.ohlcv)) {
        throw new Error("응답 형식이 예상과 달라(ohlcv 없음).");
      }

      setData({
        code: json.code ?? c,
        ohlcv: json.ohlcv,
        signals: json.signals ?? [],
        summary: json.summary ?? {},
      });
    } catch (e: any) {
      setErr(e?.message ?? "요청 실패");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    if (!data) return;

    setAnalysisLoading(true);
    setErr("");

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: data.code,
          ohlcv: data.ohlcv,
          signals: data.signals ?? [],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`분석 서버 오류 (${res.status}): ${text}`);
      }

      const json = await res.json();

      router.push({
        pathname: "/analysis",
        params: { payload: JSON.stringify(json.analysis) },
      });
    } catch (e: any) {
      setErr(e?.message ?? "분석 요청 실패");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const html = useMemo(() => {
    const ohlcv = data?.ohlcv ?? [];
    const signals = data?.signals ?? [];

    const markers = signals.map((s) => ({
      time: s.time,
      position: s.type === "BUY" ? "belowBar" : "aboveBar",
      shape: s.type === "BUY" ? "arrowUp" : "arrowDown",
      text: s.type,
    }));

    const bg = C.card;
    const textColor = C.text;

    return `
<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html, body { margin:0; padding:0; height:100%; background:${bg}; }
    #chart { width:100%; height:100%; background:${bg};}
    #err {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0;
    padding: 8px;
    font: 12px monospace;
    color: #b00020;
    background: transparent; /* ✅ 흰 배경 제거 */
    z-index: 9999;
    white-space: pre-wrap;
  }
  </style>
  <script>
  function post(msg){
    const el = document.getElementById('err');
    if (!el) return;

    if (msg && String(msg).trim().length > 0) {
      el.style.display = 'block';
      el.textContent = String(msg);
    } else {
      el.style.display = 'none';
      el.textContent = '';
    }

    try {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(String(msg));
    } catch (e) {}
  }
</script>
</head>
<body>
  <div id="err"></div>
  <div id="chart"></div>

  <script>
    function post(msg){
      try { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(String(msg)); } catch(e){}
      const el = document.getElementById('err');
      if (el) el.textContent = String(msg);
    }
    window.onerror = function(message, source, lineno, colno, error) {
      post("JS ERROR: " + message + " @ " + lineno + ":" + colno);
    };
  </script>

  <script
    src="https://unpkg.com/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js"
    onload="post('lightweight-charts v4 loaded')"
    onerror="post('FAILED to load lightweight-charts v4 from unpkg')"
  ></script>

  <script>
    const ohlcv = ${JSON.stringify(ohlcv)};
    const markers = ${JSON.stringify(markers)};

    function draw() {
      if (!window.LightweightCharts) {
        post("LightweightCharts is undefined (script not loaded)");
        return;
      }
      if (!ohlcv || !ohlcv.length) {
        post("No OHLCV data");
        return;
      }

      post("");

      const chart = LightweightCharts.createChart(document.getElementById('chart'), {
        width: window.innerWidth,
        height: window.innerHeight,
        layout: { background: { color: '${bg}' }, textColor: '${textColor}' },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false },
        grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      });

      const candleSeries = chart.addCandlestickSeries();
      candleSeries.setData(ohlcv);
      candleSeries.setMarkers(markers);

      window.addEventListener('resize', () => {
        chart.applyOptions({ width: window.innerWidth, height: window.innerHeight });
      });
    }

    setTimeout(draw, 300);
  </script>
</body>
</html>
`;
  }, [data, scheme]);

  return (
    <Container style={styles.bg} {...containerProps}>
      <View
        style={[
          styles.topBar,
          { backgroundColor: scheme === "dark" ? "transparent" : C.background },
        ]}
      >
        <ThemeToggle />
        {/* ThemeToggle 내부에서 light/dark 바꾸는 switch/segmented control */}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: scheme === "dark" ? "transparent" : C.background,
            paddingBottom: 140,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>차트 조회</Text>

        <View style={styles.formRow}>
          <View style={styles.field}>
            <Text style={styles.label}>종목코드(6자리)</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="예: 005930"
              placeholderTextColor={C.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
            />
          </View>

          <Pressable
            onPress={fetchChart}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              loading && styles.buttonDisabled,
              pressed && !loading ? styles.buttonPressed : null,
            ]}
          >
            <Text style={styles.buttonText}>
              {loading ? "조회중..." : "조회"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.formRow}>
          <View style={styles.field}>
            <Text style={styles.label}>시작일(YYYYMMDD)</Text>
            <TextInput
              value={start}
              onChangeText={setStart}
              keyboardType="number-pad"
              maxLength={8}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>종료일(YYYYMMDD)</Text>
            <TextInput
              value={end}
              onChangeText={setEnd}
              keyboardType="number-pad"
              maxLength={8}
              style={styles.input}
            />
          </View>
        </View>

        {!!err && <Text style={styles.error}>{err}</Text>}

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator />
          </View>
        )}

        {data && (
          <View style={styles.summary}>
            <Text style={styles.data}>종목: {data.code}</Text>
            <Text style={styles.data}>
              Latest close: {data.summary?.latest_close ?? "-"}
            </Text>
            <Text style={styles.data}>
              Signals: {data.summary?.num_signals ?? 0}
            </Text>
            <Text style={styles.data}>
              Latest signal:{" "}
              {data.summary?.latest_signal
                ? `${data.summary.latest_signal.type} @ ${data.summary.latest_signal.time}`
                : "None"}
            </Text>
          </View>
        )}

        <View style={styles.chart}>
          {data ? (
            <WebView
              originWhitelist={["*"]}
              source={{ html }}
              javaScriptEnabled
              domStorageEnabled
              mixedContentMode="always"
              onError={(e) => console.log("WEBVIEW onError:", e.nativeEvent)}
              onHttpError={(e) =>
                console.log("WEBVIEW onHttpError:", e.nativeEvent)
              }
              onMessage={(e) => console.log("WEBVIEW MSG:", e.nativeEvent.data)}
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                종목코드를 입력하고 조회를 눌러 차트를 불러오세요.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: scheme === "dark" ? "transparent" : C.background,
          },
        ]}
      >
        <Pressable
          onPress={fetchAnalysis}
          style={[styles.button, { backgroundColor: C.primary }]}
        >
          <Text style={[styles.buttonText, { color: C.primaryText }]}>
            {analysisLoading ? "분석중..." : "AI 분석"}
          </Text>
        </Pressable>
      </View>
    </Container>
  );
}

function createStyles(
  C: {
    background: string;
    card: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryText: string;
    danger: string;
  },
  scheme: "light" | "dark"
) {
  const isDark = scheme === "dark";

  return StyleSheet.create({
    bg: { flex: 1 },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 100,
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    topBar: { 
      paddingTop: 40,
      paddingHorizontal: 12,
      paddingBottom: 10,
      display: "flex",
      alignItems: "flex-end",
    },
    container: {
      paddingHorizontal: 12,
      paddingBottom: 10,
    },

    settingsBtn: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: C.primary,
      borderWidth: 1,
      borderColor: C.border,
    },
    settingsBtnText: { color: C.primaryText, fontWeight: "900" },

    title: {
      fontSize: 20,
      fontWeight: "900",
      marginBottom: 12,
      color: C.text,
    },

    formRow: { flexDirection: "row", gap: 12, alignItems: "flex-end" },
    field: { flex: 1 },

    label: {
      fontSize: 12,
      margin: 6,
      opacity: 0.9,
      color: isDark ? C.textMuted : C.textMuted,
      fontWeight: "600",
    },

    data: { color: C.text, fontWeight: "700" },

    input: {
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: C.text,
      fontWeight: "700",
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : C.card,
    },

    button: {
      height: 44,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.primary,
      borderWidth: 1,
      borderColor: C.border,
    },
    buttonDisabled: { opacity: 0.55 },
    buttonPressed: { opacity: 0.85 },
    buttonText: { color: C.primaryText, fontWeight: "900" },

    error: { color: C.danger, marginTop: 10, fontWeight: "700" },
    loading: { marginTop: 10 },

    summary: {
      marginTop: 10,
      gap: 4,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: isDark ? "rgba(0,0,0,0.35)" : C.card,
    },

    chart: {
      height: CHART_HEIGHT, // ✅ 고정 높이
      marginTop: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: C.card,
    },

    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    emptyText: { color: C.textMuted, fontWeight: "600" },
  });
}
