import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export type MoodType =
  | "happy"
  | "love"
  | "excited"
  | "calm"
  | "thoughtful"
  | "tired"
  | "sad"
  | "angry";

export const MOODS: { key: MoodType; label: string; icon: string; family: string; color: string }[] = [
  { key: "happy", label: "행복", icon: "emoticon-happy-outline", family: "MaterialCommunityIcons", color: "#F59E0B" },
  { key: "love", label: "사랑", icon: "heart", family: "Ionicons", color: "#F472B6" },
  { key: "excited", label: "설렘", icon: "star", family: "Ionicons", color: "#8B5CF6" },
  { key: "calm", label: "평온", icon: "leaf-outline", family: "Ionicons", color: "#10B981" },
  { key: "thoughtful", label: "사색", icon: "brain", family: "MaterialCommunityIcons", color: "#6366F1" },
  { key: "tired", label: "피곤", icon: "moon-outline", family: "Ionicons", color: "#64748B" },
  { key: "sad", label: "슬픔", icon: "water-outline", family: "Ionicons", color: "#3B82F6" },
  { key: "angry", label: "화남", icon: "flame-outline", family: "Ionicons", color: "#EF4444" },
];

function MoodIcon({ family, icon, color, size }: { family: string; icon: string; color: string; size: number }) {
  if (family === "MaterialCommunityIcons") {
    return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  }
  if (family === "Ionicons") {
    return <Ionicons name={icon as any} size={size} color={color} />;
  }
  return <Feather name={icon as any} size={size} color={color} />;
}

interface MoodPickerProps {
  selected?: MoodType;
  onSelect: (mood: MoodType) => void;
}

export function MoodPicker({ selected, onSelect }: MoodPickerProps) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {MOODS.map((mood) => {
        const isSelected = selected === mood.key;
        return (
          <Pressable
            key={mood.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(mood.key);
            }}
            style={[
              styles.moodItem,
              {
                backgroundColor: isSelected ? mood.color + "20" : colors.muted,
                borderColor: isSelected ? mood.color : "transparent",
                borderWidth: 1.5,
              },
            ]}
          >
            <MoodIcon family={mood.family} icon={mood.icon} color={mood.color} size={22} />
            <Text style={[styles.label, { color: isSelected ? mood.color : colors.mutedForeground }]}>
              {mood.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  moodItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
    minWidth: 64,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
