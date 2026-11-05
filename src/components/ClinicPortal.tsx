import { useState } from "react";
import { ArrowDownToLine, Building2, CalendarDays, Check, CreditCard, FileSearch, Globe2, LogOut, Power, RefreshCw, Search, Settings2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { buildDemoPatients, filterDemoPatients, demoPatientCsv } from "@/lib/clinic-portal-demo";
import clynicqLogo from "@/assets/clynicq-logo.png";

type Preference = "clinic" | "language" | "account" | "billing";

export function ClinicPortal() {
  const { lang, setLang } = useI18n();
  const { user, isAdmin, signOut } = useAuth();
  const text = (en: string, zh: string) => lang === "zh" ? zh : en;
  const [preference, setPreference] = useState<Preference | null>(null);
  const [patients] = useState(buildDemoPatients);
  const [search, setSearch] = useState("");
  const [days, setDays] = useState("30");
  const [confirmQueue, setConfirmQueue] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const demoKey = "clynicq-demo-queue";
  const [queue, setQueue] = useState<{ closed: boolean; updatedAt: string | null }>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(demoKey) || "null");
      if (saved && typeof saved.closed === "boolean") return { closed: saved.closed, updatedAt: typeof saved.updatedAt === "string" ? saved.updatedAt : null };
    } catch { /* Start with an open demo queue if storage is unavailable. */ }
    return { closed: false, updatedAt: null };
  });
  const records = filterDemoPatients(patients, search, days);
  const statusLabel = (status: string) => status === "completed" ? text("Completed", "已完成") : status === "waiting" ? text("Waiting", "等待中") : text("Cancelled", "已取消");
  const updateDemoQueue = () => {
    const next = { closed: !queue.closed, updatedAt: new Date().toISOString() };
    try {
      localStorage.setItem(demoKey, JSON.stringify(next));
      setQueue(next);
      setFeedback(text("Status saved in this browser. No live clinic queue was changed.", "状态已保存在此浏览器。未更改实际诊所队列。"));
      setConfirmQueue(false);
    } catch {
      setFeedback(text("Could not save the status. Please try again.", "无法保存状态。请重试。"));
      setConfirmQueue(false);
    }
  };
  const downloadCsv = () => {
    const url = URL.createObjectURL(new Blob([demoPatientCsv(records)], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "clynicq-patient-records.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const preferenceTitle = {
    clinic: text("Clinic information", "诊所信息"),
    language: text("Language preference", "语言偏好"),
    account: text("Your account", "您的账户"),
    billing: text("Billing & Subscription", "账单与订阅"),
  };

  return (
    <div className="bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="flex max-w-[1455px] items-center justify-between gap-2 px-4 py-3 sm:px-8 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <img src={clynicqLogo} alt="ClynicQ logo" className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-tight">{text("ClynicQ Portal", "ClynicQ 门户")}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" className="min-h-11 gap-1.5 px-2" aria-label={text("Switch to Chinese", "切换到英文")} onClick={() => setLang(lang === "en" ? "zh" : "en")}><Globe2 />{lang === "en" ? "中文" : "EN"}</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-11 w-11" aria-label={text("Profile and settings", "账户与设置")} title={text("Profile and settings", "账户与设置")}><Settings2 className="h-5 w-5" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onSelect={() => setPreference("clinic")}><Building2 className="mr-2 h-4 w-4" />{preferenceTitle.clinic}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPreference("language")}><Globe2 className="mr-2 h-4 w-4" />{preferenceTitle.language}</DropdownMenuItem>
                {isAdmin && <DropdownMenuItem onSelect={() => setPreference("billing")}><CreditCard className="mr-2 h-4 w-4" />{preferenceTitle.billing}</DropdownMenuItem>}
                <DropdownMenuItem onSelect={() => setPreference("account")}><ShieldCheck className="mr-2 h-4 w-4" />{preferenceTitle.account}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => { void signOut(); }} className="text-destructive"><LogOut className="mr-2 h-4 w-4" />{text("Sign out", "退出登录")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-[1455px] space-y-5 px-4 py-5 sm:space-y-6 sm:px-8 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h2 className="text-base font-semibold">{text("Clinic Name", "诊所名称")}</h2></div>
        </div>

        <section aria-labelledby="queue-heading" className="overflow-hidden rounded-lg border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
            <h2 id="queue-heading" className="text-sm font-semibold">{text("Live Queue Control", "实时队列控制")}</h2>
          </div>
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{text("Live queue status", "实时队列状态")}</p>
                <div className="mt-2 flex items-center gap-2.5"><span className={`h-3 w-3 rounded-full ${queue.closed ? "bg-destructive" : "bg-status-arrived"}`} /><p className={`text-xl font-semibold ${queue.closed ? "text-destructive" : "text-status-arrived"}`}>{queue.closed ? text("CLOSED", "已关闭") : text("OPEN", "开放中")}</p></div>
                <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{queue.closed ? text("Not accepting new queue entries", "不接受新的排队登记") : text("Visible on ClynicQ", "在 ClynicQ 显示")}</p>
              </div>
              <Button variant={queue.closed ? "default" : "destructive"} onClick={() => { setFeedback(null); setConfirmQueue(true); }} className="h-11 w-full shrink-0 gap-2 sm:w-auto"><Power />{queue.closed ? text("Open Queue", "开放队列") : text("Close Queue", "关闭队列")}</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <p className="text-xs text-muted-foreground">{text("Last status update: ", "最近状态更新：")}{queue.updatedAt ? new Date(queue.updatedAt).toLocaleString(lang === "zh" ? "zh-SG" : "en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</p>
            </div>
            {feedback && <p role="status" className="mt-2 text-xs text-muted-foreground">{feedback}</p>}
          </div>
        </section>
        <p className="text-xs font-semibold text-muted-foreground px-1">
          {text("By default, your queue opens and closes automatically based on your clinic's operating hours.", "默认情况下，您的队列将根据诊所的营业时间自动开放和关闭。")}
        </p>

        <section aria-labelledby="records-heading" className="overflow-hidden rounded-lg border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
            <h2 id="records-heading" className="text-base font-semibold">{text("ClynicQ Patient Records", "ClynicQ 患者记录")}</h2>
            <Button variant="outline" size="sm" disabled={records.length === 0} onClick={downloadCsv} className="h-10 gap-1.5"><ArrowDownToLine />{text("Download CSV", "下载 CSV")}</Button>
          </div>
          <div className="px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} aria-label={text("Search by patient name", "按患者姓名搜索")} placeholder={text("Search patient name", "搜索患者姓名")} className="h-11 pl-9 text-sm" /></div>
              <Select value={days} onValueChange={setDays}><SelectTrigger className="h-11 w-full gap-2 text-sm sm:w-48" aria-label={text("Date filter", "日期筛选")}><CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">{text("Last 30 days", "最近30天")}</SelectItem><SelectItem value="7">{text("Last 7 days", "最近7天")}</SelectItem><SelectItem value="1">{text("Today", "今天")}</SelectItem></SelectContent></Select>
            </div>
          </div>
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-3 border-y bg-muted/40 px-5 py-3 text-xs font-medium text-muted-foreground md:grid">
            <span>{text("Patient name", "患者姓名")}</span><span>{text("Visit / appt. date", "就诊／预约日期")}</span><span>{text("Queue number", "队列号码")}</span><span>{text("Arrival / appt. time", "抵达／预约时间")}</span><span>{text("Status", "状态")}</span>
          </div>
          <p className="border-b px-4 py-2 text-xs text-muted-foreground sm:px-5">{text("This list only shows patients from ClynicQ", "此列表仅显示来自 ClynicQ 的患者")}</p>
          <div className="divide-y">
            {records.map(record => <div key={record.id} data-demo-patient={record.id} className="px-4 py-3 sm:px-5">
              <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center gap-3 text-sm md:grid"><span className="font-medium">{record.name}</span><span>{record.date}</span><span>{record.queue}</span><span>{record.time}</span><span className={record.status === "completed" ? "text-status-arrived" : "text-muted-foreground"}>{statusLabel(record.status)}</span></div>
              <div className="md:hidden"><div className="flex items-start justify-between gap-2"><p className="min-w-0 break-words text-sm font-medium">{record.name}</p><span className="shrink-0 text-xs text-muted-foreground">{record.queue}</span></div><div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{record.date} · {record.time}</span><span className={record.status === "completed" ? "text-status-arrived" : "text-muted-foreground"}>{statusLabel(record.status)}</span></div></div>
            </div>)}
          </div>
          {records.length === 0 && <div className="flex flex-col items-center px-5 py-7 text-center sm:py-10">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted"><FileSearch className="h-6 w-6 text-muted-foreground" /></span>
            <h3 className="text-base font-semibold">{text("No matching patients", "没有符合条件的患者")}</h3>
          </div>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground sm:px-5"><span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" />{text("CMS sync: not connected", "CMS 同步：未连接")}</span><span>{records.length} {text("records", "条记录")}</span></div>
        </section>
      </main>

      <Dialog open={confirmQueue} onOpenChange={setConfirmQueue}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>{queue.closed ? text("Open Queue?", "开放队列？") : text("Close Queue?", "关闭队列？")}</DialogTitle><DialogDescription>{queue.closed
              ? text("Confirming will open the queue. Patients will be able to join through the ClynicQ “Join Queue” button.", "确认后将开放队列。患者将能够通过 ClynicQ 的“加入队列”按钮排队。")
              : text("Confirming will close the queue. The ClynicQ “Join Queue” button will be closed and patients will no longer be able to join.", "确认后将关闭队列。ClynicQ 的“加入队列”按钮将关闭，患者将无法再排队。")}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirmQueue(false)}>{text("Cancel", "取消")}</Button><Button variant={queue.closed ? "default" : "destructive"} onClick={updateDemoQueue}>{text("Confirm", "确认")}</Button></DialogFooter></DialogContent>
      </Dialog>
      <Dialog open={preference !== null} onOpenChange={(open) => { if (!open) setPreference(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{preference ? preferenceTitle[preference] : text("Settings", "设置")}</DialogTitle><DialogDescription>{text("ClynicQ Portal", "ClynicQ 门户")}</DialogDescription></DialogHeader>
          {preference === "clinic" && <div className="space-y-3"><Label>{text("Clinic name", "诊所名称")}</Label><p className="text-sm font-medium">{text("Clinic not linked", "尚未关联诊所")}</p><p className="text-sm text-muted-foreground">{text("No verified clinic is associated with this account. Clinic information will appear once account mapping is configured.", "该账户尚未关联已验证的诊所。配置账户关联后，将显示诊所信息。")}</p></div>}
          {preference === "language" && <div className="flex gap-2">{(["en", "zh"] as const).map((value) => <Button key={value} variant={lang === value ? "default" : "outline"} aria-pressed={lang === value} onClick={() => setLang(value)} className="h-11 flex-1">{value === "en" ? "English" : "中文"}{lang === value && <Check />}</Button>)}</div>}
          {preference === "account" && <div className="space-y-4"><div><Label>{text("Email", "邮箱")}</Label><p className="mt-1 break-all text-sm">{user?.email}</p></div><Button variant="outline" className="h-11 gap-2" onClick={() => { void signOut(); }}><LogOut />{text("Sign out", "退出登录")}</Button></div>}
          {preference === "billing" && isAdmin && <div className="space-y-4"><div className="flex items-center justify-between border-b pb-3"><div><p className="text-xs text-muted-foreground">{text("Current plan", "当前方案")}</p><p className="mt-1 font-semibold">Basic</p></div></div><p className="text-sm text-muted-foreground">{text("No payment service is connected. Subscription and payment changes are unavailable.", "尚未连接付款服务。目前无法更改订阅或付款信息。")}</p><Button variant="outline" disabled className="h-11 w-full"><CreditCard />{text("Update payment details", "更新付款信息")}</Button></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}