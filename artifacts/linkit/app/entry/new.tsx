import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StickerCanvas } from "@/components/StickerCanvas";
import { StickerDrawer } from "@/components/StickerDrawer";
import { PlacedSticker, PlacedText, useDiaries } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

const BG_COLORS = [
  "#FFFEF8",
  "#FFF1D6",
  "#FFD3DA",
  "#E0D4F7",
  "#CFE6FB",
  "#BDEBD8",
  "#F2EADA",
  "#FFE9A8",
];

const TEXT_COLORS = ["#2A2520", "#F46A6A", "#5C7CFA", "#37B86F", "#E2A23B", "#9C5CD4"];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export default function NewEntryScreen() {
  const params = useLocalSearchParams<{ diaryId?: string; mode?: string }>();
  const colors = useColors();
  const router = useRouter();
  const { diaries, addEntry } = useDiaries();
  const { width } = useWindowDimensions();

  const isVideoMode = params.mode === "video";
  const initialDiaryId = params.diaryId || diaries[0]?.id || "";

  const [diaryId, setDiaryId] = useState(initialDiaryId);
  const [body, setBody] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [texts, setTexts] = useState<PlacedText[]>([]);
  const [activeTool, setActiveTool] = useState<"write" | "decorate" | "bg">("write");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState(TEXT_COLORS[0]);

  const canvasWidth = width - 32;
  const canvasHeight = isVideoMode ? canvasWidth * 1.6 : canvasWidth * 1.2;

  const selectedDiary = diaries.find((d) => d.id === diaryId);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const addSticker = (emoji: string, stickerId: string) => {
    setStickers((prev) => [
      ...prev,
      {
        id: uid(),
        stickerId,
        emoji,
        x: 35 + Math.random() * 20,
        y: 35 + Math.random() * 20,
        scale: 1,
        rotation: 0,
      },
    ]);
  };

  const updateSticker = (id: string, u: Partial<PlacedSticker>) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, ...u } : s)));
  };

  const removeSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const addText = () => {
    if (!textInput.trim()) return;
    setTexts((prev) => [
      ...prev,
      {
        id: uid(),
        text: textInput.trim(),
        x: 30,
        y: 30,
        color: textColor,
        fontSize: 22,
      },
    ]);
    setTextInput("");
  };

  const updateText = (id: string, u: Partial<PlacedText>) => {
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, ...u } : t)));
  };

  const removeText = (id: string) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
  };

  const save = async () => {
    if (!diaryId) {
      Alert.alert("다이어리를 먼저 선택해주세요");
      return;
    }
    await addEntry({
      diaryId,
      body,
      photoUri,
      bgColor,
      stickers,
      texts,
      isVideo: isVideoMode,
      videoUri: isVideoMode ? photoUri : undefined,
    });
    router.back();
  };

  const tools = useMemo(
    () => [
      { key: "write" as const, label: "글", icon: "create-outline" as const },
      { key: "decorate" as const, label: "다꾸", icon: "color-palette-outline" as const },
      { key: "bg" as const, label: "배경", icon: "color-fill-outline" as const },
    ],
    []
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.headerBtn, { borderColor: colors.border }]}>
          <Ionicons name="close" size={20} color={colors.foreground} />
        </Pressable>
        <View style={[styles.diaryChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="book-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.diaryChipText, { color: colors.foreground }]} numberOfLines={1}>
            {selectedDiary?.name ?? "다이어리 선택"}
          </Text>
        </View>
        <Pressable onPress={save} style={[styles.headerBtn, styles.saveBtn, { backgroundColor: colors.foreground }]}>
          <Text style={{ color: colors.background, fontFamily: "Gaegu_700Bold", fontSize: 14 }}>저장</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.canvasWrap}>
            <StickerCanvas
              width={canvasWidth}
              height={canvasHeight}
              bgColor={bgColor}
              photoUri={photoUri}
              stickers={stickers}
              texts={texts}
              onUpdateSticker={updateSticker}
              onRemoveSticker={removeSticker}
              onUpdateText={updateText}
              onRemoveText={removeText}
            />
          </View>

          <View style={styles.actionRow}>
            <Pressable onPress={isVideoMode ? pickVideo : pickPhoto} style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Ionicons name={isVideoMode ? "videocam" : "image"} size={18} color={colors.foreground} />
              <Text style={[styles.actionText, { color: colors.foreground }]}>
                {isVideoMode ? "영상" : "사진"}
              </Text>
            </Pressable>
            {photoUri && (
              <Pressable onPress={() => setPhotoUri(undefined)} style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                <Text style={[styles.actionText, { color: colors.destructive }]}>제거</Text>
              </Pressable>
            )}
            <View style={{ flex: 1 }} />
            {diaries.length > 1 && (
              <Pressable
                onPress={() => {
                  const idx = diaries.findIndex((d) => d.id === diaryId);
                  setDiaryId(diaries[(idx + 1) % diaries.length].id);
                }}
                style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <Ionicons name="swap-horizontal" size={18} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>다이어리 변경</Text>
              </Pressable>
            )}
          </View>

          {activeTool === "write" && (
            <View style={[styles.writeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                value={body}
                onChangeText={setBody}
                multiline
                placeholder="오늘의 하루를 기록해 보세요..."
                placeholderTextColor={colors.mutedForeground}
                style={[styles.writeInput, { color: colors.foreground }]}
              />
              <View style={[styles.dividerH, { backgroundColor: colors.border }]} />
              <View style={styles.textAddRow}>
                <TextInput
                  value={textInput}
                  onChangeText={setTextInput}
                  placeholder="페이지 위에 손글씨 텍스트 추가"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textAddInput, { color: textColor }]}
                />
                <Pressable onPress={addText} style={[styles.textAddBtn, { backgroundColor: colors.foreground }]}>
                  <Ionicons name="add" size={16} color={colors.background} />
                </Pressable>
              </View>
              <View style={styles.colorChipRow}>
                {TEXT_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setTextColor(c)}
                    style={[styles.colorChipSm, { backgroundColor: c, borderColor: textColor === c ? colors.foreground : "transparent" }]}
                  />
                ))}
              </View>
            </View>
          )}

          {activeTool === "bg" && (
            <View style={[styles.bgBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.boxLabel, { color: colors.foreground }]}>페이지 배경</Text>
              <View style={styles.colorRowLg}>
                {BG_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setBgColor(c)}
                    style={[styles.colorChipLg, { backgroundColor: c, borderColor: bgColor === c ? colors.foreground : colors.border }]}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 12 }} />
        </ScrollView>

        {activeTool === "decorate" && (
          <StickerDrawer onPick={addSticker} height={260} />
        )}

        <View style={[styles.toolbar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          {tools.map((t) => {
            const active = activeTool === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setActiveTool(t.key)}
                style={[styles.toolBtn, active && { backgroundColor: colors.secondary }]}
              >
                <Ionicons name={t.icon} size={20} color={active ? colors.primary : colors.foreground} />
                <Text style={[styles.toolLabel, { color: active ? colors.primary : colors.foreground }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: { borderWidth: 0, paddingHorizontal: 16, width: undefined },
  diaryChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
  },
  diaryChipText: { fontFamily: "Gaegu_700Bold", fontSize: 14, maxWidth: 200 },
  scrollContent: { padding: 16, gap: 12 },
  canvasWrap: { alignItems: "center" },
  actionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  actionText: { fontFamily: "Gaegu_700Bold", fontSize: 13 },
  writeBox: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 12 },
  writeInput: { minHeight: 80, fontFamily: "Gaegu_400Regular", fontSize: 16, lineHeight: 24, textAlignVertical: "top" },
  dividerH: { height: 1 },
  textAddRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  textAddInput: { flex: 1, fontFamily: "Gaegu_700Bold", fontSize: 18 },
  textAddBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  colorChipRow: { flexDirection: "row", gap: 8 },
  colorChipSm: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  bgBox: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  boxLabel: { fontFamily: "Gaegu_700Bold", fontSize: 15 },
  colorRowLg: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorChipLg: { width: 40, height: 40, borderRadius: 12, borderWidth: 2 },
  toolbar: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    borderTopWidth: 1,
  },
  toolBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    gap: 2,
  },
  toolLabel: { fontFamily: "Gaegu_700Bold", fontSize: 12 },
});
