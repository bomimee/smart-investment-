import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

type Analysis = {
  code?: string;
  timeframe_assumption?: string;
  verdict: "BUY" | "SELL" | "HOLD";
  confidence: number;
  market_state?: { trend?: string; volatility?: string; volume_comment?: string };
  key_levels?: { support?: number[]; resistance?: number[] };
  signal_review?: {
    recent_signals?: { time: string; type: "BUY" | "SELL"; price: number }[];
    comment?: string;
  };
  trade_plan?: {
    entry?: { type?: string; price_range?: [number, number] };
    stop_loss?: { price?: number; reason?: string };
    take_profit?: { price?: number; reason?: string }[];
    position_sizing_note?: string;
  };
  bull_case?: string[];
  bear_case?: string[];
  notes?: string[];
  error?: string;
  raw_error?: string;
};

const badgeColors = (v: "BUY" | "SELL" | "HOLD") => {
  if (v === "BUY") return { bg: "#D7F5D7", fg: "#145A14" };
  if (v === "SELL") return { bg: "#FFD6D6", fg: "#7A0B0B" };
  return { bg: "#FFF2C6", fg: "#6A4B00" };
};

export default function AnalysisScreen() {
  const params = useLocalSearchParams<{ payload?: string }>();

  const analysis: Analysis | null = useMemo(() => {
    try {
      if (!params.payload) return null;
      return JSON.parse(params.payload);
    } catch {
      return null;
    }
  }, [params.payload]);

  if (!analysis) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>AI 분석</Text>
        <Text style={styles.subtle}>분석 데이터가 없거나 파싱에 실패했어.</Text>
      </View>
    );
  }

  const badge = badgeColors(analysis.verdict);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>AI 분석</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.fg }]}>
              {analysis.verdict}
            </Text>
          </View>
        </View>

        <Text style={styles.subtle}>
          신뢰도: {(analysis.confidence * 100).toFixed(0)}% · 타임프레임:{" "}
          {analysis.timeframe_assumption ?? "D"}
        </Text>

        {"error" in analysis && analysis.error ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>오류</Text>
            <Text style={styles.item}>{analysis.error}</Text>
            {!!analysis.raw_error && <Text style={styles.subtle}>{analysis.raw_error}</Text>}
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>시장 상태</Text>
              <Text style={styles.item}>
                추세: <Text style={styles.bold}>{analysis.market_state?.trend ?? "-"}</Text>{"  "}
                변동성: <Text style={styles.bold}>{analysis.market_state?.volatility ?? "-"}</Text>
              </Text>
              {!!analysis.market_state?.volume_comment && (
                <Text style={styles.item}>거래량: {analysis.market_state.volume_comment}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>주요 가격대</Text>
              <Text style={styles.item}>
                지지:{" "}
                <Text style={styles.bold}>
                  {analysis.key_levels?.support?.length
                    ? analysis.key_levels.support.join(", ")
                    : "-"}
                </Text>
              </Text>
              <Text style={styles.item}>
                저항:{" "}
                <Text style={styles.bold}>
                  {analysis.key_levels?.resistance?.length
                    ? analysis.key_levels.resistance.join(", ")
                    : "-"}
                </Text>
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>트레이드 플랜</Text>
              {!!analysis.trade_plan?.entry && (
                <Text style={styles.item}>
                  진입({analysis.trade_plan.entry.type ?? "MARKET"}):{" "}
                  <Text style={styles.bold}>
                    {analysis.trade_plan.entry.price_range?.[0]} ~{" "}
                    {analysis.trade_plan.entry.price_range?.[1]}
                  </Text>
                </Text>
              )}
              {!!analysis.trade_plan?.stop_loss && (
                <Text style={styles.item}>
                  손절: <Text style={styles.bold}>{analysis.trade_plan.stop_loss.price}</Text>{" "}
                  ({analysis.trade_plan.stop_loss.reason})
                </Text>
              )}
              {!!analysis.trade_plan?.take_profit?.length && (
                <Text style={styles.item}>
                  익절:{" "}
                  <Text style={styles.bold}>
                    {analysis.trade_plan.take_profit.map((t) => t.price).join(", ")}
                  </Text>
                </Text>
              )}
              {!!analysis.trade_plan?.position_sizing_note && (
                <Text style={styles.item}>포지션: {analysis.trade_plan.position_sizing_note}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>최근 시그널</Text>
              {!!analysis.signal_review?.recent_signals?.length ? (
                <View style={{ gap: 6 }}>
                  {analysis.signal_review.recent_signals.map((s, i) => (
                    <View key={`${s.time}-${i}`} style={styles.signalRow}>
                      <Text style={styles.signalTime}>{s.time}</Text>
                      <Text style={[styles.signalType, s.type === "BUY" ? styles.buy : styles.sell]}>
                        {s.type}
                      </Text>
                      <Text style={styles.signalPrice}>{s.price}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.item}>-</Text>
              )}
              {!!analysis.signal_review?.comment && (
                <Text style={[styles.item, { marginTop: 8 }]}>{analysis.signal_review.comment}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>시나리오</Text>

              {!!analysis.bull_case?.length && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.bullTitle}>Bull Case</Text>
                  <Text style={styles.bullets}>• {analysis.bull_case.join("\n• ")}</Text>
                </View>
              )}

              {!!analysis.bear_case?.length && (
                <View>
                  <Text style={styles.bearTitle}>Bear Case</Text>
                  <Text style={styles.bullets}>• {analysis.bear_case.join("\n• ")}</Text>
                </View>
              )}
            </View>

            {!!analysis.notes?.length && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>메모</Text>
                <Text style={styles.bullets}>• {analysis.notes.join("\n• ")}</Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    marginTop: 30,
    backgroundColor: "#DBE4C9",
    flexGrow: 1,
  },
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#90AB8B",
    borderRadius: 14,
    backgroundColor: "#FFFFF0",
    gap: 10,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "900", color: "#3B4953" },
  subtle: { fontSize: 12, color: "#5A7863" },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontWeight: "900" },

  section: { marginTop: 6, gap: 4 },
  sectionTitle: { fontWeight: "900", color: "#5A7863", marginBottom: 2 },
  item: { color: "#3B4953", lineHeight: 18 },
  bold: { fontWeight: "900" },

  signalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#F3F7EE",
  },
  signalTime: { fontSize: 12, color: "#5A7863", width: 92 },
  signalType: { fontWeight: "900", width: 52, textAlign: "center" },
  signalPrice: { fontWeight: "700", color: "#3B4953" },
  buy: { color: "#145A14" },
  sell: { color: "#7A0B0B" },

  bullTitle: { fontWeight: "900", color: "#145A14" },
  bearTitle: { fontWeight: "900", color: "#7A0B0B" },
  bullets: { color: "#3B4953", lineHeight: 18 },
});
