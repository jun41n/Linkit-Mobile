import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Platform, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRecords } from "@/context/RecordsContext";
import { useColors } from "@/hooks/useColors";

interface LinkItHeaderProps {
  showTravelToggle?: boolean;
}

export function LinkItHeader({ showTravelToggle = false }: LinkItHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { travelMode, setTravelMode } = useRecords();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad + 8, backgroundColor: colors.background }]}>
      <View style={styles.row}>
        <View style={styles.logoRow}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoGradient}
            >
              <Text style={styles.logoText}>LinkIt</Text>
            </LinearGradient>
            <Text style={[styles.logoSub, { color: colors.mutedForeground }]}>링킷</Text>
          </View>
        </View>

        {showTravelToggle && (
          <View style={styles.travelToggle}>
            <Ionicons
              name="airplane"
              size={16}
              color={travelMode ? colors.travelActive : colors.mutedForeground}
            />
            <Text style={[styles.travelLabel, { color: travelMode ? colors.travelActive : colors.mutedForeground }]}>
              여행
            </Text>
            <Switch
              value={travelMode}
              onValueChange={setTravelMode}
              trackColor={{ false: colors.border, true: colors.travelActive + "60" }}
              thumbColor={travelMode ? colors.travelActive : colors.mutedForeground}
              style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  logoGradient: {
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  logoText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    paddingHorizontal: 2,
  },
  logoSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  travelToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  travelLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
