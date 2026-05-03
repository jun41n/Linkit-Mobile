import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthBackdrop } from "@/components/AuthBackdrop";
import { GlassSurface } from "@/components/GlassSurface";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { useColors } from "@/hooks/useColors";

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const isLoading = fetchStatus === "fetching";
  const canSubmit = emailAddress.trim().length > 0 && password.length > 0 && !isLoading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const { error } = await signIn.password({ emailAddress: emailAddress.trim(), password });
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: () => router.replace("/(tabs)"),
      });
    }
  };

  const rawErr = errors?.raw?.[0] as { longMessage?: string; message?: string } | undefined;
  const generalError =
    errors?.fields?.identifier?.message ||
    errors?.fields?.password?.message ||
    rawErr?.longMessage ||
    rawErr?.message;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <AuthBackdrop />
      <ScrollView style={styles.scrollOuter} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={[styles.brandTag, { color: colors.mutedForeground }]}>오늘의 다꾸를 더 이쁘게</Text>
        </View>

        <GlassSurface variant="card" tone="warm" borderRadius={24} style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={[styles.title, { color: colors.foreground }]}>로그인</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>이메일로 다시 만나요 :)</Text>

            <Text style={[styles.label, { color: colors.foreground }]}>이메일</Text>
            <GlassSurface variant="pill" tone="neutral" noShadow>
              <TextInput
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="name@example.com"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                style={[styles.input, { color: colors.foreground }]}
              />
            </GlassSurface>

            <Text style={[styles.label, { color: colors.foreground, marginTop: 12 }]}>비밀번호</Text>
            <GlassSurface variant="pill" tone="neutral" noShadow>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                autoComplete="current-password"
                style={[styles.input, { color: colors.foreground }]}
              />
            </GlassSurface>

            {generalError && (
              <Text style={[styles.error, { color: colors.destructive }]}>{generalError}</Text>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: canSubmit ? 1 : 0.4 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>로그인</Text>
              )}
            </Pressable>

            <SocialLoginButtons />

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.mutedForeground }]}>아직 계정이 없으신가요? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text style={[styles.footerLink, { color: colors.primary }]}>회원가입</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </GlassSurface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollOuter: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, gap: 24, flexGrow: 1 },
  brand: { alignItems: "center", gap: 6 },
  brandLogo: { width: 240, height: 180 },
  brandTag: { fontFamily: "NotoSansKR_500Medium", fontSize: 14 },
  card: { marginTop: 8 },
  cardInner: { padding: 22, gap: 8 },
  title: { fontFamily: "NotoSansKR_700Bold", fontSize: 24 },
  subtitle: { fontFamily: "NotoSansKR_400Regular", fontSize: 14, marginBottom: 14 },
  label: { fontFamily: "NotoSansKR_700Bold", fontSize: 13, marginBottom: 6, marginTop: 4 },
  input: { paddingHorizontal: 16, paddingVertical: 14, fontFamily: "NotoSansKR_500Medium", fontSize: 15 },
  error: { fontFamily: "NotoSansKR_500Medium", fontSize: 13, marginTop: 10 },
  primaryBtn: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontFamily: "NotoSansKR_700Bold", fontSize: 16 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
  footerText: { fontFamily: "NotoSansKR_400Regular", fontSize: 13 },
  footerLink: { fontFamily: "NotoSansKR_700Bold", fontSize: 13 },
});
