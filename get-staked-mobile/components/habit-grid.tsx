import { View, Text, StyleSheet } from "react-native";
import { useMemo } from "react";
import { C, Radius } from "@/constants/theme";

interface HabitDay {
  date: Date;
  count: number;
  isToday?: boolean;
}

interface HabitGridProps {
  variant?: "compact" | "full";
  data?: HabitDay[];
}

function generateEmptyDays(numDays: number): HabitDay[] {
  const days: HabitDay[] = [];
  const today = new Date();
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 86400000);
    days.push({ date, count: 0, isToday: i === 0 });
  }
  return days;
}

function getDayBg(day: HabitDay) {
  if (day.count < 0) return C.bgHover;
  if (day.isToday && day.count === 0) return C.transparent;
  if (day.count === 0) return C.transparent;
  if (day.count === 1) return "rgba(34,197,94,0.20)";
  if (day.count === 2) return "rgba(34,197,94,0.45)";
  return C.primary;
}

function getDayBorder(day: HabitDay) {
  if (day.isToday && day.count === 0)
    return { borderWidth: 1.5, borderColor: C.white };
  if (day.count === 0 && day.count >= 0)
    return { borderWidth: 1, borderColor: C.dangerDim, borderStyle: "dashed" as const };
  return {};
}

export function HabitGrid({ variant = "compact", data }: HabitGridProps) {
  const numDays = variant === "compact" ? 28 : 91;
  const days = useMemo(() => data ?? generateEmptyDays(numDays), [data, numDays]);
  const SQ = variant === "compact" ? 13 : 14;
  const GAP = 3;
  const ROWS = 7;

  // Build column-major grid (7 rows, N columns)
  const cols: HabitDay[][] = [];
  let col: HabitDay[] = [];
  for (let i = 0; i < days.length; i++) {
    col.push(days[i]);
    if (col.length === ROWS) {
      cols.push(col);
      col = [];
    }
  }
  if (col.length > 0) {
    while (col.length < ROWS) col.push({ date: new Date(), count: -1 });
    cols.push(col);
  }

  const dayLabels = ["M", "", "W", "", "F", "", ""];

  return (
    <View style={s.container}>
      {variant === "full" && (
        <View style={[s.labelCol, { gap: GAP }]}>
          {dayLabels.map((l, i) => (
            <View key={i} style={{ height: SQ, justifyContent: "center" }}>
              <Text style={s.label}>{l}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={[s.grid, { gap: GAP }]}>
        {cols.map((column, ci) => (
          <View key={ci} style={[s.gridCol, { gap: GAP }]}>
            {column.map((day, ri) => (
              <View
                key={`${ci}-${ri}`}
                style={[
                  {
                    width: SQ,
                    height: SQ,
                    borderRadius: SQ / 2,
                    backgroundColor: getDayBg(day),
                  },
                  getDayBorder(day),
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export function HabitGridLegend() {
  return (
    <View style={s.legend}>
      <Text style={s.legendText}>Less</Text>
      <View style={[s.legendSq, { backgroundColor: C.transparent, borderWidth: 1, borderColor: C.dangerDim }]} />
      <View style={[s.legendSq, { backgroundColor: "rgba(34,197,94,0.20)" }]} />
      <View style={[s.legendSq, { backgroundColor: "rgba(34,197,94,0.45)" }]} />
      <View style={[s.legendSq, { backgroundColor: C.primary }]} />
      <Text style={s.legendText}>More</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flexDirection: "row", alignSelf: "center" },
  labelCol: { marginRight: 4, justifyContent: "center" },
  label: { fontSize: 9, color: C.textMuted, textAlign: "right", width: 12 },
  grid: { flexDirection: "row" },
  gridCol: { flexDirection: "column" },
  legend: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "center", marginTop: 12 },
  legendText: { fontSize: 10, color: C.textMuted },
  legendSq: { width: 10, height: 10, borderRadius: 5 },
});
