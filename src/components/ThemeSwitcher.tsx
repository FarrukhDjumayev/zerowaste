import { useTranslation } from "react-i18next";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ThemeSwitcherProps {
  variant?: "default" | "compact";
}

export function ThemeSwitcher({ variant = "default" }: ThemeSwitcherProps) {
  const { t } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes = [
    { value: "light", label: t("common.light"), icon: Sun },
    { value: "dark", label: t("common.dark"), icon: Moon },
    { value: "system", label: t("common.system"), icon: Monitor },
  ] as const;

  if (variant === "compact") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="h-9 w-9"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}>
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          {theme === "light" && <Sun className="h-4 w-4" />}
          {theme === "dark" && <Moon className="h-4 w-4" />}
          {theme === "system" && <Monitor className="h-4 w-4" />}
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {themes.map((t) => (
          <SelectItem key={t.value} value={t.value}>
            <div className="flex items-center gap-2">
              <t.icon className="h-4 w-4" />
              {t.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
