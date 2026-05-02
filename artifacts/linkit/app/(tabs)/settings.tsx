import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRecords } from "@/context/RecordsContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { travelMode, setTravelMode } = useRecords();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { paddingTop: topPad + 8 }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>설정</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={styles.rowLeft}>
            <Ionicons name="airplane-outline" size={18} color={colors.primary} />
            <Text style={[styles.rowText, { color: colors.foreground }]}>트레블 모드</Text>
          </View>
          <Switch value={travelMode} onValueChange={setTravelMode} trackColor={{ false: colors.border, true: colors.travelActive + "60" }} thumbColor={travelMode ? colors.travelActive : colors.mutedForeground} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 16, borderWidth: 1 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
