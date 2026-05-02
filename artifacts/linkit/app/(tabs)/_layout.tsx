import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>다이어리</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="video">
        <Icon sf={{ default: "video", selected: "video.fill" }} />
        <Label>영상로그</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="daily">
        <Icon sf={{ default: "book.pages", selected: "book.pages.fill" }} />
        <Label>일상</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="travel">
        <Icon sf={{ default: "airplane", selected: "airplane" }} />
        <Label>트레블</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <Label>설정</Label>
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
          title: "다이어리",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "book.fill" : "book"} tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "book" : "book-outline"} size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          title: "영상로그",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "video.fill" : "video"} tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "videocam" : "videocam-outline"} size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: "일상",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "book.pages.fill" : "book.pages"} tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "document-text" : "document-text-outline"} size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="travel"
        options={{
          title: "트레블",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name="airplane" tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "airplane" : "airplane-outline"} size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "gearshape.fill" : "gearshape"} tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
