import { motion } from "framer-motion";
import { Clock, Users, ChefHat, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  cooking_steps: string[];
  dietary_tags: string[];
  prep_time: number;
  servings: number;
  image_url?: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    // Mock TTS - in production, this would use Web Speech API or a TTS service
    if (!isPlaying) {
      const utterance = new SpeechSynthesisUtterance(
        `Recipe: ${recipe.title}. Ingredients: ${recipe.ingredients.join(", ")}. Steps: ${recipe.cooking_steps.join(". ")}`
      );
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    } else {
      speechSynthesis.cancel();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg cursor-pointer"
    >
      <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="flex h-full items-center justify-center">
          <ChefHat className="h-16 w-16 text-primary/30" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2">
            {recipe.title}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 shrink-0",
              isPlaying && "text-primary"
            )}
            onClick={handleAudioToggle}
          >
            {isPlaying ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {recipe.prep_time} min
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {recipe.servings} servings
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {recipe.dietary_tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full text-xs capitalize"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {recipe.ingredients.length} ingredients
            </span>{" "}
            • {recipe.cooking_steps.length} steps
          </p>
        </div>
      </div>
    </motion.div>
  );
}
