import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText, Rect, Line } from 'react-native-svg';
import { colors } from '../../theme/tokens';

export interface LiveMapProps {
  driverLat: number;
  driverLng: number;
  destLat: number;
  destLng: number;
  driverLabel?: string;
  destLabel?: string;
  routeColor?: string;
  driverProgress?: number;
  children?: React.ReactNode;
}

/**
 * Web-specific SVG map placeholder.
 * Visually distinct from the native version with a slightly different aesthetic
 * that better suits web displays. Real Leaflet integration can replace this
 * once the web build pipeline is fully configured.
 */
export default function LiveMap({
  driverLat,
  driverLng,
  destLat,
  destLng,
  driverLabel = '司機',
  destLabel = '目的地',
  routeColor = colors.navy[600],
  driverProgress = 0,
  children,
}: LiveMapProps) {
  const SVG_W = 400;
  const SVG_H = 240;
  const PAD_X = 64;
  const PAD_Y = 52;

  const driverX = PAD_X;
  const driverY = SVG_H - PAD_Y;
  const destX = SVG_W - PAD_X;
  const destY = PAD_Y;

  // Cubic bezier for a more natural S-curve on web
  const cp1x = driverX + (destX - driverX) * 0.3;
  const cp1y = driverY - 80;
  const cp2x = driverX + (destX - driverX) * 0.7;
  const cp2y = destY + 60;
  const curvePath = `M ${driverX} ${driverY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${destX} ${destY}`;

  // Progress along cubic bezier (de Casteljau)
  const t = Math.max(0, Math.min(1, driverProgress));
  const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
  const bx1 = lerp(driverX, cp1x, t);
  const by1 = lerp(driverY, cp1y, t);
  const bx2 = lerp(cp1x, cp2x, t);
  const by2 = lerp(cp1y, cp2y, t);
  const bx3 = lerp(cp2x, destX, t);
  const by3 = lerp(cp2y, destY, t);
  const cx1 = lerp(bx1, bx2, t);
  const cy1 = lerp(by1, by2, t);
  const cx2 = lerp(bx2, bx3, t);
  const cy2 = lerp(by2, by3, t);
  const progX = lerp(cx1, cx2, t);
  const progY = lerp(cy1, cy2, t);

  // Street-like grid lines for web map look
  const gridLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  // Horizontal
  for (let gy = 30; gy < SVG_H; gy += 50) {
    gridLines.push({ x1: 0, y1: gy, x2: SVG_W, y2: gy });
  }
  // Vertical
  for (let gx = 30; gx < SVG_W; gx += 60) {
    gridLines.push({ x1: gx, y1: 0, x2: gx, y2: SVG_H });
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapBg}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Street grid */}
          {gridLines.map((line, i) => (
            <Line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={colors.navy[100]}
              strokeWidth={1}
              opacity={0.6}
            />
          ))}

          {/* Dashed route (background) */}
          <Path
            d={curvePath}
            stroke={colors.navy[200]}
            strokeWidth={3}
            strokeDasharray="10,7"
            fill="none"
            strokeLinecap="round"
          />

          {/* Solid route (progress portion) */}
          {driverProgress > 0 && (
            <Path
              d={curvePath}
              stroke={routeColor}
              strokeWidth={3}
              fill="none"
              strokeDasharray={`${t * 350},1000`}
              strokeLinecap="round"
            />
          )}

          {/* Driver marker */}
          <Circle
            cx={driverProgress > 0 ? progX : driverX}
            cy={driverProgress > 0 ? progY : driverY}
            r={20}
            fill={colors.navy[900]}
            opacity={0.12}
          />
          <Circle
            cx={driverProgress > 0 ? progX : driverX}
            cy={driverProgress > 0 ? progY : driverY}
            r={13}
            fill={colors.navy[900]}
          />
          <SvgText
            x={driverProgress > 0 ? progX : driverX}
            y={(driverProgress > 0 ? progY : driverY) + 5}
            fontSize={13}
            textAnchor="middle"
          >
            🚗
          </SvgText>
          <SvgText
            x={driverProgress > 0 ? progX : driverX}
            y={(driverProgress > 0 ? progY : driverY) + 32}
            fontSize={11}
            fontWeight="600"
            fill={colors.navy[700]}
            textAnchor="middle"
          >
            {driverLabel}
          </SvgText>

          {/* Destination marker */}
          <Circle
            cx={destX}
            cy={destY}
            r={18}
            fill={routeColor}
            opacity={0.12}
          />
          <Circle cx={destX} cy={destY} r={11} fill={routeColor} />
          <SvgText
            x={destX}
            y={destY + 4}
            fontSize={12}
            textAnchor="middle"
            fill={colors.white}
          >
            📍
          </SvgText>
          <SvgText
            x={destX}
            y={destY + 28}
            fontSize={11}
            fontWeight="600"
            fill={colors.navy[700]}
            textAnchor="middle"
          >
            {destLabel}
          </SvgText>
        </Svg>
      </View>

      {/* Overlay children (ETA, controls, etc.) */}
      {children && <View style={styles.overlay}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  mapBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f7fa', // slightly different from native (gray-100 feel)
  },
  overlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
});
