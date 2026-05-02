import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface Sticker {
  id: string;
  emoji: string;
  label?: string;
}

export interface StickerPack {
  id: string;
  name: string;
  description: string;
  price: number;
  isPaid: boolean;
  themeColor: string;
  coverEmoji: string;
  stickers: Sticker[];
}

const PACKS: StickerPack[] = [
  {
    id: "pack_basic",
    name: "기본 무료팩",
    description: "별, 하트, 체크, 도형 — 가장 자주 쓰는 무료 스티커",
    price: 0,
    isPaid: false,
    themeColor: "#FFD86B",
    coverEmoji: "✨",
    stickers: [
      { id: "s_b_1", emoji: "✨" },
      { id: "s_b_2", emoji: "⭐️" },
      { id: "s_b_3", emoji: "❤️" },
      { id: "s_b_4", emoji: "💛" },
      { id: "s_b_5", emoji: "💚" },
      { id: "s_b_6", emoji: "💙" },
      { id: "s_b_7", emoji: "🤍" },
      { id: "s_b_8", emoji: "💜" },
      { id: "s_b_9", emoji: "✅" },
      { id: "s_b_10", emoji: "📌" },
      { id: "s_b_11", emoji: "🔖" },
      { id: "s_b_12", emoji: "🌟" },
    ],
  },
  {
    id: "pack_emotion",
    name: "감정 무료팩",
    description: "오늘 기분을 한 번에 — 표정 이모지 모음",
    price: 0,
    isPaid: false,
    themeColor: "#FFB7C5",
    coverEmoji: "🥰",
    stickers: [
      { id: "s_e_1", emoji: "🥰" },
      { id: "s_e_2", emoji: "😊" },
      { id: "s_e_3", emoji: "🥹" },
      { id: "s_e_4", emoji: "🤭" },
      { id: "s_e_5", emoji: "😤" },
      { id: "s_e_6", emoji: "😴" },
      { id: "s_e_7", emoji: "🥲" },
      { id: "s_e_8", emoji: "😭" },
      { id: "s_e_9", emoji: "😎" },
      { id: "s_e_10", emoji: "🫶" },
    ],
  },
  {
    id: "pack_cutie_animal",
    name: "큐티 동물 다꾸팩",
    description: "곰돌이, 토끼, 강아지 — 페이지가 폭신해지는 동물 스티커",
    price: 2900,
    isPaid: true,
    themeColor: "#FFD3DA",
    coverEmoji: "🧸",
    stickers: [
      { id: "s_a_1", emoji: "🧸" },
      { id: "s_a_2", emoji: "🐰" },
      { id: "s_a_3", emoji: "🐻" },
      { id: "s_a_4", emoji: "🐶" },
      { id: "s_a_5", emoji: "🐱" },
      { id: "s_a_6", emoji: "🐹" },
      { id: "s_a_7", emoji: "🐼" },
      { id: "s_a_8", emoji: "🦊" },
      { id: "s_a_9", emoji: "🐧" },
      { id: "s_a_10", emoji: "🐥" },
      { id: "s_a_11", emoji: "🐨" },
      { id: "s_a_12", emoji: "🐯" },
    ],
  },
  {
    id: "pack_starry",
    name: "별빛 감성팩",
    description: "은하수처럼 반짝이는 감성 스티커",
    price: 3900,
    isPaid: true,
    themeColor: "#C9B6F2",
    coverEmoji: "🌙",
    stickers: [
      { id: "s_s_1", emoji: "🌙" },
      { id: "s_s_2", emoji: "⭐️" },
      { id: "s_s_3", emoji: "🌟" },
      { id: "s_s_4", emoji: "✨" },
      { id: "s_s_5", emoji: "☁️" },
      { id: "s_s_6", emoji: "🌌" },
      { id: "s_s_7", emoji: "🪐" },
      { id: "s_s_8", emoji: "🔮" },
      { id: "s_s_9", emoji: "🎀" },
      { id: "s_s_10", emoji: "💫" },
    ],
  },
  {
    id: "pack_cafe",
    name: "카페라떼 무드팩",
    description: "갬성 카페 일기를 위한 디저트 + 음료 스티커",
    price: 2900,
    isPaid: true,
    themeColor: "#E8D5B7",
    coverEmoji: "☕️",
    stickers: [
      { id: "s_c_1", emoji: "☕️" },
      { id: "s_c_2", emoji: "🧋" },
      { id: "s_c_3", emoji: "🍰" },
      { id: "s_c_4", emoji: "🍪" },
      { id: "s_c_5", emoji: "🥐" },
      { id: "s_c_6", emoji: "🍩" },
      { id: "s_c_7", emoji: "🧁" },
      { id: "s_c_8", emoji: "🍮" },
      { id: "s_c_9", emoji: "🍓" },
      { id: "s_c_10", emoji: "🍯" },
    ],
  },
  {
    id: "pack_spring",
    name: "봄날의 꽃다발팩",
    description: "벚꽃, 튤립, 데이지 — 봄 시즌 한정 스티커",
    price: 4900,
    isPaid: true,
    themeColor: "#FFD3DA",
    coverEmoji: "🌸",
    stickers: [
      { id: "s_f_1", emoji: "🌸" },
      { id: "s_f_2", emoji: "🌷" },
      { id: "s_f_3", emoji: "🌹" },
      { id: "s_f_4", emoji: "🌼" },
      { id: "s_f_5", emoji: "🌺" },
      { id: "s_f_6", emoji: "💐" },
      { id: "s_f_7", emoji: "🍀" },
      { id: "s_f_8", emoji: "🌿" },
      { id: "s_f_9", emoji: "🌻" },
      { id: "s_f_10", emoji: "🪷" },
    ],
  },
];

interface StickersContextType {
  packs: StickerPack[];
  ownedPackIds: string[];
  isOwned: (packId: string) => boolean;
  ownedStickers: Sticker[];
  purchasePack: (packId: string) => Promise<void>;
  loading: boolean;
}

const StickersContext = createContext<StickersContextType | null>(null);

const OWNED_KEY = "@linkit/owned-packs/v1";

export function StickersProvider({ children }: { children: React.ReactNode }) {
  const [ownedPackIds, setOwnedPackIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const hydratedRef = React.useRef(false);
  const writeQueueRef = React.useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(OWNED_KEY);
        const initial = stored ? JSON.parse(stored) : ["pack_basic", "pack_emotion"];
        setOwnedPackIds(initial);
        if (!stored) await AsyncStorage.setItem(OWNED_KEY, JSON.stringify(initial));
      } catch {}
      hydratedRef.current = true;
      setLoading(false);
    })();
  }, []);

  const isOwned = useCallback((id: string) => ownedPackIds.includes(id), [ownedPackIds]);

  const purchasePack = useCallback(async (id: string) => {
    if (!hydratedRef.current) return;
    let computed: string[] = [];
    let alreadyOwned = false;
    setOwnedPackIds((prev) => {
      if (prev.includes(id)) {
        alreadyOwned = true;
        computed = prev;
        return prev;
      }
      computed = [...prev, id];
      return computed;
    });
    if (alreadyOwned) return;
    const next = writeQueueRef.current.then(
      () => AsyncStorage.setItem(OWNED_KEY, JSON.stringify(computed)),
      () => AsyncStorage.setItem(OWNED_KEY, JSON.stringify(computed))
    );
    writeQueueRef.current = next.catch(() => {});
    await next;
  }, []);

  const ownedStickers = useMemo(
    () => PACKS.filter((p) => ownedPackIds.includes(p.id)).flatMap((p) => p.stickers),
    [ownedPackIds]
  );

  return (
    <StickersContext.Provider
      value={{ packs: PACKS, ownedPackIds, isOwned, ownedStickers, purchasePack, loading }}
    >
      {children}
    </StickersContext.Provider>
  );
}

export function useStickers() {
  const ctx = useContext(StickersContext);
  if (!ctx) throw new Error("useStickers must be used within StickersProvider");
  return ctx;
}
