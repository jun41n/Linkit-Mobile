import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";

import { FloatingAddButton } from "@/components/FloatingAddButton";
import { LinkItHeader } from "@/components/LinkItHeader";
import { NewRecordSheet } from "@/components/NewRecordSheet";
import { TimelineCard } from "@/components/TimelineCard";
import { UnifiedRecord, useRecords } from "@/context/RecordsContext";
import { useColors } from "@/hooks/useColors";

function groupByDate(records: UnifiedRecord[]) {
  const groups: { [date: string]: UnifiedRecord[] } = {};
  for (const r of records) {
    const d = new Date(r.dateTime);
    const key = d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

export default function TimelineScreen() {
  const colors = useColors();
  const { records, loading, travelMode } = useRecords();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => records.filter((r) => r.type !== "TRAVEL"), [records]);
  const sections = useMemo(() => groupByDate(filtered), [filtered]);
  const shareCount = records.filter((r) => r.type === "SHARE").length;
  const dailyCount = records.filter((r) => r.type === "DAILY").length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}> 
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <LinkItHeader showTravelToggle />

      <View style={styles.hero}>
        <View style={[styles.heroBadge, { backgroundColor: colors.secondary }]}> 
          <Ionicons name="book-outline" size={14} color={colors.primary} />
          <Text style={[styles.heroBadgeText, { color: colors.primary }]}>메인 기능: 일상 기록 + 교환일기</Text>
        </View>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>세로그 기능이 중심입니다</Text>
        <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>일상 기록을 기본으로, Tuda의 교환일기 흐름을 함께 제공합니다. 여행로그는 마지막에 들어가는 서브 기능입니다.</Text>
        <View style={styles.heroStats}>
          <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{dailyCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>일상</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{shareCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>교환일기</Text>
          </View>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={52} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>기록이 없습니다</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>+ 버튼으로 일상 기록이나 교환일기를 시작하세요</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
              <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
            </View>
          )}
          renderItem={({ item }) => <TimelineCard record={item} />}
          contentContainerStyle={styles.listContent}
        />
      )}

      {travelMode && (
        <View style={[styles.travelNotice, { backgroundColor: colors.travelBackground, borderColor: colors.travelActive }]}>
          <Ionicons name="airplane-outline" size={16} color={colors.travelActive} />
          <Text style={[styles.travelNoticeText, { color: colors.travelActive }]}>여행 모드가 켜져 있어 새 기록은 여행 로그로도 저장됩니다</Text>
        </View>
      )}

      <FloatingAddButton onPress={() => setSheetOpen(true)} />
      <NewRecordSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 10,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    lineHeight: 34,
  },
  heroDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  statPill: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  listContent: { paddingBottom: 120 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  sectionLine: { flex: 1, height: 1 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  travelNotice: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  travelNoticeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
});
