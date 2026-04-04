import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HEIGHT_M = 1.78;

interface RawRecord {
  datetime: string;
  weight: number;
  fat: number | null;
  fat_ratio?: number | null;
  fat_free_mass?: number | null;
  muscle_mass?: number | null;
  hydration?: number | null;
  bone_mass?: number | null;
  visceral_fat?: number | null;
  basal_metabolic_rate?: number | null;
  metabolic_age?: number | null;
}

export interface WeightRecord {
  date: string; // YYYY-MM-DD
  weight: number;
  fat: number | null; // kg
  fatPercent: number | null; // %
  bmi: number;
  muscleMass: number | null;
  boneMass: number | null;
  hydration: number | null;
  visceralFat: number | null;
  basalMetabolicRate: number | null;
  metabolicAge: number | null;
}

export interface MovingAverageRecord {
  date: string;
  weight: number;
  fatPercent: number | null;
}

export interface MonthlyRecord {
  month: string; // YYYY-MM
  year: number;
  weight: number;
  fatPercent: number | null;
}

export interface YearlyRecord {
  year: number;
  avgWeight: number;
  minWeight: number;
  maxWeight: number;
  avgFatPercent: number | null;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function loadData(): WeightRecord[] {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dataPath = path.resolve(__dirname, "../../../data.jsonl");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const records = raw
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as RawRecord);

  // 同日重複は最新のみ採用
  const byDate = new Map<string, RawRecord>();
  for (const r of records) {
    const date = r.datetime.split(" ")[0];
    byDate.set(date, r);
  }

  return Array.from(byDate.values())
    .map((r) => {
      const date = r.datetime.split(" ")[0];
      // fat_ratio が直接ある場合はそれを使い、なければ fat/weight で計算
      const fatPercent =
        r.fat_ratio != null
          ? round2(r.fat_ratio)
          : r.fat != null
            ? round2((r.fat / r.weight) * 100)
            : null;

      return {
        date,
        weight: round2(r.weight),
        fat: r.fat != null ? round2(r.fat) : null,
        fatPercent,
        bmi: round2(r.weight / (HEIGHT_M * HEIGHT_M)),
        muscleMass: r.muscle_mass != null ? round2(r.muscle_mass) : null,
        boneMass: r.bone_mass != null ? round2(r.bone_mass) : null,
        hydration: r.hydration != null ? round2(r.hydration) : null,
        visceralFat: r.visceral_fat != null ? round2(r.visceral_fat) : null,
        basalMetabolicRate:
          r.basal_metabolic_rate != null
            ? Math.round(r.basal_metabolic_rate)
            : null,
        metabolicAge:
          r.metabolic_age != null ? Math.round(r.metabolic_age) : null,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calcMovingAverage(
  data: WeightRecord[],
  days: number,
): MovingAverageRecord[] {
  const result: MovingAverageRecord[] = [];

  for (let i = 0; i < data.length; i++) {
    const windowStart = Math.max(0, i - days + 1);
    const window = data.slice(windowStart, i + 1);

    const avgWeight =
      window.reduce((sum, r) => sum + r.weight, 0) / window.length;

    const fatValues = window
      .map((r) => r.fatPercent)
      .filter((v): v is number => v != null);
    const avgFat =
      fatValues.length > 0
        ? fatValues.reduce((sum, v) => sum + v, 0) / fatValues.length
        : null;

    result.push({
      date: data[i].date,
      weight: round2(avgWeight),
      fatPercent: avgFat != null ? round2(avgFat) : null,
    });
  }

  return result;
}

export function calcMonthlyAvg(data: WeightRecord[]): MonthlyRecord[] {
  const groups = new Map<string, WeightRecord[]>();

  for (const r of data) {
    const month = r.date.slice(0, 7);
    const group = groups.get(month) ?? [];
    group.push(r);
    groups.set(month, group);
  }

  return Array.from(groups.entries())
    .map(([month, records]) => {
      const avgWeight =
        records.reduce((sum, r) => sum + r.weight, 0) / records.length;
      const fatValues = records
        .map((r) => r.fatPercent)
        .filter((v): v is number => v != null);
      const avgFat =
        fatValues.length > 0
          ? fatValues.reduce((sum, v) => sum + v, 0) / fatValues.length
          : null;

      return {
        month,
        year: parseInt(month.slice(0, 4)),
        weight: round2(avgWeight),
        fatPercent: avgFat != null ? round2(avgFat) : null,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function calcYearlyStats(data: WeightRecord[]): YearlyRecord[] {
  const groups = new Map<number, WeightRecord[]>();

  for (const r of data) {
    const year = parseInt(r.date.slice(0, 4));
    const group = groups.get(year) ?? [];
    group.push(r);
    groups.set(year, group);
  }

  return Array.from(groups.entries())
    .map(([year, records]) => {
      const weights = records.map((r) => r.weight);
      const fatValues = records
        .map((r) => r.fatPercent)
        .filter((v): v is number => v != null);

      return {
        year,
        avgWeight: round2(
          weights.reduce((a, b) => a + b, 0) / weights.length,
        ),
        minWeight: Math.min(...weights),
        maxWeight: Math.max(...weights),
        avgFatPercent:
          fatValues.length > 0
            ? round2(
                fatValues.reduce((a, b) => a + b, 0) / fatValues.length,
              )
            : null,
      };
    })
    .sort((a, b) => a.year - b.year);
}

export function calcWeekOverWeek(data: WeightRecord[]): number | null {
  if (data.length < 14) return null;

  const recent7 = data.slice(-7);
  const prev7 = data.slice(-14, -7);

  const recentAvg =
    recent7.reduce((sum, r) => sum + r.weight, 0) / recent7.length;
  const prevAvg =
    prev7.reduce((sum, r) => sum + r.weight, 0) / prev7.length;

  return round2(recentAvg - prevAvg);
}
