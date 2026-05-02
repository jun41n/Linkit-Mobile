import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DiaryBookCover } from "@/components/DiaryBookCover";
import { DiaryKind, useDiaries } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

const TABS: { key: DiaryKind; label: string }[] = [
  { key: "SHARED", label: "함께 쓰는" },
  { key: "FAVORITE", label: "즐겨 쓰는" },
  { key: "SOLO", label: "혼자 쓰는" },
];

export default function BookshelfScreen() {
  const colors = useColors();
  const router = useRouter();
  const { diaries, loading } = useDiaries();
  const [activeTab, setActiveTab] = useState<DiaryKind>("SOLO");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);

  const filtered = useMemo(() => {
    let list = diaries.filter((d) => d.kind === activeTab);
    if (search.trim()) {
      list = list.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  }, [diaries, activeTab, search]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.foreground }]}>june 님의</Text>
          <View style={styles.titleRow}>
            <View style={[styles.highlightWrap]}>
              <View style={[styles.highlight, { backgroundColor: colors.highlightYellow }]} />
              <Text style={[styles.bookshelfTitle, { color: colors.foreground }]}>책장</Text>
            </View>
            <Text style={[styles.smile, { color: colors.foreground }]}>:)</Text>
          </View>
        </View>
        <Pressable
          onPress={() => setEditing((v) => !v)}
          style={[styles.editBtn, { borderColor: colors.border, backgroundColor: editing ? colors.foreground : colors.card }]}
        >
          <Text style={{ color: editing ? colors.card : colors.foreground, fontFamily: "Gaegu_700Bold", fontSize: 14 }}>
            {editing ? "완료" : "편집"}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="다이어리 이름 검색"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={[
                styles.tab,
                { backgroundColor: active ? colors.card : colors.muted },
                active && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.shelfContent}
        style={{ backgroundColor: colors.paperWhite }}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              아직 다이어리가{"\n"}하나도 없어요  :O
            </Text>
          </View>
        ) : (
          <View style={styles.bookGrid}>
            {filtered.map((d) => (
              <View key={d.id} style={styles.bookSlot}>
                <DiaryBookCover diary={d} onPress={() => router.push(`/diary/${d.id}`)} />
                {editing && (
                  <Pressable
                    onPress={() => router.push(`/diary/${d.id}?edit=1`)}
                    style={[styles.editBadge, { backgroundColor: colors.foreground }]}
                  >
                    <Ionicons name="pencil" size={12} color={colors.card} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/diary/new")}
        style={[styles.fab, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Ionicons name="add" size={24} color={colors.foreground} />
      </Pressable>

      <Pressable
        onPress={() => router.push("/store")}
        style={[styles.storeFab, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="pricetag" size={16} color="white" />
        <Text style={styles.storeFabText}>스티커샵</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  greeting: { fontSize: 24, fontFamily: "Gaegu_700Bold" },
  titleRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 2 },
  highlightWrap: { position: "relative" },
  highlight: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 6,
    height: 14,
    borderRadius: 4,
    opacity: 0.85,
  },
  bookshelfTitle: { fontSize: 38, fontFamily: "Gaegu_700Bold", paddingHorizontal: 4 },
  smile: { fontSize: 26, fontFamily: "Gaegu_700Bold", marginLeft: 6, marginBottom: 6 },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  searchBar: {
    marginHorizontal: 22,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: { flex: 1, fontFamily: "Gaegu_400Regular", fontSize: 15 },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 22,
    marginTop: 14,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  tabActive: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  tabLabel: { fontFamily: "Gaegu_700Bold", fontSize: 15 },
  shelfContent: { padding: 22, paddingBottom: 140, minHeight: 400 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyText: {
    fontFamily: "Gaegu_400Regular",
    fontSize: 22,
    textAlign: "center",
    lineHeight: 36,
    opacity: 0.6,
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  bookSlot: { position: "relative" },
  editBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 22,
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  storeFab: {
    position: "absolute",
    bottom: 100,
    left: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  storeFabText: { color: "white", fontFamily: "Gaegu_700Bold", fontSize: 14 },
});
