import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface Sticker {
  id: string;
  emoji: string;
  label?: string;
  keywords?: string[];
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
      { id: "s_b_1", emoji: "✨", label: "반짝이", keywords: ["반짝", "스파클", "별빛", "감성"] },
      { id: "s_b_2", emoji: "⭐️", label: "별", keywords: ["별", "스타", "노랑별"] },
      { id: "s_b_3", emoji: "❤️", label: "빨간하트", keywords: ["하트", "사랑", "러브", "빨강"] },
      { id: "s_b_4", emoji: "💛", label: "노랑하트", keywords: ["하트", "노랑", "옐로우"] },
      { id: "s_b_5", emoji: "💚", label: "초록하트", keywords: ["하트", "초록", "그린"] },
      { id: "s_b_6", emoji: "💙", label: "파랑하트", keywords: ["하트", "파랑", "블루"] },
      { id: "s_b_7", emoji: "🤍", label: "흰하트", keywords: ["하트", "화이트", "흰색"] },
      { id: "s_b_8", emoji: "💜", label: "보라하트", keywords: ["하트", "보라", "퍼플"] },
      { id: "s_b_9", emoji: "✅", label: "체크", keywords: ["체크", "완료", "성공", "투두"] },
      { id: "s_b_10", emoji: "📌", label: "압정", keywords: ["압정", "고정", "메모", "중요"] },
      { id: "s_b_11", emoji: "🔖", label: "북마크", keywords: ["북마크", "책갈피", "표시"] },
      { id: "s_b_12", emoji: "🌟", label: "빛나는별", keywords: ["별", "빛", "스타", "감동"] },
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
      { id: "s_e_1", emoji: "🥰", label: "사랑", keywords: ["사랑", "좋아", "하트눈", "행복"] },
      { id: "s_e_2", emoji: "😊", label: "미소", keywords: ["미소", "웃음", "행복", "기분좋음"] },
      { id: "s_e_3", emoji: "🥹", label: "감동", keywords: ["감동", "눈물", "벅참", "뭉클"] },
      { id: "s_e_4", emoji: "🤭", label: "수줍", keywords: ["수줍", "부끄", "헤헤", "웃음"] },
      { id: "s_e_5", emoji: "😤", label: "씩씩", keywords: ["화남", "씩씩", "분노", "투지"] },
      { id: "s_e_6", emoji: "😴", label: "잠", keywords: ["잠", "졸림", "수면", "피곤"] },
      { id: "s_e_7", emoji: "🥲", label: "찡함", keywords: ["눈물", "찡함", "슬픔", "웃픔"] },
      { id: "s_e_8", emoji: "😭", label: "엉엉", keywords: ["울음", "슬픔", "엉엉", "눈물"] },
      { id: "s_e_9", emoji: "😎", label: "쿨", keywords: ["쿨", "선글라스", "멋짐", "여유"] },
      { id: "s_e_10", emoji: "🫶", label: "손하트", keywords: ["하트", "손하트", "사랑", "케이팝"] },
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
      { id: "s_a_1", emoji: "🧸", label: "곰돌이", keywords: ["곰", "곰돌이", "테디", "베어", "인형"] },
      { id: "s_a_2", emoji: "🐰", label: "토끼", keywords: ["토끼", "래빗", "버니"] },
      { id: "s_a_3", emoji: "🐻", label: "곰", keywords: ["곰", "베어", "갈색곰"] },
      { id: "s_a_4", emoji: "🐶", label: "강아지", keywords: ["강아지", "개", "멍멍이", "도그"] },
      { id: "s_a_5", emoji: "🐱", label: "고양이", keywords: ["고양이", "냥이", "캣"] },
      { id: "s_a_6", emoji: "🐹", label: "햄스터", keywords: ["햄스터", "햄찌", "쥐"] },
      { id: "s_a_7", emoji: "🐼", label: "판다", keywords: ["판다", "푸바오", "흑백"] },
      { id: "s_a_8", emoji: "🦊", label: "여우", keywords: ["여우", "폭스"] },
      { id: "s_a_9", emoji: "🐧", label: "펭귄", keywords: ["펭귄", "펭수"] },
      { id: "s_a_10", emoji: "🐥", label: "병아리", keywords: ["병아리", "삐약", "노랑새"] },
      { id: "s_a_11", emoji: "🐨", label: "코알라", keywords: ["코알라"] },
      { id: "s_a_12", emoji: "🐯", label: "호랑이", keywords: ["호랑이", "타이거"] },
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
      { id: "s_s_1", emoji: "🌙", label: "달", keywords: ["달", "초승달", "문", "밤"] },
      { id: "s_s_2", emoji: "⭐️", label: "별", keywords: ["별", "스타"] },
      { id: "s_s_3", emoji: "🌟", label: "별빛", keywords: ["별빛", "반짝", "스타"] },
      { id: "s_s_4", emoji: "✨", label: "반짝", keywords: ["반짝", "스파클", "감성"] },
      { id: "s_s_5", emoji: "☁️", label: "구름", keywords: ["구름", "흐림", "하늘"] },
      { id: "s_s_6", emoji: "🌌", label: "은하수", keywords: ["은하", "갤럭시", "우주"] },
      { id: "s_s_7", emoji: "🪐", label: "행성", keywords: ["행성", "토성", "우주"] },
      { id: "s_s_8", emoji: "🔮", label: "수정구", keywords: ["수정구", "마법", "타로"] },
      { id: "s_s_9", emoji: "🎀", label: "리본", keywords: ["리본", "보우", "선물"] },
      { id: "s_s_10", emoji: "💫", label: "어지러운별", keywords: ["반짝", "별가루"] },
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
      { id: "s_c_1", emoji: "☕️", label: "커피", keywords: ["커피", "라떼", "아메리카노", "카페"] },
      { id: "s_c_2", emoji: "🧋", label: "버블티", keywords: ["버블티", "밀크티", "공차"] },
      { id: "s_c_3", emoji: "🍰", label: "케이크", keywords: ["케이크", "디저트", "조각"] },
      { id: "s_c_4", emoji: "🍪", label: "쿠키", keywords: ["쿠키", "과자"] },
      { id: "s_c_5", emoji: "🥐", label: "크루아상", keywords: ["크루아상", "빵"] },
      { id: "s_c_6", emoji: "🍩", label: "도넛", keywords: ["도넛", "디저트"] },
      { id: "s_c_7", emoji: "🧁", label: "컵케이크", keywords: ["컵케이크", "머핀"] },
      { id: "s_c_8", emoji: "🍮", label: "푸딩", keywords: ["푸딩", "디저트"] },
      { id: "s_c_9", emoji: "🍓", label: "딸기", keywords: ["딸기", "스트로베리", "과일"] },
      { id: "s_c_10", emoji: "🍯", label: "꿀", keywords: ["꿀", "허니"] },
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
      { id: "s_f_1", emoji: "🌸", label: "벚꽃", keywords: ["벚꽃", "사쿠라", "봄"] },
      { id: "s_f_2", emoji: "🌷", label: "튤립", keywords: ["튤립", "꽃", "봄"] },
      { id: "s_f_3", emoji: "🌹", label: "장미", keywords: ["장미", "로즈", "꽃", "사랑"] },
      { id: "s_f_4", emoji: "🌼", label: "데이지", keywords: ["데이지", "꽃", "노랑꽃"] },
      { id: "s_f_5", emoji: "🌺", label: "히비스커스", keywords: ["꽃", "히비스커스", "여름"] },
      { id: "s_f_6", emoji: "💐", label: "꽃다발", keywords: ["꽃다발", "부케", "선물"] },
      { id: "s_f_7", emoji: "🍀", label: "네잎클로버", keywords: ["클로버", "행운", "초록"] },
      { id: "s_f_8", emoji: "🌿", label: "잎사귀", keywords: ["잎", "그린", "초록"] },
      { id: "s_f_9", emoji: "🌻", label: "해바라기", keywords: ["해바라기", "노랑꽃", "여름"] },
      { id: "s_f_10", emoji: "🪷", label: "연꽃", keywords: ["연꽃", "로터스", "꽃"] },
    ],
  },
];

interface StickersContextType {
  packs: StickerPack[];
  ownedPackIds: string[];
  isOwned: (packId: string) => boolean;
  ownedStickers: Sticker[];
  searchStickers: (query: string) => Array<Sticker & { packId: string }>;
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

  const searchStickers = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const results: Array<Sticker & { packId: string }> = [];
      for (const pack of PACKS) {
        if (!ownedPackIds.includes(pack.id)) continue;
        for (const sticker of pack.stickers) {
          const haystack = [
            sticker.emoji,
            sticker.label ?? "",
            ...(sticker.keywords ?? []),
          ]
            .join(" ")
            .toLowerCase();
          if (haystack.includes(q)) {
            results.push({ ...sticker, packId: pack.id });
          }
        }
      }
      return results;
    },
    [ownedPackIds]
  );

  return (
    <StickersContext.Provider
      value={{ packs: PACKS, ownedPackIds, isOwned, ownedStickers, searchStickers, purchasePack, loading }}
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
