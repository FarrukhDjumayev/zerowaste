-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  dietary_preferences TEXT[] DEFAULT '{}',
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create food_items table for inventory
CREATE TABLE public.food_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'piece',
  expiry_date DATE NOT NULL,
  freshness_score INTEGER DEFAULT 100 CHECK (freshness_score >= 0 AND freshness_score <= 100),
  category TEXT DEFAULT 'other',
  image_url TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  cooking_steps JSONB NOT NULL DEFAULT '[]',
  dietary_tags TEXT[] DEFAULT '{}',
  prep_time INTEGER DEFAULT 30,
  servings INTEGER DEFAULT 4,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Food items policies
CREATE POLICY "Users can view their own food items" 
ON public.food_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own food items" 
ON public.food_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food items" 
ON public.food_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food items" 
ON public.food_items FOR DELETE USING (auth.uid() = user_id);

-- Recipes are public (for MVP)
CREATE POLICY "Anyone can view recipes" 
ON public.recipes FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_items_updated_at
BEFORE UPDATE ON public.food_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert seed recipes
INSERT INTO public.recipes (title, ingredients, cooking_steps, dietary_tags, prep_time, servings) VALUES
('Quick Veggie Stir Fry', '["2 cups mixed vegetables", "2 tbsp soy sauce", "1 tbsp sesame oil", "2 cloves garlic", "1 tbsp ginger"]', '["Heat oil in a wok", "Add garlic and ginger, stir 30 seconds", "Add vegetables, stir fry 5-7 minutes", "Add soy sauce and serve"]', '{"vegan", "quick", "healthy"}', 15, 2),
('Mediterranean Salad', '["2 cups mixed greens", "1/2 cup cherry tomatoes", "1/4 cup feta cheese", "1/4 cup olives", "2 tbsp olive oil"]', '["Wash and dry greens", "Halve the tomatoes", "Combine all ingredients", "Drizzle with olive oil and serve"]', '{"vegetarian", "keto", "quick"}', 10, 2),
('Banana Oat Pancakes', '["2 ripe bananas", "2 eggs", "1 cup oats", "1/2 tsp cinnamon", "1 tbsp honey"]', '["Blend oats into flour", "Mash bananas and mix with eggs", "Combine all ingredients", "Cook on medium heat until golden"]', '{"vegetarian", "healthy"}', 20, 4),
('Leftover Fried Rice', '["3 cups cooked rice", "2 eggs", "1 cup mixed vegetables", "3 tbsp soy sauce", "2 green onions"]', '["Scramble eggs, set aside", "Stir fry vegetables", "Add rice and soy sauce", "Mix in eggs and garnish with onions"]', '{"quick", "budget-friendly"}', 15, 3);