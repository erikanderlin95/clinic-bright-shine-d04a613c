import { Activity } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "@/hooks/useI18n";

export const QueueHeader = () => {
  const { t } = useI18n();

  return (
    <header className="border-b border-border bg-card px-3 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary sm:flex">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl font-bold text-foreground">{t("dashboardTitle")}</h1>
            <p className="hidden text-sm text-muted-foreground sm:block">{t("dashboardSubtitle")}</p>
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <UserMenu />
        </div>
        <p className="w-full text-xs text-muted-foreground sm:hidden">{t("dashboardSubtitle")}</p>
      </div>
    </header>
  );
};
