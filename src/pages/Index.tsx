import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Leaf, ArrowRight, Scan, Package, ChefHat, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function LandingPage() {
  const { t } = useTranslation();
  const { user, initialize, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  const features = [
    {
      icon: Scan,
      title: t("landing.features.scanning.title"),
      description: t("landing.features.scanning.description"),
    },
    {
      icon: Package,
      title: t("landing.features.inventory.title"),
      description: t("landing.features.inventory.description"),
    },
    {
      icon: ChefHat,
      title: t("landing.features.recipes.title"),
      description: t("landing.features.recipes.description"),
    },
    {
      icon: TrendingUp,
      title: t("landing.features.analytics.title"),
      description: t("landing.features.analytics.description"),
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Navigation */}
      <nav className="container mx-auto flex items-center justify-between p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl gradient-primary">
            <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold text-foreground">{t("common.appName")}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <LanguageSwitcher variant="compact" />
          <ThemeSwitcher variant="compact" />
          <Link to="/auth">
            <Button variant="outline" className="rounded-full text-sm sm:text-base">
              {t("common.signIn")}
            </Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-primary mb-6 sm:mb-8"
          >
            <Leaf className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{t("landing.hero.badge")}</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6"
          >
            {t("landing.hero.title1")}
            <br />
            <span className="text-primary">{t("landing.hero.title2")}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-4"
          >
            {t("landing.hero.description")}
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="gradient-primary rounded-full px-6 sm:px-8 gap-2 text-sm sm:text-base w-full">
                {t("landing.hero.cta")}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto">
              {t("landing.hero.watchDemo")}
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={item}
            className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-16 border-t border-border max-w-2xl mx-auto"
          >
            {[
              { value: "40%", label: t("landing.stats.lessWaste") },
              { value: "$200+", label: t("landing.stats.savedMonthly") },
              { value: "25K+", label: t("landing.stats.activeUsers") },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-border bg-card p-4 sm:p-6 transition-all hover:shadow-lg hover:border-primary/20"
            >
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 sm:mb-4 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl sm:rounded-3xl gradient-primary p-6 sm:p-8 lg:p-12 text-center"
        >
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 sm:mb-4">
            {t("landing.cta.title")}
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
            {t("landing.cta.description")}
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="rounded-full px-6 sm:px-8 gap-2 text-sm sm:text-base">
              {t("landing.cta.button")}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="font-display font-semibold text-foreground text-sm sm:text-base">{t("common.appName")}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            © 2024 {t("common.appName")}. {t("landing.footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
