import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { Languages } from "lucide-react";

export const LanguageToggle = () => {
  const { lang, setLang } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "en" ? "zh" : "en")}
      className="gap-1.5 text-muted-foreground"
    >
      <Languages className="h-4 w-4" />
      {lang === "en" ? "中文" : "EN"}
    </Button>
  );
};
