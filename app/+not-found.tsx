import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '找不到頁面' }} />
      <View className="flex-1 items-center justify-center p-5 bg-white">
        <Text className="text-xl font-bold text-navy-900">{'找不到此頁面'}</Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-sm font-medium text-amber-600">{'返回首頁'}</Text>
        </Link>
      </View>
    </>
  );
}
