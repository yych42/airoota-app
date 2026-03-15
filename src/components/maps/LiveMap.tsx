import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
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
 * A polished SVG-based map placeholder for native platforms.
 * Draws a curved dashed route from driver to destination with labeled markers.
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
  // Layout constants
  const SVG_W = 360;
  const SVG_H = 220;
  const PAD_X = 56;
  const PAD_Y = 50;

  // Map lat/lng to SVG coordinates
  const driverX = PAD_X;
  const driverY = SVG_H - PAD_Y;
  const destX = SVG_W - PAD_X;
  const destY = PAD_Y;

  // Curved path (quadratic bezier) from driver to destination
  const midX = (driverX + destX) / 2;
  const midY = driverY - 60;
  const curvePath = `M ${driverX} ${driverY} Q ${midX} ${midY} ${destX} ${destY}`;

  // Progress point along the curve (simple linear interpolation on the bezier)
  const t = Math.max(0, Math.min(1, driverProgress));
  const progX =
    (1 - t) * (1 - t) * driverX + 2 * (1 - t) * t * midX + t * t * destX;
  const progY =
    (1 - t) * (1 - t) * driverY + 2 * (1 - t) * t * midY + t * t * destY;

  // Decorative grid dots
  const gridDots: { cx: number; cy: number }[] = [];
  for (let gx = 30; gx < SVG_W; gx += 40) {
    for (let gy = 20; gy < SVG_H; gy += 40) {
      gridDots.push({ cx: gx, cy: gy });
    }
  }

  return (
    <View style={styles.container}>
      {/* Map-like background */}
      <View style={styles.mapBg}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid dots for map texture */}
          {gridDots.map((dot, i) => (
            <Circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r={1}
              fill={colors.navy[200]}
              opacity={0.4}
            />
          ))}

          {/* Dashed route line (background) */}
          <Path
            d={curvePath}
            stroke={colors.navy[200]}
            strokeWidth={3}
            strokeDasharray="8,6"
            fill="none"
          />

          {/* Solid route line (progress) */}
          {driverProgress > 0 && (
            <Path
              d={curvePath}
              stroke={routeColor}
              strokeWidth={3}
              fill="none"
              strokeDasharray={`${t * 300},1000`}
              strokeLinecap="round"
            />
          )}

          {/* Driver marker - outer ring */}
          <Circle
            cx={driverProgress > 0 ? progX : driverX}
            cy={driverProgress > 0 ? progY : driverY}
            r={18}
            fill={colors.navy[900]}
            opacity={0.15}
          />
          {/* Driver marker - inner circle */}
          <Circle
            cx={driverProgress > 0 ? progX : driverX}
            cy={driverProgress > 0 ? progY : driverY}
            r={12}
            fill={colors.navy[900]}
          />
          {/* Car emoji on driver marker */}
          <SvgText
            x={driverProgress > 0 ? progX : driverX}
            y={(driverProgress > 0 ? progY : driverY) + 5}
            fontSize={12}
            textAnchor="middle"
          >
            🚗
          </SvgText>
          {/* Driver label */}
          <SvgText
            x={driverProgress > 0 ? progX : driverX}
            y={(driverProgress > 0 ? progY : driverY) + 30}
            fontSize={11}
            fontWeight="600"
            fill={colors.navy[700]}
            textAnchor="middle"
          >
            {driverLabel}
          </SvgText>

          {/* Destination marker - outer ring */}
          <Circle
            cx={destX}
            cy={destY}
            r={16}
            fill={routeColor}
            opacity={0.15}
          />
          {/* Destination marker - inner circle */}
          <Circle cx={destX} cy={destY} r={10} fill={routeColor} />
          {/* Pin icon on destination */}
          <SvgText
            x={destX}
            y={destY + 4}
            fontSize={11}
            textAnchor="middle"
            fill={colors.white}
          >
            📍
          </SvgText>
          {/* Destination label */}
          <SvgText
            x={destX}
            y={destY + 26}
            fontSize={11}
            fontWeight="600"
            fill={colors.navy[700]}
            textAnchor="middle"
          >
            {destLabel}
          </SvgText>
        </Svg>
      </View>

      {/* Overlay children (e.g. ETA badge) */}
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
    backgroundColor: colors.navy[50],
  },
  overlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
});
