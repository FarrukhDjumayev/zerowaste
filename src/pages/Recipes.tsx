import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ChefHat, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecipeCard, Recipe } from "@/components/ui/recipe-card";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RecipesPage() {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*");

    if (!error && data) {
      const formattedRecipes = data.map((r) => ({
        id: r.id,
        title: r.title,
        ingredients: r.ingredients as string[],
        cooking_steps: r.cooking_steps as string[],
        dietary_tags: r.dietary_tags || [],
        prep_time: r.prep_time || 30,
        servings: r.servings || 4,
        image_url: r.image_url,
      }));
      setRecipes(formattedRecipes);
    }
    setIsLoading(false);
  };

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{t("recipes.title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          {t("recipes.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : recipes.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {recipes.map((recipe) => (
            <motion.div key={recipe.id} variants={itemVariant}>
              <RecipeCard recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10 mb-4 sm:mb-6">
            <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
            {t("recipes.emptyState.title")}
          </h3>
          <p className="text-muted-foreground max-w-sm text-sm sm:text-base">
            {t("recipes.emptyState.description")}
          </p>
        </div>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl sm:text-2xl">
                  {selectedRecipe.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.dietary_tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full capitalize text-xs sm:text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                  <span>⏱️ {selectedRecipe.prep_time} {t("recipes.details.minutes")}</span>
                  <span>👥 {selectedRecipe.servings} {t("recipes.details.servings")}</span>
                </div>

                <div>
                  <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
                    {t("recipes.details.ingredients")}
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-foreground text-sm sm:text-base">
                        <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary shrink-0" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
                    {t("recipes.details.instructions")}
                  </h3>
                  <ol className="space-y-3 sm:space-y-4">
                    {selectedRecipe.cooking_steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 sm:gap-4">
                        <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm">
                          {idx + 1}
                        </span>
                        <p className="text-foreground pt-0.5 sm:pt-1 text-sm sm:text-base">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
