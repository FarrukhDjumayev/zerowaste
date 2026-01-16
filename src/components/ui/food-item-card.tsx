import { motion } from "framer-motion";
import { Trash2, Edit2, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@/stores/inventoryStore";
import { differenceInDays, format } from "date-fns";

interface FoodItemCardProps {
  item: FoodItem;
  onEdit?: (item: FoodItem) => void;
  onDelete?: (id: string) => void;
}

export function FoodItemCard({ item, onEdit, onDelete }: FoodItemCardProps) {
  const today = new Date();
  const expiryDate = new Date(item.expiry_date);
  const daysUntilExpiry = differenceInDays(expiryDate, today);

  const getExpiryStatus = () => {
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 3) return "expiring";
    return "fresh";
  };

  const status = getExpiryStatus();

  const statusStyles = {
    fresh: {
      bg: "bg-success/5 border-success/20",
      badge: "bg-success/10 text-success",
      icon: CheckCircle,
    },
    expiring: {
      bg: "bg-warning/5 border-warning/20",
      badge: "bg-warning/10 text-warning",
      icon: AlertTriangle,
    },
    expired: {
      bg: "bg-destructive/5 border-destructive/20",
      badge: "bg-destructive/10 text-destructive",
      icon: AlertTriangle,
    },
  };

  const StatusIcon = statusStyles[status].icon;

  const getExpiryText = () => {
    if (daysUntilExpiry < 0) return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    if (daysUntilExpiry === 0) return "Expires today!";
    if (daysUntilExpiry === 1) return "Expires tomorrow";
    return `${daysUntilExpiry} days left`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-lg",
        statusStyles[status].bg
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusStyles[status].badge
            )}>
              <StatusIcon className="h-3 w-3" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className="text-xs text-muted-foreground capitalize">{item.category}</span>
          </div>
          
          <h3 className="font-semibold text-lg text-foreground truncate">{item.name}</h3>
          
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{item.quantity} {item.unit}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {getExpiryText()}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Freshness</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.freshness_score}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={cn(
                    "h-full rounded-full",
                    item.freshness_score >= 70 ? "bg-success" :
                    item.freshness_score >= 40 ? "bg-warning" : "bg-destructive"
                  )}
                />
              </div>
              <span className="text-xs font-medium">{item.freshness_score}%</span>
            </div>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Expires: {format(expiryDate, "MMM d, yyyy")}
          </p>
        </div>

        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit?.(item)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete?.(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
