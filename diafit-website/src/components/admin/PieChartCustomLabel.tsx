/**
 * Reusable customized pie label: renders percentage inside the slice (white text).
 * Use with Recharts Pie: label={renderPieLabelInside} labelLine={false}
 */
const RADIAN = Math.PI / 180;

export interface PieLabelRenderProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

export function renderPieLabelInside({
  cx,
  cy,
  midAngle,
  innerRadius = 0,
  outerRadius = 100,
  percent = 0,
}: PieLabelRenderProps) {
  if (cx == null || cy == null) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const ncx = Number(cx);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const ncy = Number(cy);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > ncx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
}
