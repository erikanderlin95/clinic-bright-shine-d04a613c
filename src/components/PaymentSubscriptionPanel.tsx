import { useState } from "react";
import { CreditCard, Check, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useI18n } from "@/hooks/useI18n";
import { currentSubscriptionPlan, subscriptionPlans } from "@/lib/subscription-plans";

export const PaymentSubscriptionPanel = () => {
  const { lang } = useI18n();
  const zh = lang === "zh";
  const [dialog, setDialog] = useState<string | null>(null);
  const current = subscriptionPlans.find(plan => plan.id === currentSubscriptionPlan);
  return (
    <section className="space-y-8" aria-labelledby="payment-heading">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 id="payment-heading" className="text-xl font-semibold text-foreground">{zh ? "付款与订阅" : "Payment & Subscription"}</h3>
        <Badge variant="secondary">{zh ? "演示" : "Demo"}</Badge>
      </div>
      <div className="flex items-center justify-between gap-6 flex-wrap border-y border-border py-7">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{zh ? "当前计划" : "Current Plan"}</p>
          <p className="text-2xl font-semibold text-foreground">{current?.name}</p>
        </div>
        <Badge className="gap-1.5"><Check className="h-4 w-4" />{zh ? "当前计划" : "Current Plan"}</Badge>
      </div>
      <div className="flex items-center justify-between gap-5 flex-wrap">
        <div className="flex items-center gap-4">
          <CreditCard className="h-6 w-6 shrink-0 text-primary" />
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-foreground">{zh ? "付款详情" : "Payment Details"}</h4>
            <p className="text-sm text-muted-foreground">{zh ? "尚未连接付款方式。" : "No payment method connected."}</p>
          </div>
        </div>
        <Button variant="outline" className="whitespace-normal h-auto min-h-10" onClick={() => setDialog("payment")}>
          <CreditCard className="mr-2 h-4 w-4 shrink-0" />{zh ? "更新付款详情" : "Update Payment Details"}
        </Button>
      </div>
      <div className="space-y-4 border-t border-border pt-7">
        <h4 className="text-base font-semibold text-foreground">{zh ? "订阅计划" : "Subscription Plans"}</h4>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {subscriptionPlans.map(plan => {
            const isCurrent = plan.id === currentSubscriptionPlan;
            return (
              <article key={plan.id} className={`min-w-0 rounded-lg border p-4 sm:p-6 flex flex-col gap-5 ${isCurrent ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h5 className="text-lg font-semibold text-foreground">{plan.name}</h5>
                  {isCurrent && <Badge variant="secondary">{zh ? "当前" : "Current"}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{zh ? "价格尚未设置" : "Pricing not set"}</p>
                <Button variant={isCurrent ? "outline" : "default"} className="mt-auto w-full" disabled={isCurrent} onClick={() => setDialog(plan.name)}>
                  {isCurrent ? (zh ? "当前计划" : "Current Plan") : (zh ? "查看计划" : "View Plan")}
                  {!isCurrent && <ArrowUpRight className="ml-2 h-4 w-4" />}
                </Button>
              </article>
            );
          })}
        </div>
      </div>
      <Dialog open={dialog !== null} onOpenChange={open => { if (!open) setDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "payment" ? (zh ? "更新付款详情" : "Update Payment Details") : dialog}</DialogTitle>
            <DialogDescription>{dialog === "payment"
              ? (zh ? "此演示尚未连接付款服务，无法更新银行卡详情。" : "Payment services are not connected in this demo. Card details cannot be updated yet.")
              : (zh ? "此计划的价格和权益尚未设置。您的当前计划仍为 Basic。" : "Pricing and inclusions for this tier have not been set. Your current plan remains Basic.")}</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(null)}>{zh ? "关闭" : "Close"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};