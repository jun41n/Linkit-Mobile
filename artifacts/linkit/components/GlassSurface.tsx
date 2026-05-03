import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle, useColorScheme } from "react-native";

interface Props {
  intensity?: number;
  tint?: "light" | "dark" | "systemUltraThinMaterialLight" | "systemThinMaterial";
  style?: ViewStyle | ViewStyle[];
  borderRadius?: number;
  children?: React.ReactNode;
  variant?: "card" | "pill" | "button";
}

export function GlassSurface({
  intensity = 60,
  tint,
  style,
  borderRadius = 18,
  children,
  variant = "card",
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const supportsBlur = Platform.OS === "ios" || Platform.OS === "android";
  const fallback = isDark ? "rgba(30,28,26,0.72)" : "rgba(255,255,255,0.72)";

  const blurTint =
    tint ?? (isDark ? "dark" : Platform.OS === "ios" ? "systemUltraThinMaterialLight" : "light");

  const innerHighlight = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)";
  const outerBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.65)";

  return (
    <View
      style={[
        {
          borderRadius,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: outerBorder,
        },
        variant === "pill" && { borderRadius: 999 },
        style,
      ]}
    >
      {supportsBlur ? (
        <BlurView
          intensity={intensity}
          tint={blurTint as any}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: fallback }]} />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.18)" }]} />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 1,
          backgroundColor: innerHighlight,
        }}
      />
      <View>{children}</View>
    </View>
  );
}
