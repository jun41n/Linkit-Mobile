import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FloatingAddButton } from "@/components/FloatingAddButton";
import { NewRecordSheet } from "@/components/NewRecordSheet";
import { TimelineCard } from "@/components/TimelineCard";
import { useRecords } from "@/context/RecordsContext";
import { useColors } from "@/hooks/useColors";

export default function DailyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { records } = useRecords();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const dailyRecords = records.filter((r) => r.type === "DAILY");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { paddingTop: topPad + 8 }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>일상</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 120 }]}>
        {dailyRecords.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>일상 기록이 없습니다</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>세로그 방식의 일상 기록을 여기서 확인합니다</Text>
          </View>
        ) : (
          dailyRecords.map((record) => <TimelineCard key={record.id} record={record} />)
        )}
      </ScrollView>

      <FloatingAddButton onPress={() => setSheetOpen(true)} />
      <NewRecordSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  empty: { alignItems: "center", gap: 12, paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
});
