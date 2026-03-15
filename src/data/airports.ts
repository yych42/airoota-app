import type { Airport, AirportGuideData, AirportCardData } from '../types/booking';

export const airports: Airport[] = [
  { code: 'TPE', name: 'Taoyuan International', nameZh: '桃園國際機場', city: '桃園' },
  { code: 'TSA', name: 'Songshan Airport', nameZh: '松山機場', city: '台北' },
  { code: 'KHH', name: 'Kaohsiung International', nameZh: '高雄國際機場', city: '高雄' },
  { code: 'RMQ', name: 'Taichung Airport', nameZh: '台中機場', city: '台中' },
];

export const airportCoords: Record<string, [number, number]> = {
  TPE: [25.0797, 121.2342],
  TSA: [25.0694, 121.5523],
  KHH: [22.5771, 120.3500],
  RMQ: [24.2647, 120.6208],
};

export const airportCards: AirportCardData[] = [
  {
    code: 'TPE',
    name: '桃園國際機場',
    city: '桃園市',
    terminals: 2,
    gradient: 'from-teal-500/10 via-teal-400/5 to-transparent',
    accentColor: 'text-teal-600',
    bgAccent: 'bg-teal-500',
  },
  {
    code: 'TSA',
    name: '台北松山機場',
    city: '台北市',
    terminals: 1,
    gradient: 'from-amber-500/10 via-amber-400/5 to-transparent',
    accentColor: 'text-amber-600',
    bgAccent: 'bg-amber-500',
  },
  {
    code: 'KHH',
    name: '高雄國際機場',
    city: '高雄市',
    terminals: 1,
    gradient: 'from-navy-500/10 via-navy-400/5 to-transparent',
    accentColor: 'text-navy-600',
    bgAccent: 'bg-navy-600',
  },
  {
    code: 'RMQ',
    name: '台中國際機場',
    city: '台中市',
    terminals: 1,
    gradient: 'from-teal-600/10 via-amber-400/5 to-transparent',
    accentColor: 'text-teal-700',
    bgAccent: 'bg-teal-600',
  },
];

export const airportGuides: Record<string, AirportGuideData> = {
  tpe: {
    code: 'TPE',
    name: '桃園國際機場',
    city: '桃園市',
    steps: [
      { title: '出關後往左走', desc: '通過海關與行李提領區後，從入境大廳左側出口離開' },
      { title: '跟隨「接機區 B」指標', desc: '沿途會看到清楚的接機區域指引標示' },
      { title: '司機將持姓名牌等候', desc: '在接機區 B 等候處，司機會舉著印有您姓名的牌子' },
    ],
    arrivalNotes: [
      { text: '入境審查通常需要 20-40 分鐘' },
      { text: '您的司機會即時追蹤航班，自動調整時間' },
      { text: '免費等候時間：國際航班 90 分鐘 / 國內航班 60 分鐘' },
    ],
    tips: [
      '桃園機場捷運到台北車站約 35 分鐘，是很好的替代方案',
      '市區的匯率比機場好，建議在機場只換少量現金',
      '推薦下載悠遊付 App，方便搭乘大眾運輸',
      '第二航廈的美食街選擇較多，等機時可以逛逛',
    ],
  },
  tsa: {
    code: 'TSA',
    name: '台北松山機場',
    city: '台北市',
    steps: [
      { title: '出關後直行', desc: '通過入境大廳後往正前方出口離開' },
      { title: '前往一樓接機大廳', desc: '跟隨「接機」或「Arrivals」指標至一樓大廳' },
      { title: '司機將持姓名牌等候', desc: '在接機大廳出口處，司機會舉著印有您姓名的牌子' },
    ],
    arrivalNotes: [
      { text: '入境審查通常需要 15-30 分鐘' },
      { text: '您的司機會即時追蹤航班，自動調整時間' },
      { text: '免費等候時間：國際航班 90 分鐘 / 國內航班 60 分鐘' },
    ],
    tips: [
      '松山機場離市區很近，到台北市中心僅約 15 分鐘車程',
      '機場旁就是捷運文湖線松山機場站，非常方便',
      '松山機場規模較小，出關速度通常很快',
      '機場附近的民生社區有許多在地美食值得一試',
    ],
  },
  khh: {
    code: 'KHH',
    name: '高雄國際機場',
    city: '高雄市',
    steps: [
      { title: '出關後往右走', desc: '通過入境大廳後從右側出口離開' },
      { title: '前往國際航廈接機區', desc: '跟隨接機區域指標前往一樓接機大廳' },
      { title: '司機將持姓名牌等候', desc: '在接機大廳門口，司機會舉著印有您姓名的牌子' },
    ],
    arrivalNotes: [
      { text: '入境審查通常需要 15-25 分鐘' },
      { text: '您的司機會即時追蹤航班，自動調整時間' },
      { text: '免費等候時間：國際航班 90 分鐘 / 國內航班 60 分鐘' },
    ],
    tips: [
      '高雄機場到市區只要約 20 分鐘車程，非常近',
      '機場直接連接捷運紅線，交通十分便利',
      '到六合夜市或瑞豐夜市約 20-30 分鐘車程',
      '高雄天氣較熱，建議準備輕便衣物和防曬用品',
    ],
  },
  rmq: {
    code: 'RMQ',
    name: '台中國際機場',
    city: '台中市',
    steps: [
      { title: '出關後直行', desc: '通過入境大廳後從正前方出口離開' },
      { title: '前往一樓接機區', desc: '跟隨接機區指標前往一樓大廳出口' },
      { title: '司機將持姓名牌等候', desc: '在航廈出口處，司機會舉著印有您姓名的牌子' },
    ],
    arrivalNotes: [
      { text: '入境審查通常需要 10-20 分鐘' },
      { text: '您的司機會即時追蹤航班，自動調整時間' },
      { text: '免費等候時間：國際航班 90 分鐘 / 國內航班 60 分鐘' },
    ],
    tips: [
      '台中機場到市區約 30 分鐘車程',
      '機場規模較小，出關速度通常很快',
      '逢甲夜市和一中街商圈是台中必訪景點',
      '台中的公車 10 公里以內免費，善加利用非常划算',
    ],
  },
};
