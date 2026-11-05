import { useState } from "react";
import { Activity, ArrowDownToLine, Building2, CalendarDays, Check, CircleHelp, CreditCard, FileSearch, Globe2, Loader2, LogOut, RefreshCw, Search, Settings2, ShieldCheck, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";
import { canControlQueue, canReadCmsRecords, existingPortalCapabilities } from "@/lib/clinic-portal";

type Preference = "clinic" | "language" | "account" | "billing";

export function ClinicPortal() {
  const { lang, setLang } = useI18n();
  const { user, isAdmin, signOut } = useAuth();
  const text = (en: string, zh: string) => lang === "zh" ? zh : en;
  const [preference, setPreference] = useState<Preference | null>(null);
  const [checking, setChecking] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const queueAvailable = canControlQueue(existingPortalCapabilities);
  const recordsAvailable = canReadCmsRecords(existingPortalCapabilities);

  const checkConnection = async () => {
    if (checking) return;
    setChecking(true);
    setConnectionMessage(null);
    try {
      const { data, error } = await supabase.auth.getUser();
      setConnectionMessage(error || !data.user
        ? text("Unable to verify your account. Please sign in again.", "无法验证您的账户。请重新登录。")
        : text("Account verified. Clinic queue and CMS connections are not configured yet.", "账户已验证。诊所队列和 CMS 连接尚未配置。"));
    } catch {
      setConnectionMessage(text("Connection check failed. Please try again.", "连接检查失败。请重试。"));
    } finally {
      setChecking(false);
    }
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
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Activity className="h-5 w-5" aria-hidden="true" /></span>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-tight">ClynicQ</h1>
              <p className="text-xs text-muted-foreground">{text("Clinic Portal", "诊所门户")}</p>
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
          <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h2 className="text-base font-semibold">{text("Clinic not linked", "尚未关联诊所")}</h2></div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" />{text("Secure portal", "安全门户")}</span>
        </div>

        <section aria-labelledby="queue-heading" className="overflow-hidden rounded-lg border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
            <h2 id="queue-heading" className="text-sm font-semibold">{text("Live Queue Control", "实时队列控制")}</h2>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Unplug className="h-3.5 w-3.5" />{text("Not connected", "未连接")}</span>
          </div>
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{text("Live queue status", "实时队列状态")}</p>
                <div className="mt-2 flex items-center gap-2.5"><span className="h-3 w-3 rounded-full bg-status-cancelled" /><p className="text-xl font-semibold">{text("Unavailable", "暂不可用")}</p></div>
                <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{text("Connect your clinic queue to view and change its status on ClynicQ.", "连接诊所队列后，即可在 ClynicQ 查看和更改其状态。")}</p>
              </div>
              <Button disabled={!queueAvailable} variant="outline" className="h-11 w-full shrink-0 gap-2 sm:w-auto"><CircleHelp />{text("Queue unavailable", "队列暂不可用")}</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <p className="text-xs text-muted-foreground">{text("Last successful status update: —", "最近成功更新状态：—")}</p>
              <Button variant="ghost" size="sm" className="h-10 gap-1.5 px-2 text-primary" onClick={checkConnection} disabled={checking}>{checking ? <Loader2 className="animate-spin" /> : <RefreshCw />}{text("Check connection", "检查连接")}</Button>
            </div>
            {connectionMessage && <p role="status" className="mt-2 text-xs text-muted-foreground">{connectionMessage}</p>}
          </div>
        </section>

        <section aria-labelledby="records-heading" className="overflow-hidden rounded-lg border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
            <h2 id="records-heading" className="text-base font-semibold">{text("ClynicQ Patient Records", "ClynicQ 患者记录")}</h2>
            <Button variant="outline" size="sm" disabled={!recordsAvailable} className="h-10 gap-1.5"><ArrowDownToLine />{text("Download CSV", "下载 CSV")}</Button>
          </div>
          <div className="px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input disabled={!recordsAvailable} aria-label={text("Search by patient name", "按患者姓名搜索")} placeholder={text("Search patient name", "搜索患者姓名")} className="h-11 pl-9 text-sm" /></div>
              <Select defaultValue="30" disabled={!recordsAvailable}><SelectTrigger className="h-11 w-full gap-2 text-sm sm:w-48" aria-label={text("Date filter", "日期筛选")}><CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">{text("Last 30 days", "最近30天")}</SelectItem></SelectContent></Select>
            </div>
          </div>
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-3 border-y bg-muted/40 px-5 py-3 text-xs font-medium text-muted-foreground md:grid">
            <span>{text("Patient name", "患者姓名")}</span><span>{text("Visit / appt. date", "就诊／预约日期")}</span><span>{text("Queue number", "队列号码")}</span><span>{text("Arrival / appt. time", "抵达／预约时间")}</span><span>{text("Status", "状态")}</span>
          </div>
          <div className="flex flex-col items-center px-5 py-7 text-center sm:py-10">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted"><FileSearch className="h-6 w-6 text-muted-foreground" /></span>
            <h3 className="text-base font-semibold">{text("CMS records unavailable", "CMS 记录暂不可用")}</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{text("An SGiMED or PLATO connection with verified ClynicQ source attribution is required to display patient records.", "需要连接 SGiMED 或 PLATO，并验证患者来源为 ClynicQ，才能显示患者记录。")}</p>
            <p className="mt-3 text-xs text-muted-foreground">{text("No patient records have been imported.", "尚未导入任何患者记录。")}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground sm:px-5"><span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" />{text("Last successful CMS sync: —", "最近成功 CMS 同步：—")}</span><span>{text("0 records", "0 条记录")}</span></div>
        </section>
      </main>

      <Dialog open={preference !== null} onOpenChange={(open) => { if (!open) setPreference(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{preference ? preferenceTitle[preference] : text("Settings", "设置")}</DialogTitle><DialogDescription>{text("Clinic Portal", "诊所门户")}</DialogDescription></DialogHeader>
          {preference === "clinic" && <div className="space-y-3"><Label>{text("Clinic name", "诊所名称")}</Label><p className="text-sm font-medium">{text("Clinic not linked", "尚未关联诊所")}</p><p className="text-sm text-muted-foreground">{text("No verified clinic is associated with this account. Clinic information will appear once account mapping is configured.", "该账户尚未关联已验证的诊所。配置账户关联后，将显示诊所信息。")}</p></div>}
          {preference === "language" && <div className="flex gap-2">{(["en", "zh"] as const).map((value) => <Button key={value} variant={lang === value ? "default" : "outline"} aria-pressed={lang === value} onClick={() => setLang(value)} className="h-11 flex-1">{value === "en" ? "English" : "中文"}{lang === value && <Check />}</Button>)}</div>}
          {preference === "account" && <div className="space-y-4"><div><Label>{text("Email", "邮箱")}</Label><p className="mt-1 break-all text-sm">{user?.email}</p></div><Button variant="outline" className="h-11 gap-2" onClick={() => { void signOut(); }}><LogOut />{text("Sign out", "退出登录")}</Button></div>}
          {preference === "billing" && isAdmin && <div className="space-y-4"><div className="flex items-center justify-between border-b pb-3"><div><p className="text-xs text-muted-foreground">{text("Current plan", "当前方案")}</p><p className="mt-1 font-semibold">Basic</p></div><span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{text("Demo", "演示")}</span></div><p className="text-sm text-muted-foreground">{text("No payment service is connected. Subscription and payment changes are unavailable.", "尚未连接付款服务。目前无法更改订阅或付款信息。")}</p><Button variant="outline" disabled className="h-11 w-full"><CreditCard />{text("Update payment details", "更新付款信息")}</Button></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}