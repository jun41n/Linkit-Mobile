import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDiaries } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

function formatFull(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const { entries, deleteEntry, getDiary } = useDiaries();

  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: true, title: "기록" }} />
        <View style={styles.center}>
          <Text style={{ color: colors.mutedForeground }}>기록을 찾을 수 없습니다</Text>
        </View>
      </SafeAreaView>
    );
  }
  const diary = getDiary(entry.diaryId);
  const canvasWidth = width - 32;
  const canvasHeight = entry.isVideo ? canvasWidth * 1.6 : canvasWidth * 1.2;

  const onDelete = () => {
    Alert.alert("삭제할까요?", "이 기록은 복구할 수 없어요.", [
      { text: "취소" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await deleteEntry(entry.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paperWhite }]} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{diary?.name ?? "기록"}</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{formatFull(entry.createdAt)}</Text>
        </View>
        <Pressable onPress={onDelete} style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="trash-outline" size={18} color={colors.destructive} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.canvas,
            {
              width: canvasWidth,
              height: canvasHeight,
              backgroundColor: entry.bgColor || colors.paperWhite,
              borderColor: colors.border,
            },
          ]}
        >
          {entry.photoUri && <Image source={{ uri: entry.photoUri }} style={[styles.photo, { width: canvasWidth, height: canvasHeight }]} />}
          {entry.stickers.map((s) => (
            <Text
              key={s.id}
              style={[
                styles.sticker,
                {
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  fontSize: 36 * s.scale,
                  transform: [{ rotate: `${s.rotation}deg` }],
                },
              ]}
            >
              {s.emoji}
            </Text>
          ))}
          {entry.texts.map((t) => (
            <Text
              key={t.id}
              style={[
                styles.placedText,
                {
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  color: t.color,
                  fontSize: t.fontSize,
                },
              ]}
            >
              {t.text}
            </Text>
          ))}
          {entry.isVideo && (
            <View style={[styles.playOverlay, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
              <Ionicons name="play-circle" size={64} color="white" />
            </View>
          )}
        </View>

        {entry.body ? (
          <View style={[styles.bodyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>{entry.body}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: "Gaegu_700Bold", fontSize: 16 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 11 },
  content: { padding: 16, gap: 14, alignItems: "center" },
  canvas: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  photo: { position: "absolute", top: 0, left: 0 },
  sticker: { position: "absolute" },
  placedText: { position: "absolute", fontFamily: "Gaegu_700Bold" },
  playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  bodyBox: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 16 },
  bodyText: { fontFamily: "Gaegu_400Regular", fontSize: 16, lineHeight: 24 },
});
