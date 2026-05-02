import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { PlacedSticker, PlacedText } from "@/context/DiariesContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  width: number;
  height: number;
  bgColor?: string;
  photoUri?: string;
  stickers: PlacedSticker[];
  texts: PlacedText[];
  onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  onRemoveSticker: (id: string) => void;
  onUpdateText: (id: string, updates: Partial<PlacedText>) => void;
  onRemoveText: (id: string) => void;
}

interface StickerItemProps {
  sticker: PlacedSticker;
  width: number;
  height: number;
  onUpdate: (updates: Partial<PlacedSticker>) => void;
  onRemove: () => void;
  selected: boolean;
  onSelect: () => void;
}

function StickerItem({ sticker, width, height, onUpdate, onRemove, selected, onSelect }: StickerItemProps) {
  const colors = useColors();
  const tx = useSharedValue((sticker.x / 100) * width);
  const ty = useSharedValue((sticker.y / 100) * height);
  const scale = useSharedValue(sticker.scale);
  const rotation = useSharedValue(sticker.rotation);

  const startTx = useSharedValue(0);
  const startTy = useSharedValue(0);
  const startScale = useSharedValue(0);
  const startRotation = useSharedValue(0);

  const persist = (nx: number, ny: number, ns: number, nr: number) => {
    onUpdate({
      x: (nx / width) * 100,
      y: (ny / height) * 100,
      scale: ns,
      rotation: nr,
    });
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      startTx.value = tx.value;
      startTy.value = ty.value;
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      tx.value = startTx.value + e.translationX;
      ty.value = startTy.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value, scale.value, rotation.value);
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(0.4, Math.min(4, startScale.value * e.scale));
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value, scale.value, rotation.value);
    });

  const rotate = Gesture.Rotation()
    .onStart(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = startRotation.value + (e.rotation * 180) / Math.PI;
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value, scale.value, rotation.value);
    });

  const tap = Gesture.Tap().onStart(() => {
    runOnJS(onSelect)();
  });

  const composed = Gesture.Simultaneous(pan, pinch, rotate, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.stickerItem, animatedStyle]}>
        <View style={selected ? [styles.selectionRing, { borderColor: colors.primary }] : null}>
          <Text style={styles.stickerText}>{sticker.emoji}</Text>
        </View>
        {selected && (
          <Pressable
            onPress={onRemove}
            style={[styles.removeBadge, { backgroundColor: colors.destructive }]}
          >
            <Ionicons name="close" size={14} color="white" />
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

interface TextItemProps {
  text: PlacedText;
  width: number;
  height: number;
  onUpdate: (updates: Partial<PlacedText>) => void;
  onRemove: () => void;
  selected: boolean;
  onSelect: () => void;
}

function TextItem({ text, width, height, onUpdate, onRemove, selected, onSelect }: TextItemProps) {
  const colors = useColors();
  const tx = useSharedValue((text.x / 100) * width);
  const ty = useSharedValue((text.y / 100) * height);
  const startTx = useSharedValue(0);
  const startTy = useSharedValue(0);

  const persist = (nx: number, ny: number) => {
    onUpdate({ x: (nx / width) * 100, y: (ny / height) * 100 });
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      startTx.value = tx.value;
      startTy.value = ty.value;
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      tx.value = startTx.value + e.translationX;
      ty.value = startTy.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(persist)(tx.value, ty.value);
    });

  const tap = Gesture.Tap().onStart(() => {
    runOnJS(onSelect)();
  });

  const composed = Gesture.Simultaneous(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.textItem, animatedStyle]}>
        <View style={selected ? [styles.selectionRing, { borderColor: colors.primary, padding: 6 }] : null}>
          <Text style={[styles.placedText, { color: text.color, fontSize: text.fontSize }]}>{text.text}</Text>
        </View>
        {selected && (
          <Pressable
            onPress={onRemove}
            style={[styles.removeBadge, { backgroundColor: colors.destructive }]}
          >
            <Ionicons name="close" size={14} color="white" />
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export function StickerCanvas({
  width,
  height,
  bgColor,
  photoUri,
  stickers,
  texts,
  onUpdateSticker,
  onRemoveSticker,
  onUpdateText,
  onRemoveText,
}: Props) {
  const colors = useColors();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <GestureHandlerRootView>
      <Pressable
        onPress={() => setSelectedId(null)}
        style={[styles.canvas, { width, height, backgroundColor: bgColor || colors.paperWhite }]}
      >
        {photoUri && <Image source={{ uri: photoUri }} style={[styles.photo, { width, height }]} />}
        {stickers.map((s) => (
          <StickerItem
            key={s.id}
            sticker={s}
            width={width}
            height={height}
            onUpdate={(u) => onUpdateSticker(s.id, u)}
            onRemove={() => onRemoveSticker(s.id)}
            selected={selectedId === s.id}
            onSelect={() => setSelectedId(s.id)}
          />
        ))}
        {texts.map((t) => (
          <TextItem
            key={t.id}
            text={t}
            width={width}
            height={height}
            onUpdate={(u) => onUpdateText(t.id, u)}
            onRemove={() => onRemoveText(t.id)}
            selected={selectedId === t.id}
            onSelect={() => setSelectedId(t.id)}
          />
        ))}
      </Pressable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  canvas: {
    overflow: "hidden",
    borderRadius: 16,
  },
  photo: { position: "absolute", top: 0, left: 0 },
  stickerItem: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  stickerText: { fontSize: 36 },
  selectionRing: { borderWidth: 2, borderRadius: 8, padding: 2, borderStyle: "dashed" },
  removeBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  textItem: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  placedText: { fontFamily: "Gaegu_700Bold" },
});
