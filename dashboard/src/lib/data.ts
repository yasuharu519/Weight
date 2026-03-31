import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HEIGHT_M = 1.78;

interface RawRecord {
  datetime: string;
  weight: number;
  fat: number | null;
}

export interface WeightRecord {
  date: string; // YYYY-MM-DD
  weight: number;
  fat: number | null; // kg
  fatPercent: number | null; // %
  bmi: number;
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
      return {
        date,
        weight: Math.round(r.weight * 100) / 100,
        fat: r.fat != null ? Math.round(r.fat * 100) / 100 : null,
        fatPercent:
          r.fat != null
            ? Math.round((r.fat / r.weight) * 100 * 100) / 100
            : null,
        bmi: Math.round((r.weight / (HEIGHT_M * HEIGHT_M)) * 100) / 100,
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
      weight: Math.round(avgWeight * 100) / 100,
      fatPercent: avgFat != null ? Math.round(avgFat * 100) / 100 : null,
    });
  }

  return result;
}

export function calcMonthlyAvg(data: WeightRecord[]): MonthlyRecord[] {
  const groups = new Map<string, WeightRecord[]>();

  for (const r of data) {
    const month = r.date.slice(0, 7); // YYYY-MM
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
        weight: Math.round(avgWeight * 100) / 100,
        fatPercent: avgFat != null ? Math.round(avgFat * 100) / 100 : null,
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
        avgWeight:
          Math.round(
            (weights.reduce((a, b) => a + b, 0) / weights.length) * 100,
          ) / 100,
        minWeight: Math.min(...weights),
        maxWeight: Math.max(...weights),
        avgFatPercent:
          fatValues.length > 0
            ? Math.round(
                (fatValues.reduce((a, b) => a + b, 0) / fatValues.length) * 100,
              ) / 100
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

  return Math.round((recentAvg - prevAvg) * 100) / 100;
}
