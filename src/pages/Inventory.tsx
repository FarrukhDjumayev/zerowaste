import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useInventoryStore, FoodItem } from "@/stores/inventoryStore";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { FoodItemCard } from "@/components/ui/food-item-card";
import { differenceInDays, format, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InventoryPage() {
  const { t } = useTranslation();
  const { items, setItems, addItem, updateItem, removeItem, filter, setFilter, isLoading, setLoading } = useInventoryStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    unit: "piece",
    category: "other",
    expiry_date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    freshness_score: 100,
  });

  const categories = ["fruits", "vegetables", "dairy", "meat", "grains", "other"];
  const units = ["piece", "kg", "liter", "pack"];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingItem) {
      const { error } = await supabase
        .from("food_items")
        .update(formData)
        .eq("id", editingItem.id);

      if (error) {
        toast({ title: t("inventory.toast.updateError"), variant: "destructive" });
      } else {
        updateItem(editingItem.id, formData);
        toast({ title: t("inventory.toast.updated") });
      }
    } else {
      const { data, error } = await supabase
        .from("food_items")
        .insert({ ...formData, user_id: user.id })
        .select()
        .single();

      if (error) {
        toast({ title: t("inventory.toast.addError"), variant: "destructive" });
      } else if (data) {
        addItem(data as FoodItem);
        toast({ title: t("inventory.toast.added") });
      }
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      expiry_date: item.expiry_date,
      freshness_score: item.freshness_score,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("food_items").delete().eq("id", id);
    
    if (error) {
      toast({ title: t("inventory.toast.deleteError"), variant: "destructive" });
    } else {
      removeItem(id);
      toast({ title: t("inventory.toast.deleted") });
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      quantity: 1,
      unit: "piece",
      category: "other",
      expiry_date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      freshness_score: 100,
    });
  };

  const today = new Date();
  const filteredItems = items.filter((item) => {
    const days = differenceInDays(new Date(item.expiry_date), today);
    
    switch (filter) {
      case "fresh":
        return days > 3;
      case "expiring":
        return days >= 0 && days <= 3;
      case "expired":
        return days < 0;
      default:
        return true;
    }
  });

  const filterLabels: Record<string, string> = {
    all: t("inventory.filters.all"),
    fresh: t("inventory.filters.fresh"),
    expiring: t("inventory.filters.expiring"),
    expired: t("inventory.filters.expired"),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{t("inventory.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {t("inventory.subtitle")}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              {t("inventory.addItem")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? t("inventory.form.editItem") : t("inventory.form.addNewItem")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("inventory.form.name")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("inventory.form.namePlaceholder")}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">{t("inventory.form.quantity")}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">{t("inventory.form.unit")}</Label>
                  <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {t(`inventory.units.${unit}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="category">{t("inventory.form.category")}</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`inventory.categories.${cat}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiry_date">{t("inventory.form.expiryDate")}</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="freshness">{t("inventory.form.freshnessScore")}: {formData.freshness_score}%</Label>
                <input
                  id="freshness"
                  type="range"
                  min={0}
                  max={100}
                  value={formData.freshness_score}
                  onChange={(e) => setFormData({ ...formData, freshness_score: parseInt(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>

              <Button type="submit" className="w-full gradient-primary">
                {editingItem ? t("inventory.form.updateItem") : t("inventory.addItem")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {Object.entries(filterLabels).map(([value, label]) => (
          <Button
            key={value}
            variant={filter === value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(value as typeof filter)}
            className="rounded-full whitespace-nowrap shrink-0"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredItems.length > 0 ? (
        <motion.div layout className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-muted mb-4 sm:mb-6">
            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
            {t("inventory.emptyState.title")}
          </h3>
          <p className="text-muted-foreground max-w-sm text-sm sm:text-base">
            {filter === "all"
              ? t("inventory.emptyState.emptyInventory")
              : t("inventory.emptyState.noFilterResults", { filter: filterLabels[filter].toLowerCase() })}
          </p>
        </div>
      )}
    </motion.div>
  );
}
