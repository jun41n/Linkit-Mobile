import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { UnifiedRecord } from "@/context/RecordsContext";
import { useColors } from "@/hooks/useColors";
import { MOODS } from "./MoodPicker";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

interface TimelineCardProps {
  record: UnifiedRecord;
  onPress?: () => void;
  showDate?: boolean;
}

export function TimelineCard({ record, onPress, showDate }: TimelineCardProps) {
  const colors = useColors();
  const mood = MOODS.find((m) => m.key === record.moodTag);

  const isTravel = record.type === "TRAVEL";
  const dotColor = isTravel ? colors.travelActive : colors.primary;

  return (
    <View style={styles.wrapper}>
      <View style={styles.timelineCol}>
        <View style={[styles.dot, { backgroundColor: dotColor, borderColor: colors.card }]} />
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.95 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}
      >
        {isTravel && (
          <LinearGradient
            colors={["#10B98115", "#3B82F615"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.travelBadge}
          >
            <Ionicons name="airplane" size={11} color={colors.travelActive} />
            <Text style={[styles.travelLabel, { color: colors.travelActive }]}>여행</Text>
          </LinearGradient>
        )}

        <View style={styles.header}>
          {showDate && (
            <Text style={[styles.date, { color: colors.primary }]}>{formatDate(record.dateTime)}</Text>
          )}
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(record.dateTime)}</Text>
          {mood && (
            <View style={[styles.moodBadge, { backgroundColor: mood.color + "18" }]}>
              {mood.family === "MaterialCommunityIcons" ? (
                <MaterialCommunityIcons name={mood.icon as any} size={14} color={mood.color} />
              ) : (
                <Ionicons name={mood.icon as any} size={14} color={mood.color} />
              )}
            </View>
          )}
        </View>

        {record.content ? (
          <Text style={[styles.content, { color: colors.foreground }]} numberOfLines={3}>
            {record.content}
          </Text>
        ) : null}

        {record.photoUri ? (
          <Image source={{ uri: record.photoUri }} style={styles.photo} resizeMode="cover" />
        ) : null}

        <View style={styles.meta}>
          {record.location?.name ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
                {record.location.name}
              </Text>
            </View>
          ) : null}

          {record.expense ? (
            <View style={styles.metaItem}>
              <Ionicons name="wallet-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {record.expense.amount.toLocaleString()} {record.expense.currency}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  timelineCol: {
    width: 28,
    alignItems: "center",
    marginTop: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: 4,
  },
  card: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  travelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 8,
  },
  travelLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  moodBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    marginBottom: 8,
  },
  photo: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    maxWidth: 120,
  },
});
