import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Package, AlertTriangle, CheckCircle, TrendingUp, Leaf, ChefHat, Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { useInventoryStore, FoodItem } from "@/stores/inventoryStore";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { FoodItemCard } from "@/components/ui/food-item-card";
import { differenceInDays } from "date-fns";

export default function Dashboard() {
  const { t } = useTranslation();
  const { items, setItems, setLoading } = useInventoryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("food_items")
      .select("*")
      .order("expiry_date", { ascending: true });

    if (!error && data) {
      setItems(data as FoodItem[]);
    }
    setLoading(false);
  };

  const today = new Date();
  const freshItems = items.filter((item) => differenceInDays(new Date(item.expiry_date), today) > 3);
  const expiringItems = items.filter((item) => {
    const days = differenceInDays(new Date(item.expiry_date), today);
    return days >= 0 && days <= 3;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 md:space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariant} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/scan")} className="gradient-primary gap-2 w-full sm:w-auto">
            <Scan className="h-4 w-4" />
            {t("dashboard.scanFood")}
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariant} className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.stats.totalItems")}
          value={items.length}
          subtitle={t("dashboard.stats.inInventory")}
          icon={Package}
          variant="default"
        />
        <StatCard
          title={t("dashboard.stats.freshItems")}
          value={freshItems.length}
          subtitle={t("dashboard.stats.safeToConsume")}
          icon={CheckCircle}
          variant="success"
          trend={{ value: 12, label: t("dashboard.stats.vsLastWeek") }}
        />
        <StatCard
          title={t("dashboard.stats.expiringSoon")}
          value={expiringItems.length}
          subtitle={t("dashboard.stats.within3Days")}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title={t("dashboard.stats.wastePrevented")}
          value="2.5kg"
          subtitle={t("dashboard.stats.thisMonth")}
          icon={Leaf}
          variant="default"
          trend={{ value: 8, label: t("dashboard.stats.improvement") }}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariant} className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/scan")}
          className="group cursor-pointer rounded-2xl border border-border bg-card p-4 sm:p-6 transition-all hover:shadow-lg hover:border-primary/20"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 sm:mb-4">
            <Scan className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{t("dashboard.quickActions.scanNew")}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("dashboard.quickActions.scanDesc")}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/recipes")}
          className="group cursor-pointer rounded-2xl border border-border bg-card p-4 sm:p-6 transition-all hover:shadow-lg hover:border-accent/20"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-3 sm:mb-4">
            <ChefHat className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{t("dashboard.quickActions.getRecipes")}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("dashboard.quickActions.recipesDesc")}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/inventory")}
          className="group cursor-pointer rounded-2xl border border-border bg-card p-4 sm:p-6 transition-all hover:shadow-lg hover:border-success/20 sm:col-span-2 lg:col-span-1"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-success/10 text-success mb-3 sm:mb-4">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{t("dashboard.quickActions.viewInventory")}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("dashboard.quickActions.inventoryDesc")}
          </p>
        </motion.div>
      </motion.div>

      {/* Expiring Soon Section */}
      {expiringItems.length > 0 && (
        <motion.div variants={itemVariant}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
                {t("dashboard.expiringSection.title")}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>
              {t("dashboard.expiringSection.viewAll")}
            </Button>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {expiringItems.slice(0, 3).map((item) => (
              <FoodItemCard key={item.id} item={item} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <motion.div
          variants={itemVariant}
          className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4"
        >
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10 mb-4 sm:mb-6">
            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
            {t("dashboard.emptyState.title")}
          </h3>
          <p className="text-muted-foreground max-w-sm mb-4 sm:mb-6 text-sm sm:text-base">
            {t("dashboard.emptyState.description")}
          </p>
          <Button onClick={() => navigate("/scan")} className="gradient-primary gap-2">
            <Scan className="h-4 w-4" />
            {t("dashboard.emptyState.button")}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
