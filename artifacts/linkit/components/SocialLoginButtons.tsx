import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

WebBrowser.maybeCompleteAuthSession();

type Provider = "kakao" | "google" | "naver" | "apple";

const PROVIDER_META: Record<
  Provider,
  { label: string; bg: string; fg: string; mark: string; markColor?: string; strategy: string }
> = {
  kakao: {
    label: "카카오로 로그인",
    bg: "#FEE500",
    fg: "#191600",
    mark: "K",
    strategy: "oauth_custom_kakao",
  },
  naver: {
    label: "네이버로 로그인",
    bg: "#03C75A",
    fg: "#FFFFFF",
    mark: "N",
    markColor: "#FFFFFF",
    strategy: "oauth_custom_naver",
  },
  google: {
    label: "Google로 로그인",
    bg: "#FFFFFF",
    fg: "#1F1F1F",
    mark: "G",
    markColor: "#4285F4",
    strategy: "oauth_google",
  },
  apple: {
    label: "Apple로 로그인",
    bg: "#000000",
    fg: "#FFFFFF",
    mark: "",
    strategy: "oauth_apple",
  },
};

export function SocialLoginButtons({ context = "signin" }: { context?: "signin" | "signup" }) {
  const colors = useColors();
  const router = useRouter();
  const { startSSOFlow } = useSSO();

  useEffect(() => {
    return () => {
      WebBrowser.maybeCompleteAuthSession();
    };
  }, []);

  const handlePress = async (provider: Provider) => {
    const meta = PROVIDER_META[provider];
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: meta.strategy as never,
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(
        `${meta.label} 사용 불가`,
        provider === "kakao" || provider === "naver"
          ? "관리자가 Clerk 대시보드에서 해당 OAuth 공급자를 활성화해야 사용할 수 있어요."
          : msg,
      );
    }
  };

  const verb = context === "signup" ? "시작하기" : "로그인";

  const providers: Provider[] = ["kakao", "naver", "google"];
  if (Platform.OS === "ios") providers.push("apple");

  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>또는</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {providers.map((p) => {
        const meta = PROVIDER_META[p];
        const showBorder = p === "google";
        return (
          <Pressable
            key={p}
            onPress={() => handlePress(p)}
            style={({ pressed }) => [
              styles.btn,
              {
                backgroundColor: meta.bg,
                opacity: pressed ? 0.85 : 1,
                borderWidth: showBorder ? 1 : 0,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.iconBox}>
              {p === "apple" ? (
                <Text style={[styles.appleIcon, { color: meta.fg }]}></Text>
              ) : p === "kakao" ? (
                <Text style={[styles.kakaoIcon, { color: meta.fg }]}>💬</Text>
              ) : (
                <Text
                  style={[
                    styles.markText,
                    { color: meta.markColor ?? meta.fg },
                  ]}
                >
                  {meta.mark}
                </Text>
              )}
            </View>
            <Text style={[styles.btnLabel, { color: meta.fg }]}>
              {meta.label.replace("로 로그인", `로 ${verb}`)}
            </Text>
            <View style={styles.iconBox} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10, marginTop: 18 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontFamily: "NotoSansKR_500Medium", fontSize: 12 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
  },
  iconBox: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: { fontFamily: "Inter_700Bold", fontSize: 18 },
  kakaoIcon: { fontSize: 16 },
  appleIcon: { fontSize: 20, marginTop: -2 },
  btnLabel: { fontFamily: "NotoSansKR_700Bold", fontSize: 15, flex: 1, textAlign: "center" },
});
