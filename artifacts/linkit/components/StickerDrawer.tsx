import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useStickers } from "@/context/StickersContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  onPick: (emoji: string, stickerId: string) => void;
  height?: number;
}

export function StickerDrawer({ onPick, height = 240 }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { packs, isOwned } = useStickers();
  const [activePackId, setActivePackId] = useState(packs[0]?.id ?? "");

  const ownedPacks = useMemo(() => packs.filter((p) => isOwned(p.id)), [packs, isOwned]);
  const activePack = ownedPacks.find((p) => p.id === activePackId) ?? ownedPacks[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, height }]}>
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={ownedPacks}
          keyExtractor={(p) => p.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          renderItem={({ item }) => {
            const active = activePack?.id === item.id;
            return (
              <Pressable
                onPress={() => setActivePackId(item.id)}
                style={[
                  styles.packTab,
                  {
                    backgroundColor: active ? item.themeColor : "transparent",
                    borderColor: active ? item.themeColor : colors.border,
                  },
                ]}
              >
                <Text style={styles.packEmoji}>{item.coverEmoji}</Text>
              </Pressable>
            );
          }}
        />
        <Pressable
          onPress={() => router.push("/store")}
          style={[styles.storeBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="bag-add" size={14} color="white" />
          <Text style={styles.storeBtnText}>스토어</Text>
        </Pressable>
      </View>

      <FlatList
        data={activePack?.stickers ?? []}
        keyExtractor={(s) => s.id}
        numColumns={6}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPick(item.emoji, item.id)}
            style={({ pressed }) => [styles.stickerCell, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={styles.stickerEmoji}>{item.emoji}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  packTab: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  packEmoji: { fontSize: 22 },
  storeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 12,
  },
  storeBtnText: { color: "white", fontFamily: "Gaegu_700Bold", fontSize: 12 },
  grid: { padding: 8 },
  stickerCell: {
    flex: 1 / 6,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stickerEmoji: { fontSize: 28 },
});
