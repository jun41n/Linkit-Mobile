import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOODS } from "@/components/MoodPicker";
import { useRecords } from "@/context/RecordsContext";
import { useColors } from "@/hooks/useColors";

function MoodBar({ moodKey, count, total }: { moodKey: string; count: number; total: number }) {
  const colors = useColors();
  const mood = MOODS.find((m) => m.key === moodKey);
  if (!mood) return null;
  const pct = total > 0 ? count / total : 0;

  return (
    <View style={styles.moodBarRow}>
      <View style={styles.moodBarLabel}>
        {mood.family === "MaterialCommunityIcons" ? (
          <MaterialCommunityIcons name={mood.icon as any} size={16} color={mood.color} />
        ) : (
          <Ionicons name={mood.icon as any} size={16} color={mood.color} />
        )}
        <Text style={[styles.moodBarText, { color: colors.foreground }]}>{mood.label}</Text>
      </View>
      <View style={[styles.moodBarTrack, { backgroundColor: colors.muted }]}>
        <View
          style={[styles.moodBarFill, { backgroundColor: mood.color, width: `${Math.round(pct * 100)}%` }]}
        />
      </View>
      <Text style={[styles.moodBarCount, { color: colors.mutedForeground }]}>{count}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { records } = useRecords();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const stats = useMemo(() => {
    const total = records.length;
    const travel = records.filter((r) => r.type === "TRAVEL").length;
    const daily = total - travel;
    const withPhoto = records.filter((r) => r.photoUri).length;
    const withMood = records.filter((r) => r.moodTag).length;

    const totalExpense = records.reduce((sum, r) => sum + (r.expense?.amount || 0), 0);
    const avgWords =
      records.filter((r) => r.content).length > 0
        ? Math.round(
            records.reduce((s, r) => s + (r.content?.split(/\s+/).length || 0), 0) /
              records.filter((r) => r.content).length
          )
        : 0;

    const moodCounts: { [k: string]: number } = {};
    for (const r of records) {
      if (r.moodTag) moodCounts[r.moodTag] = (moodCounts[r.moodTag] || 0) + 1;
    }
    const moodEntries = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const topMood = moodEntries[0];

    return { total, travel, daily, withPhoto, withMood, totalExpense, avgWords, moodCounts, moodEntries, topMood, withMoodCount: records.filter((r) => r.moodTag).length };
  }, [records]);

  const topMoodInfo = stats.topMood ? MOODS.find((m) => m.key === stats.topMood[0]) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>인사이트</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bigStatsRow}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bigStat}
          >
            <Text style={styles.bigStatValue}>{stats.total}</Text>
            <Text style={styles.bigStatLabel}>총 기록</Text>
          </LinearGradient>

          <View style={[styles.smallStats]}>
            <View style={[styles.smallStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="book-outline" size={18} color={colors.primary} />
              <Text style={[styles.smallStatValue, { color: colors.foreground }]}>{stats.daily}</Text>
              <Text style={[styles.smallStatLabel, { color: colors.mutedForeground }]}>일상</Text>
            </View>
            <View style={[styles.smallStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="airplane-outline" size={18} color={colors.travelActive} />
              <Text style={[styles.smallStatValue, { color: colors.foreground }]}>{stats.travel}</Text>
              <Text style={[styles.smallStatLabel, { color: colors.mutedForeground }]}>여행</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="images-outline" size={20} color={colors.accent} />
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{stats.withPhoto}</Text>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>사진 기록</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="wallet-outline" size={20} color={colors.travelActive} />
            <Text style={[styles.infoValue, { color: colors.foreground }]} numberOfLines={1}>
              {stats.totalExpense > 0 ? stats.totalExpense.toLocaleString() : "-"}
            </Text>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>총 지출</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="text-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{stats.avgWords}</Text>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>평균 단어</Text>
          </View>
        </View>

        {stats.moodEntries.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={18} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>감정 분포</Text>
              {topMoodInfo && (
                <View style={[styles.topMoodBadge, { backgroundColor: topMoodInfo.color + "20" }]}>
                  <Text style={[styles.topMoodText, { color: topMoodInfo.color }]}>최다: {topMoodInfo.label}</Text>
                </View>
              )}
            </View>
            <View style={styles.moodBars}>
              {stats.moodEntries.map(([key, count]) => (
                <MoodBar key={key} moodKey={key} count={count} total={stats.withMoodCount} />
              ))}
            </View>
          </View>
        )}

        {records.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>데이터가 없습니다</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              기록을 남기면 여기서 분석 결과를 볼 수 있습니다
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  bigStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  bigStat: {
    flex: 1.2,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bigStatValue: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  bigStatLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.8)",
  },
  smallStats: { flex: 1, gap: 12 },
  smallStat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    gap: 2,
  },
  smallStatValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  smallStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  cardRow: { flexDirection: "row", gap: 10 },
  infoCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  infoValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  infoLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  topMoodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  topMoodText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  moodBars: { gap: 10 },
  moodBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  moodBarLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 70,
  },
  moodBarText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  moodBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  moodBarFill: {
    height: "100%",
    borderRadius: 4,
    minWidth: 4,
  },
  moodBarCount: { fontSize: 12, fontFamily: "Inter_500Medium", width: 20, textAlign: "right" },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
});
