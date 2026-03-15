import { ScrollView, View, Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, ArrowRight, Building2, TowerControl } from 'lucide-react-native';
import { colors } from '../../src/theme/tokens';
import { airportCards } from '../../src/data/airports';
import { useFadeSlideIn } from '../../src/utils/animations';
import { useT } from '../../src/i18n/useTranslation';

const accentColorMap: Record<string, string> = {
  'text-teal-600': colors.teal[600],
  'text-amber-600': colors.amber[600],
  'text-navy-600': colors.navy[600],
  'text-teal-700': colors.teal[700],
};

const bgAccentMap: Record<string, string> = {
  'bg-teal-500': `${colors.teal[500]}18`,
  'bg-amber-500': `${colors.amber[500]}18`,
  'bg-navy-600': `${colors.navy[600]}18`,
  'bg-teal-600': `${colors.teal[600]}18`,
};

export default function GuidesHubScreen() {
  const router = useRouter();
  const t = useT();
  const fadeIn = useFadeSlideIn();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[{ flex: 1 }, fadeIn]}>
        <ScrollView className="flex-1 bg-white">
          {/* Header */}
          <LinearGradient colors={['#102a43', '#243b53', '#334e68']} className="px-6 pb-10 pt-6">
            <View className="flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20">
                <MapPin size={20} strokeWidth={2.2} color={colors.teal[400]} />
              </View>
              <Text className="text-2xl font-bold tracking-tight text-white">{t('機場指南')}</Text>
            </View>
            <Text className="mt-3 text-sm font-medium text-navy-300">
              {t('讓每次旅程都從容自在')}
            </Text>
          </LinearGradient>

          {/* Airport Cards */}
          <View className="relative z-10 -mt-4 px-5">
            <View className="gap-4">
              {airportCards.map((airport) => (
                <Pressable
                  key={airport.code}
                  onPress={() => router.push(`/guides/${airport.code.toLowerCase()}`)}
                  className="overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm"
                >
                  <View className="flex-row items-center gap-4 px-5 py-5">
                    {/* Airport code badge */}
                    <View
                      className="h-14 w-14 items-center justify-center rounded-xl"
                      style={{ backgroundColor: bgAccentMap[airport.bgAccent] || `${colors.teal[500]}18` }}
                    >
                      <Text
                        className="text-lg font-extrabold tracking-wide"
                        style={{ color: accentColorMap[airport.accentColor] || colors.teal[600] }}
                      >
                        {airport.code}
                      </Text>
                    </View>

                    {/* Airport info */}
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold leading-snug text-navy-900">
                        {airport.name}
                      </Text>
                      <View className="mt-1 flex-row items-center gap-3">
                        <Text className="text-xs text-navy-400">{airport.city}</Text>
                        <View className="flex-row items-center gap-1">
                          {airport.terminals > 1 ? (
                            <Building2 size={12} strokeWidth={2} color={colors.navy[400]} />
                          ) : (
                            <TowerControl size={12} strokeWidth={2} color={colors.navy[400]} />
                          )}
                          <Text className="text-xs text-navy-400">
                            {airport.terminals} {t('航廈')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Arrow */}
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-navy-50">
                      <ArrowRight size={16} strokeWidth={2.5} color={colors.navy[400]} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Helpful note */}
          <View className="mt-8 px-6">
            <View className="rounded-2xl bg-navy-50 px-5 py-4">
              <Text className="text-center text-xs leading-relaxed text-navy-500">
                {t('每份指南包含接機位置、入境須知與在地小提醒，\n讓您抵達後輕鬆找到司機。')}
              </Text>
            </View>
          </View>

          {/* Bottom spacer */}
          <View className="pb-28" />
        </ScrollView>
      </Animated.View>
    </>
  );
}
