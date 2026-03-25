import { Activity } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "@/hooks/useI18n";

export const QueueHeader = () => {
  const { t } = useI18n();

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("dashboardTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("dashboardSubtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
