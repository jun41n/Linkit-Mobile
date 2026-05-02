import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewRecordSheet } from "@/components/NewRecordSheet";
import { TimelineCard } from "@/components/TimelineCard";
import { useRecords } from "@/context/RecordsContext";
import { useColors } from "@/hooks/useColors";

export default function ShareScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { records } = useRecords();
  const [sheetOpen, setSheetOpen] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const shareRecords = useMemo(() => records.filter((r) => r.type === "SHARE"), [records]);
  const dailyRecords = useMemo(() => records.filter((r) => r.type === "DAILY"), [records]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof records>();
    for (const record of shareRecords) {
      const key = new Date(record.dateTime).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(record);
    }
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [shareRecords]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { paddingTop: topPad + 8 }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>교환일기</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSheetOpen(true);
          }}
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newBtnText}>새 교환일기</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 110 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.heroBadge, { backgroundColor: colors.secondary }]}> 
            <Ionicons name="people-outline" size={14} color={colors.primary} />
            <Text style={[styles.heroBadgeText, { color: colors.primary }]}>Tuda의 교환일기 흐름</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>서로의 하루를 주고받는 공간</Text>
          <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>감정, 사진, 짧은 답장으로 연결되는 교환일기 경험을 중심에 둡니다.</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{shareRecords.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>교환일기</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{dailyRecords.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>연결된 일상</Text>
            </View>
          </View>
        </View>

        {shareRecords.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>교환일기가 없습니다</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>새 교환일기를 작성해서 상대와 하루를 주고받아보세요</Text>
          </View>
        ) : (
          grouped.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
              {section.data.map((item) => (
                <TimelineCard key={item.id} record={item} />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <NewRecordSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  newBtnText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  hero: { gap: 10, marginBottom: 20 },
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
  statsRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 60,
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
