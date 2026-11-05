import { format, subDays } from "date-fns";

const names = ["Wei Ming Tan", "Grace Chua", "Ahmad Rahman", "Mei Ling Ong", "Rajesh Nair", "Pei Fen Lim", "Desmond Koh", "Siti Aminah", "Kelvin Ng", "Hui Ying Goh", "Marcus Lee", "Xin Yi Chan", "Arjun Menon", "Lian Hoon Teo", "Brenda Yap", "Jun Jie Wong", "Farah Begum", "Terry Seow", "Yvonne Phua", "Kai Wen Chu", "Nurul Huda", "Gerald Tan", "Siok Hwa Lau", "Vikram Singh", "Celine Boo", "Hao Zhe Low", "Priya Darshini", "Alan Cheong", "Zhi Hui Fang", "Melvin Peh"];
export interface DemoPatient { id: string; name: string; date: string; queue: string; time: string; status: "completed" | "waiting" | "cancelled" }
export function buildDemoPatients(now = new Date()): DemoPatient[] {
  return names.map((name, i) => ({ id: `demo-${i + 1}`, name, date: format(subDays(now, i), "yyyy-MM-dd"), queue: `A${String(i + 1).padStart(3, "0")}`, time: `${String(9 + i % 8).padStart(2, "0")}:${String(i * 7 % 60).padStart(2, "0")}`, status: i === 0 ? "waiting" : i % 9 === 0 ? "cancelled" : "completed" }));
}
export function filterDemoPatients(records: DemoPatient[], search: string, days: string, now = new Date()) {
  const earliest = format(subDays(now, Number(days) - 1), "yyyy-MM-dd");
  return records.filter(record => record.name.toLowerCase().includes(search.trim().toLowerCase()) && record.date >= earliest);
}
export function demoPatientCsv(records: DemoPatient[]) {
  const rows = [["Sample patient name (fictional)", "Visit date", "Queue number", "Arrival time", "Status"], ...records.map(r => [r.name, r.date, r.queue, r.time, r.status])];
  return "\uFEFF" + rows.map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(",")).join("\r\n");
}