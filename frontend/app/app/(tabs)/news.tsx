import React, { useState, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  Linking,
  Alert 
} from "react-native";
import { useTheme } from "../../provider/ThemeContext";
import { useMarket } from "../../provider/MarketContext";

interface NewsItem {
  title: string;
  summary: string;
  link: string;
  press: string;
  time: string;
  source: string;
  category: string;
  extracted_stocks: string[];
  keywords: string[];
}

interface RecommendationData {
  analysis_summary: {
    total_news_analyzed: number;
    analysis_time: string;
    market_trend: string;
    key_themes: string[];
  };
  sector_recommendations: Array<{
    sector: string;
    sector_trend: string;
    key_drivers: string[];
    recommendations: Array<{
      stock_code: string;
      stock_name: string;
      recommendation: string;
      reason: string;
      news_relevance: number;
      risk_level: string;
      target_price_range: [number, number];
      investment_period: string;
      key_factors: string[];
    }>;
  }>;
  overall_strategy: {
    portfolio_bias: string;
    key_risks: string[];
    monitoring_points: string[];
  };
}

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;

export default function NewsScreen() {
  const { theme, scheme } = useTheme();
  const { market } = useMarket();
  const C = theme.colors;
  const styles = useMemo(() => createStyles(C, scheme), [C, scheme]);

  const [activeTab, setActiveTab] = useState<'news' | 'recommendations'>('news');
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (activeTab === 'news') {
      fetchNews();
    } else if (activeTab === 'recommendations') {
      fetchRecommendations();
    }
  }, [activeTab, market]);

  // 초기 로드
  useEffect(() => {
    if (activeTab === 'news') {
      fetchNews();
    }
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/news?market=${market}`);
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      const data = await response.json();
      setNews(data.news || []);
    } catch (e: any) {
      setError(e?.message || "뉴스 로딩 실패");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market })
      });
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (e: any) {
      setError(e?.message || "추천 로딩 실패");
    } finally {
      setLoading(false);
    }
  };

  const openNewsLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("오류", "링크를 열 수 없습니다.");
    });
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "BUY": return "#145A14";
      case "SELL": return "#7A0B0B";
      default: return "#6A4B00";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return "#145A14";
      case "MEDIUM": return "#6A4B00";
      case "HIGH": return "#7A0B0B";
      default: return "#5A7863";
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: C.background }]}
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: C.text }]}>뉴스 & 추천</Text>
      </View>

      {/* Tab Selector */}
      <View style={[styles.tabContainer, { borderColor: C.border }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'news' && { 
              backgroundColor: C.primary,
              borderColor: C.primary 
            },
            { borderColor: C.border }
          ]}
          onPress={() => setActiveTab('news')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'news' ? C.primaryText : C.text }
          ]}>
            최신 뉴스
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'recommendations' && { 
              backgroundColor: C.primary,
              borderColor: C.primary 
            },
            { borderColor: C.border }
          ]}
          onPress={() => setActiveTab('recommendations')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'recommendations' ? C.primaryText : C.text }
          ]}>
            AI 추천
          </Text>
        </Pressable>
      </View>

      {/* Content Area */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[styles.loadingText, { color: C.textMuted }]}>
            {activeTab === 'news' ? '뉴스를' : '추천을'} 불러오는 중...
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: C.danger }]}>{error}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: C.primary }]}
            onPress={activeTab === 'news' ? fetchNews : fetchRecommendations}
          >
            <Text style={[styles.retryText, { color: C.primaryText }]}>다시 시도</Text>
          </Pressable>
        </View>
      )}

      {/* News Content */}
      {activeTab === 'news' && !loading && !error && (
        <View style={styles.content}>
          {news.map((item, index) => (
            <Pressable
              key={index}
              style={[styles.newsItem, { borderColor: C.border, backgroundColor: C.card }]}
              onPress={() => openNewsLink(item.link)}
            >
              <View style={styles.newsHeader}>
                <Text style={[styles.newsSource, { color: C.textMuted }]}>
                  {item.press}
                </Text>
                <Text style={[styles.newsTime, { color: C.textMuted }]}>
                  {item.time}
                </Text>
              </View>
              <Text style={[styles.newsTitle, { color: C.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.newsSummary, { color: C.textMuted }]}>
                {item.summary}
              </Text>
              {item.extracted_stocks.length > 0 && (
                <View style={styles.stocksContainer}>
                  <Text style={[styles.stocksLabel, { color: C.textMuted }]}>
                    관련 종목:
                  </Text>
                  <View style={styles.stocksList}>
                    {item.extracted_stocks.map((stock, stockIndex) => (
                      <Text
                        key={stockIndex}
                        style={[styles.stockBadge, { 
                          backgroundColor: C.primary, 
                          color: C.primaryText 
                        }]}
                      >
                        {stock}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Recommendations Content */}
      {activeTab === 'recommendations' && !loading && !error && recommendations && (
        <View style={styles.content}>
          {/* Market Summary */}
          <View style={[styles.summaryCard, { borderColor: C.border, backgroundColor: C.card }]}>
            <Text style={[styles.summaryTitle, { color: C.text }]}>시장 요약</Text>
            <Text style={[styles.summaryText, { color: C.text }]}>
              시장 동향: {recommendations.analysis_summary.market_trend}
            </Text>
            <Text style={[styles.summaryText, { color: C.text }]}>
              분석된 뉴스: {recommendations.analysis_summary.total_news_analyzed}건
            </Text>
            <View style={styles.themesContainer}>
              <Text style={[styles.themesLabel, { color: C.textMuted }]}>주요 테마:</Text>
              {recommendations.analysis_summary.key_themes.map((theme, index) => (
                <Text
                  key={index}
                  style={[styles.themeBadge, { 
                    backgroundColor: C.primary, 
                    color: C.primaryText 
                  }]}
                >
                  {theme}
                </Text>
              ))}
            </View>
          </View>

          {/* Sector Recommendations */}
          {recommendations.sector_recommendations.map((sector, sectorIndex) => (
            <View 
              key={sectorIndex}
              style={[styles.sectorCard, { borderColor: C.border, backgroundColor: C.card }]}
            >
              <View style={styles.sectorHeader}>
                <Text style={[styles.sectorTitle, { color: C.text }]}>
                  {sector.sector}
                </Text>
                <Text style={[
                  styles.sectorTrend,
                  { color: sector.sector_trend === 'POSITIVE' ? '#145A14' : 
                          sector.sector_trend === 'NEGATIVE' ? '#7A0B0B' : '#6A4B00' }
                ]}>
                  {sector.sector_trend}
                </Text>
              </View>

              {sector.key_drivers.map((driver, driverIndex) => (
                <Text key={driverIndex} style={[styles.driverText, { color: C.textMuted }]}>
                  • {driver}
                </Text>
              ))}

              {sector.recommendations.map((rec, recIndex) => (
                <View key={recIndex} style={styles.recommendationItem}>
                  <View style={styles.recHeader}>
                    <Text style={[styles.recStock, { color: C.text }]}>
                      {rec.stock_name} ({rec.stock_code})
                    </Text>
                    <Text style={[
                      styles.recRecommendation,
                      { color: getRecommendationColor(rec.recommendation) }
                    ]}>
                      {rec.recommendation}
                    </Text>
                  </View>
                  <Text style={[styles.recReason, { color: C.text }]}>
                    {rec.reason}
                  </Text>
                  <View style={styles.recDetails}>
                    <Text style={[styles.recDetail, { color: C.textMuted }]}>
                      위험도: <Text style={{ color: getRiskColor(rec.risk_level) }}>
                        {rec.risk_level}
                      </Text>
                    </Text>
                    <Text style={[styles.recDetail, { color: C.textMuted }]}>
                      목표가: {rec.target_price_range[0]} ~ {rec.target_price_range[1]}
                    </Text>
                    <Text style={[styles.recDetail, { color: C.textMuted }]}>
                      투자기간: {rec.investment_period}
                    </Text>
                  </View>
                  {rec.key_factors.length > 0 && (
                    <View style={styles.factorsContainer}>
                      <Text style={[styles.factorsLabel, { color: C.textMuted }]}>주요 요인:</Text>
                      {rec.key_factors.map((factor, factorIndex) => (
                        <Text key={factorIndex} style={[styles.factorText, { color: C.textMuted }]}>
                          • {factor}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}

          {/* Overall Strategy */}
          <View style={[styles.strategyCard, { borderColor: C.border, backgroundColor: C.card }]}>
            <Text style={[styles.strategyTitle, { color: C.text }]}>전략 요약</Text>
            <Text style={[styles.strategyText, { color: C.text }]}>
              포트폴리오 방향: {recommendations.overall_strategy.portfolio_bias}
            </Text>
            <Text style={[styles.riskLabel, { color: C.text }]}>주요 리스크:</Text>
            {recommendations.overall_strategy.key_risks.map((risk, index) => (
              <Text key={index} style={[styles.riskText, { color: C.textMuted }]}>
                • {risk}
              </Text>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (
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
) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
  },
  tabContainer: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  tabText: {
    fontWeight: "700",
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontWeight: "700",
  },
  // News Styles
  newsItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  newsSource: {
    fontSize: 12,
    fontWeight: "600",
  },
  newsTime: {
    fontSize: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  stocksContainer: {
    marginTop: 8,
  },
  stocksLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  stocksList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: "700",
  },
  // Recommendations Styles
  summaryCard: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 6,
  },
  themesContainer: {
    marginTop: 12,
  },
  themesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  themeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: "700",
    marginRight: 6,
    marginBottom: 4,
  },
  sectorCard: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectorTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  sectorTrend: {
    fontSize: 12,
    fontWeight: "700",
  },
  driverText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  recommendationItem: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: scheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
  },
  recHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recStock: {
    fontSize: 14,
    fontWeight: "700",
  },
  recRecommendation: {
    fontSize: 12,
    fontWeight: "900",
  },
  recReason: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  recDetails: {
    marginBottom: 8,
  },
  recDetail: {
    fontSize: 12,
    marginBottom: 2,
  },
  factorsContainer: {
    marginTop: 8,
  },
  factorsLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  factorText: {
    fontSize: 12,
    lineHeight: 16,
  },
  strategyCard: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
  },
  strategyText: {
    fontSize: 14,
    marginBottom: 12,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  riskText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
