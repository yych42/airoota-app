import type { Vehicle, VehicleConstraint } from '../types/booking';

export const vehicles: Vehicle[] = [
  {
    type: 'standard',
    name: 'Standard Sedan',
    nameZh: '標準轎車',
    description: '舒適四門轎車，適合 1-3 位旅客',
    maxPassengers: 3,
    maxLuggage: 2,
    basePrice: 1200,
  },
  {
    type: 'premium',
    name: 'Premium Sedan',
    nameZh: '豪華轎車',
    description: '高級轎車，寬敞舒適的乘車體驗',
    maxPassengers: 3,
    maxLuggage: 3,
    basePrice: 1800,
  },
  {
    type: 'suv',
    name: 'SUV / Van',
    nameZh: '休旅車',
    description: '寬敞空間，適合家庭或多件行李',
    maxPassengers: 6,
    maxLuggage: 5,
    basePrice: 2400,
  },
  {
    type: 'van9',
    name: '9-Seater Van',
    nameZh: '九人座',
    description: '寬敞九人座，適合大型團體或大量行李',
    maxPassengers: 8,
    maxLuggage: 8,
    basePrice: 3200,
  },
];

export const vehicleConstraints: Record<string, VehicleConstraint> = {
  standard: { maxPassengers: 3, maxLargeLuggage: 2, maxSmallLuggage: 2 },
  premium: { maxPassengers: 3, maxLargeLuggage: 3, maxSmallLuggage: 2 },
  suv: {
    maxPassengers: 6,
    maxLargeLuggage: 4,
    maxSmallLuggage: 3,
    conditionalLuggage: { minPassengers: 5, maxLargeLuggage: 2, maxSmallLuggage: 2 },
  },
  van9: {
    maxPassengers: 8,
    maxLargeLuggage: 6,
    maxSmallLuggage: 2,
    conditionalLuggage: { minPassengers: 7, maxLargeLuggage: 3, maxSmallLuggage: 2 },
  },
};

export const childSeatOptions = [
  '0-1 歲（後向式安全座椅）',
  '1-3 歲（前向式安全座椅）',
  '3-8 歲（增高墊）',
];

export function isVehicleDisabled(
  vehicleType: string,
  passengerCount: number,
  largeLuggageCount: number,
  smallLuggageCount: number
): boolean {
  const c = vehicleConstraints[vehicleType];
  if (!c) return false;
  if (passengerCount > c.maxPassengers) return true;
  const effectiveMaxLarge =
    c.conditionalLuggage && passengerCount >= c.conditionalLuggage.minPassengers
      ? c.conditionalLuggage.maxLargeLuggage
      : c.maxLargeLuggage;
  const effectiveMaxSmall =
    c.conditionalLuggage && passengerCount >= c.conditionalLuggage.minPassengers
      ? c.conditionalLuggage.maxSmallLuggage
      : c.maxSmallLuggage;
  if (largeLuggageCount > effectiveMaxLarge) return true;
  if (smallLuggageCount > effectiveMaxSmall) return true;
  return false;
}

export function getVehicleCapacityLabel(vehicleType: string): string {
  const c = vehicleConstraints[vehicleType];
  if (!c) return '';
  let label = `最多 ${c.maxPassengers} 位乘客、${c.maxLargeLuggage} 大 + ${c.maxSmallLuggage} 小行李`;
  if (c.conditionalLuggage) {
    label += `（${c.conditionalLuggage.minPassengers} 人以上：${c.conditionalLuggage.maxLargeLuggage} 大 + ${c.conditionalLuggage.maxSmallLuggage} 小）`;
  }
  return label;
}
