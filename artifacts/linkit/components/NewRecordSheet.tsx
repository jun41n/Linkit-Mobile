import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRecords } from "@/context/RecordsContext";
import { useColors } from "@/hooks/useColors";
import { MoodPicker, MoodType } from "./MoodPicker";

interface NewRecordSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function NewRecordSheet({ visible, onClose }: NewRecordSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addRecord, travelMode } = useRecords();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCurrency, setExpenseCurrency] = useState("KRW");
  const [locationName, setLocationName] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [showExpense, setShowExpense] = useState(false);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      setContent("");
      setMood(undefined);
      setExpenseAmount("");
      setLocationName("");
      setPhotoUri(undefined);
      setShowExpense(travelMode);
    } else {
      setShowExpense(travelMode);
    }
  }, [visible, travelMode]);

  const pickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const getLocation = useCallback(async () => {
    setLocating(true);
    try {
      if (Platform.OS === "web") {
        navigator.geolocation.getCurrentPosition(
          () => setLocationName("현재 위치"),
          () => Alert.alert("위치 오류", "위치를 가져올 수 없습니다.")
        );
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("권한 필요", "위치 접근 권한이 필요합니다.");
          setLocating(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo[0]) {
          const name = [geo[0].district || geo[0].city, geo[0].country].filter(Boolean).join(", ");
          setLocationName(name || "현재 위치");
        } else {
          setLocationName("현재 위치");
        }
      }
    } catch {
      Alert.alert("오류", "위치를 가져올 수 없습니다.");
    }
    setLocating(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!content.trim() && !photoUri && !mood) {
      Alert.alert("입력 필요", "기록 내용을 입력해 주세요.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addRecord({
      dateTime: new Date().toISOString(),
      content: content.trim() || undefined,
      type: travelMode ? "TRAVEL" : "DAILY",
      isShared: false,
      moodTag: mood,
      expense:
        showExpense && expenseAmount
          ? { amount: parseFloat(expenseAmount) || 0, currency: expenseCurrency }
          : undefined,
      location: locationName ? { name: locationName } : undefined,
      photoUri,
    });
    setSaving(false);
    onClose();
  }, [content, photoUri, mood, travelMode, showExpense, expenseAmount, expenseCurrency, locationName, addRecord, onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 12 }]}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.mutedForeground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>새 기록</Text>
          <Pressable onPress={handleSave} disabled={saving}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>{saving ? "저장 중..." : "저장"}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>감정</Text>
          <View style={styles.moodWrapper}>
            <MoodPicker selected={mood} onSelect={setMood} />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>내용</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            placeholder="오늘 무슨 일이 있었나요?"
            placeholderTextColor={colors.mutedForeground}
            multiline
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          <View style={styles.row}>
            <Pressable
              onPress={pickPhoto}
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="image-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.foreground }]}>사진</Text>
            </Pressable>

            <Pressable
              onPress={getLocation}
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name={locating ? "hourglass-outline" : "location-outline"} size={20} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.foreground }]}>
                {locationName || (locating ? "위치 찾는 중..." : "위치")}
              </Text>
            </Pressable>
          </View>

          {photoUri && (
            <View style={styles.photoPreviewWrapper}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <Pressable onPress={() => setPhotoUri(undefined)} style={styles.removePhoto}>
                <Ionicons name="close-circle" size={22} color="#fff" />
              </Pressable>
            </View>
          )}

          <View style={styles.expenseToggleRow}>
            <View style={styles.expenseToggleLeft}>
              <Ionicons name="wallet-outline" size={18} color={colors.accent} />
              <Text style={[styles.expenseToggleLabel, { color: colors.foreground }]}>지출 기록</Text>
            </View>
            <Switch
              value={showExpense}
              onValueChange={setShowExpense}
              trackColor={{ false: colors.border, true: colors.accent + "80" }}
              thumbColor={showExpense ? colors.accent : colors.mutedForeground}
            />
          </View>

          {showExpense && (
            <View style={styles.expenseRow}>
              <TextInput
                style={[styles.expenseInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, flex: 1 }]}
                placeholder="금액"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
              />
              <Pressable
                onPress={() => setExpenseCurrency(expenseCurrency === "KRW" ? "USD" : expenseCurrency === "USD" ? "EUR" : "KRW")}
                style={[styles.currencyBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              >
                <Text style={[styles.currencyText, { color: colors.primary }]}>{expenseCurrency}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20, gap: 4 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 12,
  },
  moodWrapper: { marginBottom: 4 },
  textArea: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 120,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  photoPreviewWrapper: {
    marginHorizontal: 20,
    marginTop: 12,
    position: "relative",
  },
  photoPreview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
  },
  removePhoto: {
    position: "absolute",
    top: 8,
    right: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  expenseToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 20,
  },
  expenseToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expenseToggleLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  expenseRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  expenseInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  currencyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  currencyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
