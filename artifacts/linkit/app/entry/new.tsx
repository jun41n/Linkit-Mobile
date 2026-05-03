import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image as RNImage } from "react-native";
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
import { DIARY_FONTS, DEFAULT_DIARY_FONT, getFontFamily } from "@/constants/fonts";
import {
  PhotoFrame,
  PlacedPhoto,
  PlacedSticker,
  PlacedText,
  useDiaries,
} from "@/context/DiariesContext";
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

const FRAMES: { key: PhotoFrame; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "polaroid", label: "폴라로이드", icon: "image-outline" },
  { key: "sticker", label: "스티커컷", icon: "scan-outline" },
  { key: "rounded", label: "둥근", icon: "square-outline" },
  { key: "circle", label: "원형", icon: "ellipse-outline" },
  { key: "tape", label: "테이프", icon: "ribbon-outline" },
  { key: "none", label: "원본", icon: "crop-outline" },
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getImageAspect(uri: string): Promise<number> {
  return new Promise((resolve) => {
    RNImage.getSize(
      uri,
      (w, h) => resolve(h / w || 1),
      () => resolve(1)
    );
  });
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
  const [legacyVideoUri, setLegacyVideoUri] = useState<string | undefined>();
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [photos, setPhotos] = useState<PlacedPhoto[]>([]);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [texts, setTexts] = useState<PlacedText[]>([]);
  const [activeTool, setActiveTool] = useState<"write" | "photo" | "decorate" | "bg">("write");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
  const [bodyFontId, setBodyFontId] = useState<string>("noto_sans");
  const [stickerFontId, setStickerFontId] = useState<string>(DEFAULT_DIARY_FONT.id);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const canvasWidth = width - 32;
  const canvasHeight = isVideoMode ? canvasWidth * 1.6 : canvasWidth * 1.2;

  const selectedDiary = diaries.find((d) => d.id === diaryId);
  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId) ?? null;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: 4,
    });
    if (result.canceled) return;
    for (const asset of result.assets ?? []) {
      const aspect = await getImageAspect(asset.uri);
      const newPhoto: PlacedPhoto = {
        id: uid(),
        uri: asset.uri,
        x: 35 + Math.random() * 30,
        y: 30 + Math.random() * 35,
        widthPct: 42,
        aspectRatio: aspect,
        scale: 1,
        rotation: -8 + Math.random() * 16,
        frame: "polaroid",
      };
      setPhotos((prev) => [...prev, newPhoto]);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLegacyVideoUri(result.assets[0].uri);
    }
  };

  const updatePhoto = (id: string, u: Partial<PlacedPhoto>) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...u } : p)));
  };
  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhotoId === id) setSelectedPhotoId(null);
  };
  const setPhotoFrame = (id: string, frame: PhotoFrame) => updatePhoto(id, { frame });

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
        fontId: stickerFontId,
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
      bgColor,
      photos,
      stickers,
      texts,
      isVideo: isVideoMode,
      videoUri: isVideoMode ? legacyVideoUri : undefined,
      photoUri: undefined,
    });
    router.back();
  };

  const tools = useMemo(
    () => [
      { key: "write" as const, label: "글", icon: "create-outline" as const },
      { key: "photo" as const, label: "사진", icon: "image-outline" as const },
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
          <Text style={{ color: colors.background, fontFamily: "NotoSansKR_700Bold", fontSize: 14 }}>저장</Text>
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
              photos={photos}
              stickers={stickers}
              texts={texts}
              onUpdatePhoto={updatePhoto}
              onRemovePhoto={removePhoto}
              onUpdateSticker={updateSticker}
              onRemoveSticker={removeSticker}
              onUpdateText={updateText}
              onRemoveText={removeText}
              onSelectPhoto={setSelectedPhotoId}
              selectedPhotoId={selectedPhotoId}
            />
          </View>

          {selectedPhoto && (
            <View style={[styles.frameBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.frameBarTitle, { color: colors.mutedForeground }]}>사진 프레임</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.frameRow}>
                {FRAMES.map((f) => {
                  const active = selectedPhoto.frame === f.key;
                  return (
                    <Pressable
                      key={f.key}
                      onPress={() => setPhotoFrame(selectedPhoto.id, f.key)}
                      style={[
                        styles.frameChip,
                        {
                          backgroundColor: active ? colors.foreground : colors.muted,
                          borderColor: active ? colors.foreground : colors.border,
                        },
                      ]}
                    >
                      <Ionicons name={f.icon} size={14} color={active ? colors.background : colors.foreground} />
                      <Text
                        style={{
                          fontFamily: "NotoSansKR_500Medium",
                          color: active ? colors.background : colors.foreground,
                          fontSize: 12,
                        }}
                      >
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={[styles.frameHint, { color: colors.mutedForeground }]}>
                두 손가락으로 크기·회전 · 한 손가락으로 이동
              </Text>
            </View>
          )}

          {activeTool === "photo" && (
            <View style={[styles.writeBox, { backgroundColor: colors.card, borderColor: colors.border, gap: 12 }]}>
              <View style={styles.fontSectionRow}>
                <Ionicons name="images-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.fontSectionLabel, { color: colors.mutedForeground }]}>사진 ({photos.length}/10)</Text>
              </View>
              <View style={styles.actionRow}>
                <Pressable onPress={pickPhoto} style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                  <Ionicons name="add" size={16} color={colors.foreground} />
                  <Text style={[styles.actionText, { color: colors.foreground }]}>사진 추가</Text>
                </Pressable>
                {isVideoMode && (
                  <Pressable onPress={pickVideo} style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                    <Ionicons name="videocam" size={16} color={colors.foreground} />
                    <Text style={[styles.actionText, { color: colors.foreground }]}>영상</Text>
                  </Pressable>
                )}
              </View>
              <Text style={[styles.frameHint, { color: colors.mutedForeground }]}>
                사진을 누르면 프레임을 바꿀 수 있어요. 폴라로이드/스티커컷/원형 등 진짜 다꾸 느낌으로 꾸며보세요.
              </Text>
            </View>
          )}

          {activeTool === "write" && (
            <View style={[styles.writeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.fontSectionRow}>
                <Ionicons name="text" size={14} color={colors.mutedForeground} />
                <Text style={[styles.fontSectionLabel, { color: colors.mutedForeground }]}>일기 본문 폰트</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontChipRow}>
                {DIARY_FONTS.map((f) => {
                  const active = bodyFontId === f.id;
                  return (
                    <Pressable
                      key={f.id}
                      onPress={() => setBodyFontId(f.id)}
                      style={[
                        styles.fontChip,
                        {
                          backgroundColor: active ? colors.foreground : colors.muted,
                          borderColor: active ? colors.foreground : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: f.family,
                          color: active ? colors.background : colors.foreground,
                          fontSize: 16,
                        }}
                      >
                        {f.preview}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "NotoSansKR_500Medium",
                          color: active ? colors.background : colors.mutedForeground,
                          fontSize: 10,
                          marginTop: 2,
                        }}
                      >
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <TextInput
                value={body}
                onChangeText={setBody}
                multiline
                placeholder="오늘의 하루를 기록해 보세요..."
                placeholderTextColor={colors.mutedForeground}
                style={[styles.writeInput, { color: colors.foreground, fontFamily: getFontFamily(bodyFontId) }]}
              />
              <View style={[styles.dividerH, { backgroundColor: colors.border }]} />
              <View style={styles.fontSectionRow}>
                <Ionicons name="brush" size={14} color={colors.mutedForeground} />
                <Text style={[styles.fontSectionLabel, { color: colors.mutedForeground }]}>다꾸 손글씨 폰트</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontChipRow}>
                {DIARY_FONTS.map((f) => {
                  const active = stickerFontId === f.id;
                  return (
                    <Pressable
                      key={f.id}
                      onPress={() => setStickerFontId(f.id)}
                      style={[
                        styles.fontChip,
                        {
                          backgroundColor: active ? colors.foreground : colors.muted,
                          borderColor: active ? colors.foreground : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: f.family,
                          color: active ? colors.background : colors.foreground,
                          fontSize: 16,
                        }}
                      >
                        {f.preview}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={styles.textAddRow}>
                <TextInput
                  value={textInput}
                  onChangeText={setTextInput}
                  placeholder="페이지 위에 손글씨 텍스트 추가"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textAddInput, { color: textColor, fontFamily: getFontFamily(stickerFontId) }]}
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

          {diaries.length > 1 && (
            <Pressable
              onPress={() => {
                const idx = diaries.findIndex((d) => d.id === diaryId);
                setDiaryId(diaries[(idx + 1) % diaries.length].id);
              }}
              style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card, alignSelf: "flex-start" }]}
            >
              <Ionicons name="swap-horizontal" size={18} color={colors.foreground} />
              <Text style={[styles.actionText, { color: colors.foreground }]}>다이어리 변경</Text>
            </Pressable>
          )}

          <View style={{ height: 12 }} />
        </ScrollView>

        {activeTool === "decorate" && (
          <StickerDrawer onPick={addSticker} height={300} />
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
  diaryChipText: { fontFamily: "NotoSansKR_700Bold", fontSize: 14, maxWidth: 200 },
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
  actionText: { fontFamily: "NotoSansKR_500Medium", fontSize: 13 },
  frameBar: { borderRadius: 16, borderWidth: 1, padding: 12, gap: 8 },
  frameBarTitle: { fontFamily: "NotoSansKR_500Medium", fontSize: 11, letterSpacing: 0.3 },
  frameRow: { gap: 8, paddingVertical: 4 },
  frameChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  frameHint: { fontFamily: "NotoSansKR_400Regular", fontSize: 11 },
  writeBox: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  writeInput: { minHeight: 90, fontSize: 16, lineHeight: 24, textAlignVertical: "top" },
  dividerH: { height: 1, marginVertical: 4 },
  fontSectionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  fontSectionLabel: { fontFamily: "NotoSansKR_500Medium", fontSize: 11, letterSpacing: 0.3 },
  fontChipRow: { gap: 8, paddingVertical: 4, paddingRight: 4 },
  fontChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 84,
    alignItems: "center",
  },
  textAddRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  textAddInput: { flex: 1, fontSize: 18 },
  textAddBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  colorChipRow: { flexDirection: "row", gap: 8 },
  colorChipSm: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  bgBox: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  boxLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 15 },
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
  toolLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 12 },
});
