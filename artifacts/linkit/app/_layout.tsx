import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
} from "@expo-google-fonts/noto-sans-kr";
import { Gaegu_400Regular, Gaegu_700Bold } from "@expo-google-fonts/gaegu";
import { NanumPenScript_400Regular } from "@expo-google-fonts/nanum-pen-script";
import { BlackHanSans_400Regular } from "@expo-google-fonts/black-han-sans";
import { SingleDay_400Regular } from "@expo-google-fonts/single-day";
import { HiMelody_400Regular } from "@expo-google-fonts/hi-melody";
import { GowunDodum_400Regular } from "@expo-google-fonts/gowun-dodum";
import { Jua_400Regular } from "@expo-google-fonts/jua";
import { DoHyeon_400Regular } from "@expo-google-fonts/do-hyeon";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DiariesProvider } from "@/context/DiariesContext";
import { StickersProvider } from "@/context/StickersContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "뒤로", headerTitleStyle: { fontFamily: "NotoSansKR_700Bold", fontSize: 17 } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="diary/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="diary/new" options={{ presentation: "modal", title: "새 다이어리 만들기" }} />
      <Stack.Screen name="entry/new" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="entry/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="store/index" options={{ title: "스티커 스토어" }} />
      <Stack.Screen name="store/[id]" options={{ title: "스티커팩" }} />
      <Stack.Screen name="notifications" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
    Gaegu_400Regular,
    Gaegu_700Bold,
    NanumPenScript_400Regular,
    BlackHanSans_400Regular,
    SingleDay_400Regular,
    HiMelody_400Regular,
    GowunDodum_400Regular,
    Jua_400Regular,
    DoHyeon_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <DiariesProvider>
                <StickersProvider>
                  <RootLayoutNav />
                </StickersProvider>
              </DiariesProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
