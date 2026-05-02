import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewRecordSheet } from "@/components/NewRecordSheet";
import { TimelineCard } from "@/components/TimelineCard";
import { UnifiedRecord, useRecords } from "@/context/RecordsContext";
import { useColors } from "@/hooks/useColors";

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon as any} size={22} color={color} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function TravelScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { records, travelMode, setTravelMode } = useRecords();
  const [sheetOpen, setSheetOpen] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const travelRecords = useMemo(() => records.filter((r) => r.type === "TRAVEL"), [records]);

  const totalExpense = useMemo(() => {
    return travelRecords.reduce((sum, r) => sum + (r.expense?.amount || 0), 0);
  }, [travelRecords]);

  const locationSet = useMemo(() => {
    const names = travelRecords.map((r) => r.location?.name).filter(Boolean);
    return [...new Set(names)];
  }, [travelRecords]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>여행 모드</Text>
        <View style={styles.toggleRow}>
          <Ionicons name="airplane" size={16} color={travelMode ? colors.travelActive : colors.mutedForeground} />
          <Switch
            value={travelMode}
            onValueChange={(v) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTravelMode(v);
            }}
            trackColor={{ false: colors.border, true: colors.travelActive + "60" }}
            thumbColor={travelMode ? colors.travelActive : colors.mutedForeground}
          />
        </View>
      </View>

      {travelMode && (
        <LinearGradient
          colors={[colors.travelActive + "20", colors.primary + "10"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.activeBanner}
        >
          <Ionicons name="radio-button-on" size={12} color={colors.travelActive} />
          <Text style={[styles.activeBannerText, { color: colors.travelActive }]}>여행 모드 활성화 — 새 기록이 자동으로 여행 기록으로 저장됩니다</Text>
        </LinearGradient>
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatCard icon="location-outline" label="방문 지역" value={`${locationSet.length}곳`} color={colors.primary} />
          <StatCard icon="camera-outline" label="사진 기록" value={`${travelRecords.filter(r => r.photoUri).length}장`} color={colors.accent} />
          <StatCard icon="wallet-outline" label="총 지출" value={totalExpense > 0 ? `${totalExpense.toLocaleString()}` : "-"} color={colors.travelActive} />
        </View>

        {locationSet.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>방문 지역</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.locationChips}>
              {locationSet.map((name, i) => (
                <View key={i} style={[styles.locationChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="location" size={12} color={colors.primary} />
                  <Text style={[styles.locationChipText, { color: colors.foreground }]}>{name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {travelRecords.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>여행 기록</Text>
            {travelRecords.map((r) => (
              <TimelineCard key={r.id} record={r} />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="airplane-outline" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>여행 기록이 없습니다</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              여행 모드를 켜고 첫 여행 기록을 남겨보세요
            </Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSheetOpen(true);
        }}
        style={[styles.fab, { bottom: bottomPad + 100 }]}
      >
        <LinearGradient
          colors={[colors.travelActive, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </Pressable>

      <NewRecordSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  activeBannerText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  scrollContent: { paddingTop: 8 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  locationChips: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: "row",
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  locationChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
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
  fab: {
    position: "absolute",
    right: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
});
