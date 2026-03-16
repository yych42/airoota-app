import { ReactNode } from 'react';
import { View, Text } from 'react-native';

type Props = {
  items: ReactNode[];
  circleSize?: number;
  gap?: number;
  spacing?: number;
};

export function StepList({ items, circleSize = 28, gap = 16, spacing = 24 }: Props) {
  return (
    <View>
      {items.map((content, i) => (
        <View key={i} style={{ flexDirection: 'row', gap }}>
          {/* Rail: circle + connector line, centered with alignItems */}
          <View style={{ width: circleSize, alignItems: 'center' }}>
            <View
              className="bg-teal-500"
              style={{
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <Text
                className="font-bold text-white"
                style={{ fontSize: Math.round(circleSize * 0.39) }}
              >
                {i + 1}
              </Text>
            </View>
            {i < items.length - 1 && (
              <View
                className="bg-teal-200"
                style={{ width: 2, flexGrow: 1 }}
              />
            )}
          </View>

          <View style={{ flex: 1, paddingBottom: i < items.length - 1 ? spacing : 0 }}>
            {content}
          </View>
        </View>
      ))}
    </View>
  );
}
