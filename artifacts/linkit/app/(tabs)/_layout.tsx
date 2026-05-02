import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>일상</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="share">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>교환일기</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="travel">
        <Icon sf={{ default: "airplane", selected: "airplane" }} />
        <Label>여행</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stats">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>인사이트</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 72,
          paddingBottom: isWeb ? 34 : 10,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ),
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "일상",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "book.fill" : "book"} tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "book" : "book-outline"} size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: "교환일기",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "person.2.fill" : "person.2"} tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="travel"
        options={{
          title: "여행",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name="airplane" tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "airplane" : "airplane-outline"} size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "인사이트",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "chart.bar.fill" : "chart.bar"} tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={24} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
