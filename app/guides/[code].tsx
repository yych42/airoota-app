import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Clock,
  Lightbulb,
  MapPin,
} from 'lucide-react-native';
import { colors } from '../../src/theme/tokens';
import { airportGuides } from '../../src/data/airports';
import { useFadeSlideIn } from '../../src/utils/animations';
import { useT } from '../../src/i18n/useTranslation';

export default function GuideDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const t = useT();
  const fadeIn = useFadeSlideIn();
  const guideCode = (code ?? 'tpe').toLowerCase();
  const guide = airportGuides[guideCode] ?? airportGuides['tpe'];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    meetDriver: true,
    arrivalInfo: false,
    localTips: false,
  });

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Sticky header bar */}
      <View className="border-b border-navy-100/60 bg-white">
        <View className="flex-row items-center gap-3 px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-navy-50"
          >
            <ArrowLeft size={18} strokeWidth={2.5} color={colors.navy[600]} />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-extrabold tracking-wide text-teal-600">
              {guide.code}
            </Text>
            <Text className="text-sm font-semibold text-navy-900">{guide.name}</Text>
          </View>
        </View>
      </View>

      <Animated.View style={[{ flex: 1 }, fadeIn]}>
        <ScrollView className="flex-1 bg-white">
          {/* Airport hero bar */}
          <LinearGradient
            colors={['#102a43', '#243b53', '#334e68']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-6"
          >
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/15">
                <Text className="text-xl font-black tracking-wider text-teal-400">
                  {guide.code}
                </Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-white">{guide.name}</Text>
                <View className="mt-0.5 flex-row items-center gap-1.5">
                  <MapPin size={14} strokeWidth={2} color={colors.navy[300]} />
                  <Text className="text-sm text-navy-300">{guide.city}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Expandable Sections */}
          <View className="gap-4 px-5 py-5">
            {/* Section A: Where to meet your driver */}
            <View className="overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm">
              <Pressable
                onPress={() => toggleSection('meetDriver')}
                className="flex-row items-center justify-between px-5 py-4"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
                    <UserCheck size={16} strokeWidth={2.2} color={colors.teal[600]} />
                  </View>
                  <Text className="text-[15px] font-bold text-navy-900">
                    {t('在哪裡見到您的司機')}
                  </Text>
                </View>
                {openSections['meetDriver'] ? (
                  <ChevronUp size={20} strokeWidth={2} color={colors.navy[400]} />
                ) : (
                  <ChevronDown size={20} strokeWidth={2} color={colors.navy[400]} />
                )}
              </Pressable>

              {openSections['meetDriver'] && (
                <View className="px-5 pb-5">
                  {/* Step cards with vertical connecting line */}
                  <View className="relative ml-4">
                    <View className="absolute left-[14px] top-4 bottom-4 w-0.5 bg-teal-200" />

                    {guide.steps.map((step, i) => (
                      <View
                        key={i}
                        className={`relative flex-row items-start gap-4 ${
                          i < guide.steps.length - 1 ? 'pb-6' : ''
                        }`}
                      >
                        <View className="relative z-10 h-7 w-7 items-center justify-center rounded-full bg-teal-500">
                          <Text className="text-xs font-bold text-white">{i + 1}</Text>
                        </View>
                        <View className="flex-1 pt-0.5">
                          <Text className="text-sm font-bold text-navy-900">{step.title}</Text>
                          <Text className="mt-1 text-xs leading-relaxed text-navy-500">
                            {step.desc}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Free wait time banner */}
                  <View className="mt-5 flex-row items-start gap-3 rounded-xl bg-amber-50 px-4 py-4">
                    <View className="h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                      <Clock size={16} strokeWidth={2.2} color={colors.amber[600]} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-amber-600">
                        {t('免費等候時間：國際航班 90 分鐘，國內航班 60 分鐘')}
                      </Text>
                      <Text className="mt-1 text-xs leading-relaxed text-navy-600">
                        {t('從航班實際降落時間起算。您不需要趕路，我們的司機會耐心等候。')}
                      </Text>
                    </View>
                  </View>

                  {/* Reassurance message */}
                  <View className="mt-3 rounded-xl bg-teal-50 px-4 py-3">
                    <Text className="text-center text-xs font-medium leading-relaxed text-teal-700">
                      {t('不用擔心，司機會耐心等候您')}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Section B: What to expect */}
            <View className="overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm">
              <Pressable
                onPress={() => toggleSection('arrivalInfo')}
                className="flex-row items-center justify-between px-5 py-4"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                    <Clock size={16} strokeWidth={2.2} color={colors.amber[600]} />
                  </View>
                  <Text className="text-[15px] font-bold text-navy-900">{t('抵達須知')}</Text>
                </View>
                {openSections['arrivalInfo'] ? (
                  <ChevronUp size={20} strokeWidth={2} color={colors.navy[400]} />
                ) : (
                  <ChevronDown size={20} strokeWidth={2} color={colors.navy[400]} />
                )}
              </Pressable>

              {openSections['arrivalInfo'] && (
                <View className="gap-3 px-5 pb-5">
                  {guide.arrivalNotes.map((note, i) => (
                    <View key={i} className="flex-row items-start gap-3 rounded-xl bg-navy-50 px-4 py-3.5">
                      <View className="h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                        <Clock size={16} strokeWidth={2} color={colors.navy[600]} />
                      </View>
                      <Text className="flex-1 pt-1 text-sm leading-relaxed text-navy-700">
                        {note.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Section C: Local tips from your driver */}
            <View className="overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm">
              <Pressable
                onPress={() => toggleSection('localTips')}
                className="flex-row items-center justify-between px-5 py-4"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-navy-100">
                    <Lightbulb size={16} strokeWidth={2.2} color={colors.navy[600]} />
                  </View>
                  <Text className="text-[15px] font-bold text-navy-900">
                    {t('司機的在地小提醒')}
                  </Text>
                </View>
                {openSections['localTips'] ? (
                  <ChevronUp size={20} strokeWidth={2} color={colors.navy[400]} />
                ) : (
                  <ChevronDown size={20} strokeWidth={2} color={colors.navy[400]} />
                )}
              </Pressable>

              {openSections['localTips'] && (
                <View className="gap-3 px-5 pb-5">
                  {guide.tips.map((tip, i) => (
                    <View key={i} className="rounded-xl bg-amber-50/70 px-4 py-3.5">
                      <Text className="text-sm leading-relaxed text-navy-700">{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Bottom spacer */}
          <View className="pb-28" />
        </ScrollView>
      </Animated.View>
    </>
  );
}
