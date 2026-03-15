import '../global.css';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { NotoSansTC_400Regular, NotoSansTC_500Medium, NotoSansTC_700Bold } from '@expo-google-fonts/noto-sans-tc';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from '@lingui/react';
import { i18n, initI18n } from '../src/i18n/setup';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  initI18n();

  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
    NotoSansTC: NotoSansTC_400Regular,
    NotoSansTCMedium: NotoSansTC_500Medium,
    NotoSansTCBold: NotoSansTC_700Bold,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const content = (
    <I18nProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="book" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="trips" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="guides" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="help" options={{ presentation: 'card', animation: 'slide_from_right' }} />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </I18nProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#f0f4f8' }}>
        <View
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 430,
            backgroundColor: '#ffffff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.08,
            shadowRadius: 40,
          }}
        >
          {content}
        </View>
      </View>
    );
  }

  return content;
}
