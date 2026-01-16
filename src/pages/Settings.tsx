import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, Bell, Utensils, Loader2, Palette, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface Profile {
  id: string;
  full_name: string | null;
  dietary_preferences: string[];
  notification_enabled: boolean;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  const dietaryOptions = [
    { key: "vegetarian", label: t("settings.dietary.options.vegetarian") },
    { key: "vegan", label: t("settings.dietary.options.vegan") },
    { key: "keto", label: t("settings.dietary.options.keto") },
    { key: "halal", label: t("settings.dietary.options.halal") },
    { key: "kosher", label: t("settings.dietary.options.kosher") },
    { key: "gluten-free", label: t("settings.dietary.options.glutenFree") },
    { key: "dairy-free", label: t("settings.dietary.options.dairyFree") },
    { key: "nut-free", label: t("settings.dietary.options.nutFree") },
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setNotifications(data.notification_enabled);
      setSelectedDietary(data.dietary_preferences || []);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        notification_enabled: notifications,
        dietary_preferences: selectedDietary,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: t("settings.toast.error"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("settings.toast.saved"),
      });
    }

    setIsSaving(false);
  };

  const toggleDietary = (option: string) => {
    setSelectedDietary((prev) =>
      prev.includes(option)
        ? prev.filter((d) => d !== option)
        : [...prev, option]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-6 sm:space-y-8"
    >
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h2 className="font-display text-base sm:text-lg font-semibold text-foreground">
            {t("settings.profile.title")}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">{t("settings.profile.email")}</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="fullName">{t("settings.profile.fullName")}</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("settings.profile.fullNamePlaceholder")}
            />
          </div>
        </div>
      </motion.div>

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h2 className="font-display text-base sm:text-lg font-semibold text-foreground">
            {t("settings.appearance.title")}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
          {t("settings.appearance.description")}
        </p>

        <ThemeSwitcher />
      </motion.div>

      {/* Language Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h2 className="font-display text-base sm:text-lg font-semibold text-foreground">
            {t("settings.language.title")}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
          {t("settings.language.description")}
        </p>

        <LanguageSwitcher />
      </motion.div>

      {/* Dietary Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h2 className="font-display text-base sm:text-lg font-semibold text-foreground">
            {t("settings.dietary.title")}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
          {t("settings.dietary.description")}
        </p>

        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((option) => (
            <Badge
              key={option.key}
              variant={selectedDietary.includes(option.key) ? "default" : "outline"}
              className="cursor-pointer rounded-full px-3 sm:px-4 py-1 sm:py-1.5 transition-colors text-xs sm:text-sm"
              onClick={() => toggleDietary(option.key)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h2 className="font-display text-base sm:text-lg font-semibold text-foreground">
            {t("settings.notifications.title")}
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground text-sm sm:text-base">{t("settings.notifications.expiryReminders")}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("settings.notifications.expiryDescription")}
            </p>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
      </motion.div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full gradient-primary h-11 sm:h-12"
        size="lg"
      >
        {isSaving ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          t("settings.saveChanges")
        )}
      </Button>
    </motion.div>
  );
}
