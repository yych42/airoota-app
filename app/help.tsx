import { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Search,
  Phone,
  MessageSquare,
  ClipboardList,
  RefreshCw,
  ChevronDown,
} from 'lucide-react-native';
import { colors } from '../src/theme/tokens';
import { useFadeSlideIn } from '../src/utils/animations';
import { useT } from '../src/i18n/useTranslation';

const quickActions = [
  {
    icon: Phone,
    label: '聯繫客服',
    desc: '即時線上客服',
    bgColor: `${colors.teal[500]}18`,
    iconColor: colors.teal[600],
  },
  {
    icon: MessageSquare,
    label: '常見問題',
    desc: '查看熱門問答',
    bgColor: `${colors.amber[500]}18`,
    iconColor: colors.amber[600],
  },
  {
    icon: ClipboardList,
    label: '訂單問題',
    desc: '行程與付款疑問',
    bgColor: `${colors.navy[900]}18`,
    iconColor: colors.navy[700],
  },
  {
    icon: RefreshCw,
    label: '取消與退款',
    desc: '取消政策說明',
    bgColor: '#ef444418',
    iconColor: '#ef4444',
  },
] as const;

const faqSections = [
  {
    title: '預訂相關',
    questions: [
      {
        id: 'booking-1',
        q: '如何預訂機場接送？',
        a: '在首頁選擇「預約接機」或「預約送機」，依照步驟填寫行程資訊、選擇車型並確認付款即可完成預訂。',
      },
      {
        id: 'booking-2',
        q: '可以預訂多遠的行程？',
        a: '您可以預訂最早 3 個月內的行程。建議至少在出發前 24 小時預訂，以確保司機安排。',
      },
      {
        id: 'booking-3',
        q: '價格如何計算？',
        a: '價格在預訂時即確認，包含車資、過路費及免費等候時間。不會有額外隱藏費用。',
      },
    ],
  },
  {
    title: '行程相關',
    questions: [
      {
        id: 'trip-1',
        q: '司機會等我多久？',
        a: '國際航班免費等候 90 分鐘，國內航班免費等候 60 分鐘，從航班實際降落時間起算。',
      },
      {
        id: 'trip-2',
        q: '如果航班延誤怎麼辦？',
        a: '我們會即時追蹤您的航班，司機會自動調整接機時間。您不需要做任何操作。',
      },
      {
        id: 'trip-3',
        q: '如何聯繫我的司機？',
        a: '司機確認後，您可以在行程詳情頁面透過「傳送訊息」或「撥打電話」直接聯繫司機。',
      },
    ],
  },
  {
    title: '付款與發票',
    questions: [
      {
        id: 'payment-1',
        q: '支援哪些付款方式？',
        a: '目前支援信用卡、Apple Pay 和 LINE Pay。',
      },
      {
        id: 'payment-2',
        q: '如何取得統一發票？',
        a: '預訂時選擇「需要統一發票」，司機會在行程結束時提供紙本發票。',
      },
    ],
  },
  {
    title: '取消與退款',
    questions: [
      {
        id: 'cancel-1',
        q: '取消政策是什麼？',
        a: '出發前 24 小時取消可全額退款。出發前 12-24 小時取消收取 30% 手續費。出發前 12 小時內取消不予退款。',
      },
      {
        id: 'cancel-2',
        q: '退款需要多久？',
        a: '退款將在 3-5 個工作天內退回原付款方式。',
      },
    ],
  },
  {
    title: '兒童安全座椅',
    questions: [
      {
        id: 'child-1',
        q: '兒童安全座椅如何申請？',
        a: '在預訂時的「兒童安全座椅」區域選擇所需的座椅類型。我們提供後向式（0-1歲）、前向式（1-3歲）及增高墊（3-8歲）。',
      },
      {
        id: 'child-2',
        q: '安全座椅費用多少？',
        a: '每張安全座椅加收 TWD 200。',
      },
    ],
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const t = useT();
  const fadeIn = useFadeSlideIn();
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  function toggleSection(index: number) {
    if (openSection === index) {
      setOpenSection(null);
      setOpenQuestion(null);
    } else {
      setOpenSection(index);
      setOpenQuestion(null);
    }
  }

  function toggleQuestion(id: string) {
    setOpenQuestion(openQuestion === id ? null : id);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[{ flex: 1 }, fadeIn]}>
        <ScrollView className="flex-1 bg-white">
          {/* Header */}
          <LinearGradient colors={['#102a43', '#243b53', '#334e68']} className="px-6 pb-10 pt-6">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => router.back()}
                className="h-10 w-10 items-center justify-center rounded-xl bg-white/10"
              >
                <ChevronLeft size={20} strokeWidth={2.5} color="#ffffff" />
              </Pressable>
              <View>
                <Text className="text-xl font-bold tracking-tight text-white">{t('客服中心')}</Text>
                <Text className="mt-0.5 text-sm font-medium text-navy-300">
                  {t('我們隨時為您提供協助')}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Content body */}
          <View className="relative z-10 -mt-4 gap-6 px-5">
            {/* Search Bar (visual only) */}
            <View className="relative">
              <View className="absolute inset-y-0 left-4 z-10 justify-center">
                <Search size={18} strokeWidth={2.2} color={colors.navy[400]} />
              </View>
              <TextInput
                placeholder={t('搜尋常見問題...')}
                editable={false}
                className="w-full rounded-xl border border-navy-100/80 bg-navy-50 py-3.5 pl-11 pr-4 text-sm font-medium text-navy-900"
                placeholderTextColor={colors.navy[400]}
              />
            </View>

            {/* Quick Action Cards (2x2) */}
            <View className="flex-row flex-wrap gap-3">
              {quickActions.map((action, i) => {
                const IconComponent = action.icon;
                return (
                  <Pressable
                    key={i}
                    className="w-[48%] gap-3 rounded-2xl border border-navy-100/80 bg-white p-4 shadow-sm"
                  >
                    <View
                      className="h-11 w-11 items-center justify-center rounded-xl"
                      style={{ backgroundColor: action.bgColor }}
                    >
                      <IconComponent size={20} strokeWidth={2} color={action.iconColor} />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-navy-900">{t(action.label)}</Text>
                      <Text className="mt-0.5 text-xs text-navy-400">{t(action.desc)}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* FAQ Accordion Sections */}
            <View className="gap-3">
              <Text className="text-sm font-semibold uppercase tracking-wider text-navy-400">
                {t('常見問題')}
              </Text>

              {faqSections.map((section, sIdx) => (
                <View
                  key={sIdx}
                  className="overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm"
                >
                  {/* Section header */}
                  <Pressable
                    onPress={() => toggleSection(sIdx)}
                    className="flex-row items-center justify-between px-5 py-4"
                  >
                    <Text className="text-[15px] font-bold text-navy-900">{t(section.title)}</Text>
                    <ChevronDown
                      size={18}
                      strokeWidth={2.5}
                      color={colors.navy[400]}
                      style={
                        openSection === sIdx
                          ? { transform: [{ rotate: '180deg' }] }
                          : undefined
                      }
                    />
                  </Pressable>

                  {/* Questions (shown when section is open) */}
                  {openSection === sIdx && (
                    <View className="border-t border-navy-100">
                      {section.questions.map((question, qIdx) => {
                        const isOpen = openQuestion === question.id;
                        return (
                          <View
                            key={question.id}
                            className={qIdx > 0 ? 'border-t border-navy-50' : ''}
                          >
                            {/* Question */}
                            <Pressable
                              onPress={() => toggleQuestion(question.id)}
                              className="flex-row items-center justify-between px-5 py-3.5"
                            >
                              <Text className="flex-1 pr-4 text-sm font-semibold text-navy-700">
                                {t(question.q)}
                              </Text>
                              <ChevronDown
                                size={16}
                                strokeWidth={2.5}
                                color={colors.navy[300]}
                                style={
                                  isOpen
                                    ? { transform: [{ rotate: '180deg' }] }
                                    : undefined
                                }
                              />
                            </Pressable>

                            {/* Answer */}
                            {isOpen && (
                              <View className="px-5 pb-4 pt-0">
                                <Text className="text-sm leading-relaxed text-navy-500">
                                  {t(question.a)}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Bottom Contact Section */}
            <View className="items-center rounded-2xl border border-navy-100/80 bg-navy-50/50 px-5 py-6">
              <Text className="text-base font-bold text-navy-900">{t('還是找不到答案？')}</Text>

              <Pressable className="mt-4 w-full items-center rounded-xl bg-amber-500 px-6 py-4">
                <Text className="text-base font-bold text-white">{t('聯繫客服')}</Text>
              </Pressable>

              <Text className="mt-4 text-xs text-navy-400">
                {t('服務時間：每日 06:00 - 24:00')}
              </Text>
              <Text className="mt-1 text-xs font-medium text-navy-500">
                {t('客服專線：0800-000-123')}
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
