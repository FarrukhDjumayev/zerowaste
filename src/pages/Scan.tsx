import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Loader2, CheckCircle, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useInventoryStore, FoodItem } from "@/stores/inventoryStore";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from "date-fns";

interface ScanResult {
  food_name: string;
  freshness_score: number;
  expiry_estimate_days: number;
  category: string;
}

// Mock AI scanning function
const mockAIScan = async (): Promise<ScanResult> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  const foods = [
    { food_name: "Apple", category: "fruits", freshness_score: 85, expiry_estimate_days: 7 },
    { food_name: "Banana", category: "fruits", freshness_score: 70, expiry_estimate_days: 4 },
    { food_name: "Milk", category: "dairy", freshness_score: 90, expiry_estimate_days: 5 },
    { food_name: "Bread", category: "grains", freshness_score: 60, expiry_estimate_days: 3 },
    { food_name: "Chicken Breast", category: "meat", freshness_score: 95, expiry_estimate_days: 2 },
    { food_name: "Spinach", category: "vegetables", freshness_score: 75, expiry_estimate_days: 4 },
    { food_name: "Yogurt", category: "dairy", freshness_score: 88, expiry_estimate_days: 10 },
    { food_name: "Tomatoes", category: "vegetables", freshness_score: 80, expiry_estimate_days: 5 },
  ];

  return foods[Math.floor(Math.random() * foods.length)];
};

export default function ScanPage() {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { addItem } = useInventoryStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      toast({
        title: t("scan.errors.cameraAccess"),
        description: t("scan.errors.cameraDescription"),
        variant: "destructive",
      });
    }
  }, [toast, t]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const handleCapture = async () => {
    setIsScanning(true);
    
    try {
      const result = await mockAIScan();
      setScanResult(result);
      stopCamera();
    } catch (err) {
      toast({
        title: t("scan.errors.scanFailed"),
        description: t("scan.errors.scanDescription"),
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveItem = async () => {
    if (!scanResult || !user) return;

    setIsSaving(true);
    
    const expiryDate = addDays(new Date(), scanResult.expiry_estimate_days);
    
    const newItem = {
      user_id: user.id,
      name: scanResult.food_name,
      quantity,
      unit: "piece",
      expiry_date: format(expiryDate, "yyyy-MM-dd"),
      freshness_score: scanResult.freshness_score,
      category: scanResult.category,
      scanned_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("food_items")
      .insert(newItem)
      .select()
      .single();

    if (error) {
      toast({
        title: t("scan.errors.saveFailed"),
        description: t("scan.errors.saveDescription"),
        variant: "destructive",
      });
    } else if (data) {
      addItem(data as FoodItem);
      toast({
        title: t("scan.success.itemAdded"),
        description: `${scanResult.food_name} ${t("scan.success.itemAddedDesc")}`,
      });
      handleReset();
    }

    setIsSaving(false);
  };

  const handleReset = () => {
    setScanResult(null);
    setQuantity(1);
    setIsCameraActive(false);
  };

  const getFreshnessColor = (score: number) => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-6 sm:space-y-8"
    >
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{t("scan.title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          {t("scan.subtitle")}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isCameraActive && !scanResult && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4"
          >
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-primary/10 mb-4 sm:mb-6">
              <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            </div>
            <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
              {t("scan.ready.title")}
            </h2>
            <p className="text-muted-foreground max-w-sm mb-6 sm:mb-8 text-sm sm:text-base">
              {t("scan.ready.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Button onClick={startCamera} className="gradient-primary gap-2 w-full sm:w-auto" size="lg">
                <Camera className="h-5 w-5" />
                {t("scan.ready.openCamera")}
              </Button>
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                <Upload className="h-5 w-5" />
                {t("scan.ready.uploadImage")}
              </Button>
            </div>
          </motion.div>
        )}

        {isCameraActive && !scanResult && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl sm:rounded-2xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-36 w-36 sm:h-48 sm:w-48 border-2 border-primary/50 rounded-xl sm:rounded-2xl animate-pulse" />
              </div>

              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="flex flex-col items-center gap-3 sm:gap-4 text-primary-foreground">
                    <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin" />
                    <p className="font-medium text-sm sm:text-base">{t("scan.scanning.analyzing")}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 sm:gap-4">
              <Button
                onClick={handleCapture}
                disabled={isScanning}
                className="gradient-primary gap-2 flex-1 sm:flex-none"
                size="lg"
              >
                {isScanning ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
                {isScanning ? t("scan.scanning.analyzing") : t("scan.scanning.capture")}
              </Button>
              <Button variant="outline" size="lg" onClick={stopCamera}>
                {t("common.cancel")}
              </Button>
            </div>
          </motion.div>
        )}

        {scanResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Result Card */}
            <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">
                    {t("scan.result.identified")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("scan.result.analysisComplete")}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-2">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t("scan.result.foodItem")}</p>
                  <p className="text-xl sm:text-2xl font-display font-bold text-foreground">
                    {scanResult.food_name}
                  </p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t("scan.result.category")}</p>
                  <p className="text-base sm:text-lg font-medium text-foreground capitalize">
                    {scanResult.category}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t("scan.result.freshnessScore")}</p>
                  <div className="flex items-center gap-3">
                    <p className={`text-2xl sm:text-3xl font-bold ${getFreshnessColor(scanResult.freshness_score)}`}>
                      {scanResult.freshness_score}%
                    </p>
                    <div className="flex-1 h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scanResult.freshness_score}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${
                          scanResult.freshness_score >= 70 ? "bg-success" :
                          scanResult.freshness_score >= 40 ? "bg-warning" : "bg-destructive"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t("scan.result.estimatedExpiry")}</p>
                  <p className="text-base sm:text-lg font-medium text-foreground">
                    {scanResult.expiry_estimate_days} {t("scan.result.days")}
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                <Label htmlFor="quantity" className="mb-2 block text-sm">
                  {t("scan.result.quantity")}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-24 sm:w-32 h-10 sm:h-12 text-center text-base sm:text-lg rounded-xl"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleSaveItem}
                disabled={isSaving}
                className="flex-1 gradient-primary gap-2"
                size="lg"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                {t("scan.result.addToInventory")}
              </Button>
              <Button variant="outline" size="lg" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-5 w-5" />
                {t("scan.result.scanAgain")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
