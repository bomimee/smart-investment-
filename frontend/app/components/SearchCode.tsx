import { useTheme } from "@/provider/ThemeContext";
import { useMarket } from "@/provider/MarketContext";
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  ImageBackground,
  FlatList,
  Pressable,
} from "react-native";

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;

type Item = {
  code: string; // "005930" or "AAPL"
  name: string; // "삼성전자" or "Apple Inc."
};

export default function SearchCode({
  handleSearch,
  handleCode,
}: {
  handleSearch: (v: boolean) => void;
  handleCode: (code: string, name?: string) => void;
}) {
  const { theme, scheme } = useTheme();
  const { market } = useMarket();
  const C = theme.colors;

  const [searchWords, setSearchWords] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const Container: any = scheme === "dark" ? ImageBackground : View;
  const containerProps =
    scheme === "dark"
      ? { source: theme.backgroundImage, resizeMode: "cover" as const }
      : {};

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const url = market === "US" ? `${API_BASE}/api/list?market=US` : `${API_BASE}/api/list`;
        const res = await fetch(url);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`서버 오류 (${res.status}): ${text}`);
        }

        const json = await res.json();

        // ✅ 단축코드/한글명 -> code/name 으로 정규화
        const normalized: Item[] = (Array.isArray(json) ? json : [])
          .map((x: any) => ({
            code: String(x?.code ?? ""),
            name: String(x?.name ?? ""),
          }))
          .filter((x) => x.code.length > 0 || x.name.length > 0);

        if (!cancelled) setItems(normalized);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "알 수 없는 오류");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 2) 입력값이 바뀔 때마다 로컬에서 필터링 (리렌더만으로 자동 갱신됨)
  const filtered = useMemo(() => {
    const q = searchWords.trim();
    if (!q) return [];

    // code로 검색(숫자 6자리) + name으로도 검색하고 싶으면 둘 다 처리
    return items
      .filter((it) => it.code.includes(q) || it.name.includes(q))
      .slice(0, 50); // 너무 많으면 잘라서 보여주기(성능)
  }, [items, searchWords]);

  return (
    <Container {...containerProps} style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: C.text, marginBottom: 8 }}>
          종목코드({market === 'KOREA' ? '6자리' : '영문'})
        </Text>
        <TextInput
          value={searchWords}
          onChangeText={setSearchWords}
          placeholder="종목이름 또는 코드"
          placeholderTextColor={C.textMuted}
          maxLength={market === 'KOREA' ? 6 : 5}
          style={{
            borderWidth: 1,
            borderColor: C.border,
            padding: 12,
            borderRadius: 10,
            color: C.text,
          }}
          autoCapitalize="characters"
        />

        {loading && (
          <View style={{ marginTop: 12 }}>
            <ActivityIndicator />
          </View>
        )}

        {error && <Text style={{ marginTop: 12, color: "red" }}>{error}</Text>}

        <FlatList
          style={{ marginTop: 12 }}
          data={filtered}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                handleSearch(false);
                handleCode(item.code, item.name);
              }}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
              }}
            >
              <Text style={{ color: C.text, fontWeight: "600" }}>
                {item.name}
              </Text>
              <Text style={{ color: C.textMuted }}>{item.code}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            searchWords.trim() ? (
              <Text style={{ color: C.textMuted, marginTop: 8 }}>
                검색 결과 없음
              </Text>
            ) : null
          }
        />
      </View>
    </Container>
  );
}
