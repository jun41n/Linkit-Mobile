import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { GlassSurface } from "@/components/GlassSurface";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: isWeb ? 84 : 80,
          paddingBottom: isWeb ? 30 : 22,
          paddingTop: 12,
        },
        tabBarBackground: () => (
          <GlassSurface
            intensity={95}
            borderRadius={0}
            variant="bar"
            noShadow
            style={StyleSheet.absoluteFill as any}
          >
            <View style={{ width: "100%", height: "100%" }} />
          </GlassSurface>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "play-circle" : "play-circle-outline"} size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "happy" : "happy-outline"} size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
