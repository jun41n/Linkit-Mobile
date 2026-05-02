import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

  const filtered = useMemo(() => {
    if (!travelMode) return records;
    return records.filter((r) => r.type === "TRAVEL");
  }, [records, travelMode]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

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

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={52} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>기록이 없습니다</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            {travelMode ? "여행 모드에서 첫 기록을 남겨보세요" : "+ 버튼으로 첫 기록을 남겨보세요"}
          </Text>
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

      <FloatingAddButton onPress={() => setSheetOpen(true)} />
      <NewRecordSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
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
});
