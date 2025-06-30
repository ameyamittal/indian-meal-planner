// Enhanced Indian Meal Planner App JavaScript

class MealPlanner {
    constructor() {
        this.ingredients = [];
        this.ingredientQuantities = {}; // Store quantities for each ingredient
        this.mealPlanData = {};
        this.favorites = [];
        this.dietaryPreferences = {
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            lowCarb: false
        };
        this.mealDatabase = this.initializeMealDatabase();
        
        this.initializeApp();
        this.loadFromLocalStorage();
        this.setupEventListeners();
        
        // Add sample data for demonstration
        this.addSampleData();
    }

    addSampleData() {
        // Add some sample Indian ingredients by checking the checkboxes
        const sampleIngredients = ['rice', 'dal', 'potatoes', 'tomatoes', 'onions', 'garlic', 'ginger', 'chicken', 'yogurt'];
        
        sampleIngredients.forEach(ingredient => {
            const checkbox = document.querySelector(`input[value="${ingredient}"]`);
            if (checkbox) {
                checkbox.checked = true;
                this.addIngredient(ingredient);
            }
        });
    }

    initializeApp() {
        this.ingredientsList = document.getElementById('ingredientsList');
        this.generateMealsBtn = document.getElementById('generateMealsBtn');
        this.mealPlanSection = document.getElementById('mealPlanSection');
        this.mealPlanContainer = document.getElementById('mealPlan');
        this.clearMealPlanBtn = document.getElementById('clearMealPlanBtn');
        this.shoppingListSection = document.getElementById('shoppingListSection');
        this.shoppingList = document.getElementById('shoppingList');
        this.favoritesList = document.getElementById('favoritesList');
        this.generateShoppingListBtn = document.getElementById('generateShoppingListBtn');
        this.exportMealPlanBtn = document.getElementById('exportMealPlanBtn');
        this.clearShoppingListBtn = document.getElementById('clearShoppingListBtn');
        this.printShoppingListBtn = document.getElementById('printShoppingListBtn');
    }

    setupEventListeners() {
        // Setup diet type radio buttons
        const dietTypeRadios = document.querySelectorAll('input[name="dietType"]');
        dietTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedDietType = e.target.value;
                // Optionally update UI or state here
            });
        });

        // Setup checkbox event listeners for ingredients
        this.setupIngredientCheckboxes();

        // Generate meals (bottom button)
        if (this.generateMealsBtn) {
            this.generateMealsBtn.addEventListener('click', () => this.generateWeeklyMealPlan());
        }

        // Meal plan mode radio buttons
        this.aiMealPlanRadio = document.getElementById('aiMealPlanRadio');
        this.strictMealPlanRadio = document.getElementById('strictMealPlanRadio');

        // Clear meal plan
        if (this.clearMealPlanBtn) {
            this.clearMealPlanBtn.addEventListener('click', () => this.clearMealPlan());
        }

        // Shopping list
        if (this.generateShoppingListBtn) {
            this.generateShoppingListBtn.addEventListener('click', () => this.generateShoppingList());
        }
        if (this.clearShoppingListBtn) {
            this.clearShoppingListBtn.addEventListener('click', () => this.clearShoppingList());
        }
        if (this.printShoppingListBtn) {
            this.printShoppingListBtn.addEventListener('click', () => this.printShoppingList());
        }

        // Export meal plan
        if (this.exportMealPlanBtn) {
            this.exportMealPlanBtn.addEventListener('click', () => this.exportMealPlan());
        }

        // Dietary preferences (legacy checkboxes, if present)
        const vegetarianEl = document.getElementById('vegetarian');
        if (vegetarianEl) {
            vegetarianEl.addEventListener('change', (e) => {
                this.dietaryPreferences.vegetarian = e.target.checked;
                this.saveToLocalStorage();
            });
        }
        const veganEl = document.getElementById('vegan');
        if (veganEl) {
            veganEl.addEventListener('change', (e) => {
                this.dietaryPreferences.vegan = e.target.checked;
                this.saveToLocalStorage();
            });
        }
        const glutenFreeEl = document.getElementById('glutenFree');
        if (glutenFreeEl) {
            glutenFreeEl.addEventListener('change', (e) => {
                this.dietaryPreferences.glutenFree = e.target.checked;
                this.saveToLocalStorage();
            });
        }
        const lowCarbEl = document.getElementById('lowCarb');
        if (lowCarbEl) {
            lowCarbEl.addEventListener('change', (e) => {
                this.dietaryPreferences.lowCarb = e.target.checked;
                this.saveToLocalStorage();
            });
        }

        // Update generate button state
        this.updateGenerateButtonState();
    }

    updateGenerateButtonState() {
        // Only enable the Generate button if at least one ingredient is selected
        if (this.generateMealsBtn) {
            this.generateMealsBtn.disabled = this.ingredients.length === 0;
            if (this.ingredients.length === 0) {
                this.generateMealsBtn.style.display = 'none';
            } else {
                this.generateMealsBtn.style.display = 'block';
            }
        }
    }

    setupIngredientCheckboxes() {
        // Add quantity inputs to all ingredient checkboxes
        this.addQuantityInputsToCheckboxes();
        
        const checkboxes = document.querySelectorAll('.ingredient-checkbox input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const ingredient = e.target.value;
                if (e.target.checked) {
                    this.addIngredient(ingredient);
                } else {
                    this.removeIngredient(ingredient);
                }
            });
        });

        // Setup quantity input listeners
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const ingredient = e.target.dataset.ingredient;
                const quantity = e.target.value.trim();
                if (this.ingredients.includes(ingredient)) {
                    this.ingredientQuantities[ingredient] = quantity;
                    this.saveToLocalStorage();
                }
            });
        });
    }

    addQuantityInputsToCheckboxes() {
        const checkboxes = document.querySelectorAll('.ingredient-checkbox');
        checkboxes.forEach(checkbox => {
            const ingredient = checkbox.querySelector('input[type="checkbox"]').value;
            const existingInput = checkbox.querySelector('.quantity-input');
            
            if (!existingInput) {
                const quantityInput = document.createElement('input');
                quantityInput.type = 'text';
                quantityInput.className = 'quantity-input';
                quantityInput.placeholder = 'Qty';
                quantityInput.dataset.ingredient = ingredient;
                checkbox.appendChild(quantityInput);
            }
        });
    }

    addIngredient(ingredient) {
        if (!this.ingredients.includes(ingredient)) {
            this.ingredients.push(ingredient);
            // Get quantity from input if available
            const quantityInput = document.querySelector(`input[data-ingredient="${ingredient}"]`);
            if (quantityInput && quantityInput.value.trim()) {
                this.ingredientQuantities[ingredient] = quantityInput.value.trim();
            }
            this.renderIngredients();
            this.saveToLocalStorage();
            this.updateGenerateButtonState();
        }
    }

    removeIngredient(ingredient) {
        this.ingredients = this.ingredients.filter(item => item !== ingredient);
        delete this.ingredientQuantities[ingredient];
        this.renderIngredients();
        this.saveToLocalStorage();
        this.updateGenerateButtonState();
        
        // Uncheck the corresponding checkbox
        const checkbox = document.querySelector(`input[value="${ingredient}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        // Clear quantity input
        const quantityInput = document.querySelector(`input[data-ingredient="${ingredient}"]`);
        if (quantityInput) {
            quantityInput.value = '';
        }
    }

    renderIngredients() {
        this.ingredientsList.innerHTML = '';
        
        this.ingredients.forEach(ingredient => {
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            const quantity = this.ingredientQuantities[ingredient] || '';
            const quantityText = quantity ? ` (${quantity})` : '';
            tag.innerHTML = `
                ${ingredient}${quantityText}
                <button class="remove-ingredient" onclick="mealPlanner.removeIngredient('${ingredient}')">×</button>
            `;
            this.ingredientsList.appendChild(tag);
        });
    }

    initializeMealDatabase() {
        return {
            'rice': [
                { 
                    name: 'Jeera Rice', 
                    ingredients: ['rice', 'cumin', 'ghee', 'salt'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '25 min',
                    calories: 280,
                    protein: '5g',
                    carbs: '55g',
                    fat: '8g'
                },
                { 
                    name: 'Biryani', 
                    ingredients: ['rice', 'chicken', 'onions', 'garlic', 'ginger', 'spices'],
                    category: 'dinner',
                    difficulty: 'hard',
                    time: '60 min',
                    calories: 450,
                    protein: '25g',
                    carbs: '65g',
                    fat: '12g'
                },
                { 
                    name: 'Pulao', 
                    ingredients: ['rice', 'vegetables', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'medium',
                    time: '30 min',
                    calories: 320,
                    protein: '8g',
                    carbs: '60g',
                    fat: '6g'
                }
            ],
            'dal': [
                { 
                    name: 'Dal Tadka', 
                    ingredients: ['dal', 'onions', 'tomatoes', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '30 min',
                    calories: 180,
                    protein: '12g',
                    carbs: '25g',
                    fat: '4g'
                },
                { 
                    name: 'Dal Khichdi', 
                    ingredients: ['dal', 'rice', 'vegetables', 'ghee', 'spices'],
                    category: 'dinner',
                    difficulty: 'easy',
                    time: '35 min',
                    calories: 280,
                    protein: '15g',
                    carbs: '45g',
                    fat: '8g'
                },
                { 
                    name: 'Dal Fry', 
                    ingredients: ['dal', 'onions', 'garlic', 'ginger', 'spices', 'ghee'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '25 min',
                    calories: 200,
                    protein: '14g',
                    carbs: '28g',
                    fat: '6g'
                }
            ],
            'chicken': [
                { 
                    name: 'Butter Chicken', 
                    ingredients: ['chicken', 'tomatoes', 'cream', 'butter', 'spices'],
                    category: 'dinner',
                    difficulty: 'medium',
                    time: '45 min',
                    calories: 420,
                    protein: '35g',
                    carbs: '8g',
                    fat: '28g'
                },
                { 
                    name: 'Chicken Curry', 
                    ingredients: ['chicken', 'onions', 'tomatoes', 'garlic', 'ginger', 'spices'],
                    category: 'dinner',
                    difficulty: 'medium',
                    time: '40 min',
                    calories: 380,
                    protein: '32g',
                    carbs: '12g',
                    fat: '22g'
                },
                { 
                    name: 'Chicken Tikka', 
                    ingredients: ['chicken', 'yogurt', 'garlic', 'ginger', 'spices'],
                    category: 'dinner',
                    difficulty: 'medium',
                    time: '35 min',
                    calories: 320,
                    protein: '38g',
                    carbs: '6g',
                    fat: '16g'
                }
            ],
            'potatoes': [
                { 
                    name: 'Aloo Paratha', 
                    ingredients: ['potatoes', 'wheat flour', 'onions', 'spices', 'ghee'],
                    category: 'breakfast',
                    difficulty: 'medium',
                    time: '30 min',
                    calories: 280,
                    protein: '8g',
                    carbs: '45g',
                    fat: '10g'
                },
                { 
                    name: 'Aloo Sabzi', 
                    ingredients: ['potatoes', 'onions', 'tomatoes', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '25 min',
                    calories: 220,
                    protein: '6g',
                    carbs: '35g',
                    fat: '8g'
                },
                { 
                    name: 'Aloo Tikki', 
                    ingredients: ['potatoes', 'onions', 'garlic', 'ginger', 'spices'],
                    category: 'snack',
                    difficulty: 'medium',
                    time: '20 min',
                    calories: 180,
                    protein: '4g',
                    carbs: '28g',
                    fat: '6g'
                }
            ],
            'tomatoes': [
                { 
                    name: 'Tomato Chutney', 
                    ingredients: ['tomatoes', 'onions', 'garlic', 'ginger', 'spices'],
                    category: 'condiment',
                    difficulty: 'easy',
                    time: '15 min',
                    calories: 80,
                    protein: '3g',
                    carbs: '12g',
                    fat: '3g'
                },
                { 
                    name: 'Tomato Rice', 
                    ingredients: ['rice', 'tomatoes', 'onions', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '25 min',
                    calories: 260,
                    protein: '6g',
                    carbs: '50g',
                    fat: '5g'
                }
            ],
            'onions': [
                { 
                    name: 'Onion Pakora', 
                    ingredients: ['onions', 'chickpea flour', 'spices', 'oil'],
                    category: 'snack',
                    difficulty: 'easy',
                    time: '20 min',
                    calories: 160,
                    protein: '5g',
                    carbs: '22g',
                    fat: '7g'
                },
                { 
                    name: 'Onion Raita', 
                    ingredients: ['onions', 'yogurt', 'cucumber', 'spices'],
                    category: 'condiment',
                    difficulty: 'easy',
                    time: '10 min',
                    calories: 60,
                    protein: '4g',
                    carbs: '6g',
                    fat: '2g'
                }
            ],
            'garlic': [
                { 
                    name: 'Garlic Naan', 
                    ingredients: ['wheat flour', 'garlic', 'yogurt', 'ghee'],
                    category: 'bread',
                    difficulty: 'medium',
                    time: '25 min',
                    calories: 220,
                    protein: '6g',
                    carbs: '38g',
                    fat: '6g'
                },
                { 
                    name: 'Garlic Chutney', 
                    ingredients: ['garlic', 'coconut', 'spices', 'oil'],
                    category: 'condiment',
                    difficulty: 'easy',
                    time: '10 min',
                    calories: 120,
                    protein: '3g',
                    carbs: '8g',
                    fat: '10g'
                }
            ],
            'ginger': [
                { 
                    name: 'Ginger Tea', 
                    ingredients: ['ginger', 'tea leaves', 'milk', 'sugar'],
                    category: 'beverage',
                    difficulty: 'easy',
                    time: '10 min',
                    calories: 80,
                    protein: '2g',
                    carbs: '12g',
                    fat: '2g'
                },
                { 
                    name: 'Ginger Chutney', 
                    ingredients: ['ginger', 'coconut', 'spices', 'oil'],
                    category: 'condiment',
                    difficulty: 'easy',
                    time: '10 min',
                    calories: 100,
                    protein: '2g',
                    carbs: '6g',
                    fat: '8g'
                }
            ],
            'yogurt': [
                { 
                    name: 'Dahi Vada', 
                    ingredients: ['yogurt', 'lentils', 'spices', 'chutney'],
                    category: 'snack',
                    difficulty: 'hard',
                    time: '45 min',
                    calories: 180,
                    protein: '8g',
                    carbs: '25g',
                    fat: '6g'
                },
                { 
                    name: 'Raita', 
                    ingredients: ['yogurt', 'cucumber', 'onions', 'spices'],
                    category: 'condiment',
                    difficulty: 'easy',
                    time: '10 min',
                    calories: 70,
                    protein: '4g',
                    carbs: '6g',
                    fat: '3g'
                }
            ],
            'wheat flour': [
                { 
                    name: 'Roti', 
                    ingredients: ['wheat flour', 'water', 'salt', 'ghee'],
                    category: 'bread',
                    difficulty: 'easy',
                    time: '15 min',
                    calories: 120,
                    protein: '4g',
                    carbs: '22g',
                    fat: '2g'
                },
                { 
                    name: 'Poori', 
                    ingredients: ['wheat flour', 'oil', 'salt'],
                    category: 'bread',
                    difficulty: 'medium',
                    time: '20 min',
                    calories: 180,
                    protein: '4g',
                    carbs: '25g',
                    fat: '8g'
                }
            ],
            'paneer': [
                { 
                    name: 'Paneer Butter Masala', 
                    ingredients: ['paneer', 'tomatoes', 'cream', 'butter', 'spices'],
                    category: 'dinner',
                    difficulty: 'medium',
                    time: '30 min',
                    calories: 380,
                    protein: '18g',
                    carbs: '8g',
                    fat: '32g'
                },
                { 
                    name: 'Paneer Tikka', 
                    ingredients: ['paneer', 'yogurt', 'garlic', 'ginger', 'spices'],
                    category: 'snack',
                    difficulty: 'medium',
                    time: '25 min',
                    calories: 280,
                    protein: '22g',
                    carbs: '6g',
                    fat: '18g'
                }
            ],
            'cauliflower': [
                { 
                    name: 'Gobi Manchurian', 
                    ingredients: ['cauliflower', 'flour', 'garlic', 'ginger', 'soy sauce'],
                    category: 'snack',
                    difficulty: 'medium',
                    time: '25 min',
                    calories: 200,
                    protein: '6g',
                    carbs: '28g',
                    fat: '8g'
                },
                { 
                    name: 'Aloo Gobi', 
                    ingredients: ['cauliflower', 'potatoes', 'onions', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '30 min',
                    calories: 180,
                    protein: '6g',
                    carbs: '28g',
                    fat: '6g'
                }
            ],
            'spinach': [
                { 
                    name: 'Palak Paneer', 
                    ingredients: ['spinach', 'paneer', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'medium',
                    time: '25 min',
                    calories: 220,
                    protein: '16g',
                    carbs: '8g',
                    fat: '14g'
                },
                { 
                    name: 'Palak Dal', 
                    ingredients: ['spinach', 'dal', 'onions', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '30 min',
                    calories: 160,
                    protein: '12g',
                    carbs: '20g',
                    fat: '4g'
                }
            ]
        };
    }

    getUserMealPlanPreferences() {
        // Diet type (use the checked .diet-checkbox)
        const dietType = document.querySelector('.diet-checkbox:checked')?.value || 'anything';
        // Calories/macros
        const calories = parseInt(document.getElementById('caloriesInput')?.value) || 1800;
        const carbs = parseInt(document.getElementById('carbsInput')?.value) || 90;
        const fat = parseInt(document.getElementById('fatInput')?.value) || 40;
        const protein = parseInt(document.getElementById('proteinInput')?.value) || 90;
        const mealsPerDay = parseInt(document.getElementById('mealsPerDayInput')?.value) || 3;
        return { dietType, calories, carbs, fat, protein, mealsPerDay };
    }

    async generateWeeklyMealPlan() {
        if (this.ingredients.length === 0) return;

        // Show loading state
        this.generateMealsBtn.disabled = true;
        this.generateMealsBtn.textContent = 'Generating...';
        const topGenerateBtn = document.getElementById('topGenerateBtn');
        if (topGenerateBtn) {
            topGenerateBtn.disabled = true;
            topGenerateBtn.textContent = 'Generating...';
        }

        // Determine mode
        const useAI = this.aiMealPlanRadio && this.aiMealPlanRadio.checked;
        const userPrefs = this.getUserMealPlanPreferences();

        if (useAI) {
            try {
                // Prepare the prompt for Gemini API
                const prompt = this.createGeminiPrompt(userPrefs);
                // Call Gemini API
                const mealPlanData = await this.callGeminiAPI(prompt);
                // Parse and format the response
                this.mealPlanData = this.parseGeminiResponse(mealPlanData);
                this.renderMealPlan();
                this.saveToLocalStorage();
                this.mealPlanSection.style.display = 'block';
                // Cross-check AI meal plan for missing/insufficient ingredients
                this.generateShoppingListForAIMealPlan();
            } catch (error) {
                console.error('Error generating meal plan (AI):', error);
                // Fallback to strict local plan
                await this.generateStrictLocalMealPlan(userPrefs);
            } finally {
                this.generateMealsBtn.disabled = false;
                this.generateMealsBtn.textContent = 'Generate Weekly Meal Plan';
                if (topGenerateBtn) {
                    topGenerateBtn.disabled = false;
                    topGenerateBtn.textContent = 'Generate';
                }
            }
        } else {
            await this.generateStrictLocalMealPlan(userPrefs);
            this.generateMealsBtn.disabled = false;
            this.generateMealsBtn.textContent = 'Generate Weekly Meal Plan';
            if (topGenerateBtn) {
                topGenerateBtn.disabled = false;
                topGenerateBtn.textContent = 'Generate';
            }
        }
    }

    generateShoppingListForAIMealPlan() {
        if (!this.mealPlanData || Object.keys(this.mealPlanData).length === 0) return;
        const perMealEstimates = {
            'rice': 100, 'dal': 50, 'wheat flour': 100, 'semolina': 100, 'onions': 100, 'tomatoes': 100, 'potatoes': 100,
            'garlic': 10, 'ginger': 10, 'chicken': 200, 'paneer': 100, 'milk': 250, 'yogurt': 100, 'ghee': 15, 'butter': 15, 'oil': 30,
            'salt': 10, 'sugar': 20, 'turmeric': 5, 'cumin': 5, 'coriander': 5, 'cardamom': 2, 'cinnamon': 2, 'black pepper': 2,
            'red chili powder': 5, 'garam masala': 5, 'curry leaves': 10, 'mint leaves': 10, 'lemon': 1, 'tea leaves': 10, 'coffee': 10
        };
        const availableIngredients = new Set(this.ingredients);
        const availableQuantities = { ...this.ingredientQuantities };
        const neededIngredients = {};

        Object.values(this.mealPlanData).forEach(meals => {
            meals.forEach(meal => {
                meal.ingredients.forEach(ing => {
                    const need = perMealEstimates[ing] || 50;
                    const have = availableQuantities[ing] ? this.parseQuantity(availableQuantities[ing]) : 0;
                    if (!availableIngredients.has(ing) || have < need) {
                        neededIngredients[ing] = (neededIngredients[ing] || 0) + (need - have > 0 ? need - have : need);
                    } else {
                        // Decrement available quantity for next meal
                        availableQuantities[ing] = have - need;
                    }
                });
            });
        });

        const shoppingList = Object.entries(neededIngredients).map(([ingredient, amount]) => ({
            ingredient,
            quantity: this.formatQuantity(amount, ingredient),
            reason: 'Needed for AI meal plan'
        }));

        if (shoppingList.length > 0) {
            this.renderShoppingList(shoppingList);
            this.shoppingListSection.style.display = 'block';
            // Scroll to shopping list
            setTimeout(() => {
                const shoppingListSection = document.getElementById('shoppingListSection');
                if (shoppingListSection) {
                    shoppingListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    shoppingListSection.style.boxShadow = '0 0 0 4px #ffcc00';
                    setTimeout(() => { shoppingListSection.style.boxShadow = ''; }, 2000);
                }
            }, 300);
        } else {
            this.clearShoppingList();
        }
    }

    async generateStrictLocalMealPlan(userPrefs) {
        // Clone ingredient quantities for tracking usage
        const availableQuantities = { ...this.ingredientQuantities };
        const availableIngredients = new Set(this.ingredients);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const categories = ['breakfast', 'lunch', 'dinner'];
        const mealPlanData = {};
        let shoppingList = [];

        // Get all meals from the database that match dietary preferences
        let allMeals = [];
        this.ingredients.forEach(ingredient => {
            if (this.mealDatabase[ingredient]) {
                allMeals.push(...this.mealDatabase[ingredient]);
            }
        });
        // Remove duplicates
        allMeals = allMeals.filter((meal, idx, arr) => arr.findIndex(m => m.name === meal.name) === idx);
        // Filter by dietary preferences
        allMeals = allMeals.filter(meal => {
            if (this.dietaryPreferences.vegetarian && this.containsMeat(meal.ingredients)) return false;
            if (this.dietaryPreferences.vegan && this.containsAnimalProducts(meal.ingredients)) return false;
            if (this.dietaryPreferences.glutenFree && this.containsGluten(meal.ingredients)) return false;
            if (this.dietaryPreferences.lowCarb && meal.carbs && parseInt(meal.carbs) > 30) return false;
            return true;
        });

        // Per-meal estimates for quantity usage
        const perMealEstimates = {
            'rice': 100, 'dal': 50, 'wheat flour': 100, 'semolina': 100, 'onions': 100, 'tomatoes': 100, 'potatoes': 100,
            'garlic': 10, 'ginger': 10, 'chicken': 200, 'paneer': 100, 'milk': 250, 'yogurt': 100, 'ghee': 15, 'butter': 15, 'oil': 30,
            'salt': 10, 'sugar': 20, 'turmeric': 5, 'cumin': 5, 'coriander': 5, 'cardamom': 2, 'cinnamon': 2, 'black pepper': 2,
            'red chili powder': 5, 'garam masala': 5, 'curry leaves': 10, 'mint leaves': 10, 'lemon': 1, 'tea leaves': 10, 'coffee': 10
        };

        // Track which ingredients are missing or insufficient
        const neededIngredients = {};

        // Plan meals for each day and category
        for (const day of days) {
            mealPlanData[day] = [];
            for (const category of categories) {
                // Find a meal for this category that can be made with available ingredients/quantities
                const meal = allMeals.find(meal => {
                    if (meal.category !== category) return false;
                    // Check if all ingredients are available in sufficient quantity
                    return meal.ingredients.every(ing => {
                        if (!availableIngredients.has(ing)) return false;
                        const need = perMealEstimates[ing] || 50;
                        const have = availableQuantities[ing] ? this.parseQuantity(availableQuantities[ing]) : 0;
                        return have >= need;
                    });
                });
                if (meal) {
                    mealPlanData[day].push(meal);
                    // Decrement ingredient quantities
                    meal.ingredients.forEach(ing => {
                        const need = perMealEstimates[ing] || 50;
                        if (availableQuantities[ing]) {
                            let have = this.parseQuantity(availableQuantities[ing]);
                            have -= need;
                            availableQuantities[ing] = have;
                        }
                    });
                }
            }
        }

        // If any day is missing a meal, suggest the minimum set of extra ingredients needed
        let incomplete = false;
        for (const day of days) {
            if (mealPlanData[day].length < categories.length) {
                incomplete = true;
                // Find what is missing for this day
                for (const category of categories) {
                    if (!mealPlanData[day].some(m => m.category === category)) {
                        // Find a meal for this category and track missing ingredients
                        const possibleMeals = allMeals.filter(m => m.category === category);
                        for (const meal of possibleMeals) {
                            meal.ingredients.forEach(ing => {
                                const need = perMealEstimates[ing] || 50;
                                const have = availableQuantities[ing] ? this.parseQuantity(availableQuantities[ing]) : 0;
                                if (!availableIngredients.has(ing) || have < need) {
                                    neededIngredients[ing] = (neededIngredients[ing] || 0) + (need - have > 0 ? need - have : need);
                                }
                            });
                        }
                    }
                }
            }
        }

        // Prepare shopping list from neededIngredients
        shoppingList = Object.entries(neededIngredients).map(([ingredient, amount]) => ({
            ingredient,
            quantity: this.formatQuantity(amount, ingredient),
            reason: 'Needed to complete weekly plan'
        }));

        this.mealPlanData = mealPlanData;
        this.renderMealPlan();
        this.saveToLocalStorage();
        this.mealPlanSection.style.display = 'block';

        // Show shopping list at the top if needed
        if (shoppingList.length > 0) {
            this.renderShoppingList(shoppingList);
            this.shoppingListSection.style.display = 'block';
            // Scroll to shopping list
            setTimeout(() => {
                const shoppingListSection = document.getElementById('shoppingListSection');
                if (shoppingListSection) {
                    shoppingListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    shoppingListSection.style.boxShadow = '0 0 0 4px #ffcc00';
                    setTimeout(() => { shoppingListSection.style.boxShadow = ''; }, 2000);
                }
            }, 300);
        } else {
            this.clearShoppingList();
        }
    }

    createGeminiPrompt(userPrefs) {
        const ingredientsList = this.ingredients.join(', ');
        const dietaryPrefs = Object.entries(this.dietaryPreferences)
            .filter(([_, enabled]) => enabled)
            .map(([pref, _]) => pref)
            .join(', ');
        const dietaryText = dietaryPrefs ? `Dietary preferences: ${dietaryPrefs}.` : '';
        const { dietType, calories, carbs, fat, protein, mealsPerDay } = userPrefs || {};
        // Define common pantry staples that are always available
        const pantryStaples = ['salt', 'water', 'oil', 'vegetable oil', 'mustard oil', 'sesame oil', 'coconut oil'];
        return `Generate a weekly Indian meal plan (Monday to Sunday) with ${mealsPerDay || 3} meals per day (breakfast, lunch, dinner) using ONLY these ingredients: ${ingredientsList}. ${dietaryText}

Preferred diet: ${dietType}
Target calories per day: ${calories}
Target macros per day: at least ${carbs}g carbs, ${fat}g fat, ${protein}g protein

IMPORTANT RULES:
1. You can ONLY use the ingredients listed above plus these common pantry staples: ${pantryStaples.join(', ')}
2. DO NOT suggest any meals that require ingredients not in the provided list
3. If an ingredient is not available, DO NOT include it in any meal
4. Be creative with the available ingredients to create authentic Indian dishes
5. Each meal must be realistically achievable with the given ingredients

Please respond with a JSON object in this exact format:
{
  "Monday": [
    {
      "name": "Meal Name",
      "ingredients": ["ingredient1", "ingredient2"],
      "category": "breakfast/lunch/dinner",
      "difficulty": "easy/medium/hard",
      "time": "XX min",
      "calories": number,
      "protein": "XXg",
      "carbs": "XXg",
      "fat": "XXg"
    }
  ]
}

Requirements:
- Use ONLY the provided ingredients plus the pantry staples listed above
- Ensure meals are authentic Indian dishes
- Include nutritional information (calories, protein, carbs, fat)
- Vary difficulty levels and cooking times
- Respect dietary preferences if specified
- Make sure each meal has realistic cooking times and difficulty levels
- Include traditional Indian breakfast, lunch, and dinner options
- DO NOT include any ingredients not explicitly provided in the list
- Try to match the calorie and macro targets as closely as possible for each day.`;
    }

    async callGeminiAPI(prompt) {
        const API_KEY = 'GEMINI_API_KEY';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    parseGeminiResponse(responseText) {
        try {
            // Extract JSON from the response (in case there's additional text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            
            const mealPlanData = JSON.parse(jsonMatch[0]);
            
            // Validate the structure
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const categories = ['breakfast', 'lunch', 'dinner'];
            
            for (const day of days) {
                if (!mealPlanData[day] || !Array.isArray(mealPlanData[day])) {
                    throw new Error(`Invalid structure for ${day}`);
                }
                
                for (const meal of mealPlanData[day]) {
                    if (!meal.name || !meal.ingredients || !meal.category || 
                        !meal.difficulty || !meal.time || !meal.calories) {
                        throw new Error(`Invalid meal structure in ${day}`);
                    }
                    
                    // Ensure category is valid
                    if (!categories.includes(meal.category)) {
                        meal.category = 'lunch'; // Default fallback
                    }
                    
                    // Ensure difficulty is valid
                    if (!['easy', 'medium', 'hard'].includes(meal.difficulty)) {
                        meal.difficulty = 'medium'; // Default fallback
                    }
                }
            }
            
            return mealPlanData;
            
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            // Return sample meal plan as fallback
            return this.createSampleMealPlan();
        }
    }

    createSampleMealPlan() {
        return {
            'Monday': [
                {
                    name: 'Aloo Paratha',
                    ingredients: ['potatoes', 'wheat flour', 'onions', 'spices', 'ghee'],
                    category: 'breakfast',
                    difficulty: 'medium',
                    time: '30 min',
                    calories: 280,
                    protein: '8g',
                    carbs: '45g',
                    fat: '10g'
                },
                {
                    name: 'Dal Tadka',
                    ingredients: ['dal', 'onions', 'tomatoes', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '30 min',
                    calories: 180,
                    protein: '12g',
                    carbs: '25g',
                    fat: '4g'
                },
                {
                    name: 'Chicken Curry',
                    ingredients: ['chicken', 'onions', 'tomatoes', 'garlic', 'ginger', 'spices'],
                    category: 'dinner',
                    difficulty: 'medium',
                    time: '40 min',
                    calories: 380,
                    protein: '32g',
                    carbs: '12g',
                    fat: '22g'
                }
            ],
            'Tuesday': [
                {
                    name: 'Ginger Tea',
                    ingredients: ['ginger', 'tea leaves', 'milk', 'sugar'],
                    category: 'breakfast',
                    difficulty: 'easy',
                    time: '10 min',
                    calories: 80,
                    protein: '2g',
                    carbs: '12g',
                    fat: '2g'
                },
                {
                    name: 'Jeera Rice',
                    ingredients: ['rice', 'cumin', 'ghee', 'salt'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '25 min',
                    calories: 280,
                    protein: '5g',
                    carbs: '55g',
                    fat: '8g'
                },
                {
                    name: 'Paneer Butter Masala',
                    ingredients: ['paneer', 'tomatoes', 'cream', 'butter', 'spices'],
                    category: 'dinner',
                    difficulty: 'medium',
                    time: '30 min',
                    calories: 380,
                    protein: '18g',
                    carbs: '8g',
                    fat: '32g'
                }
            ],
            'Wednesday': [
                {
                    name: 'Roti',
                    ingredients: ['wheat flour', 'water', 'salt', 'ghee'],
                    category: 'breakfast',
                    difficulty: 'easy',
                    time: '15 min',
                    calories: 120,
                    protein: '4g',
                    carbs: '22g',
                    fat: '2g'
                },
                {
                    name: 'Aloo Sabzi',
                    ingredients: ['potatoes', 'onions', 'tomatoes', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '25 min',
                    calories: 220,
                    protein: '6g',
                    carbs: '35g',
                    fat: '8g'
                },
                {
                    name: 'Dal Khichdi',
                    ingredients: ['dal', 'rice', 'vegetables', 'ghee', 'spices'],
                    category: 'dinner',
                    difficulty: 'easy',
                    time: '35 min',
                    calories: 280,
                    protein: '15g',
                    carbs: '45g',
                    fat: '8g'
                }
            ],
            'Thursday': [
                {
                    name: 'Poori',
                    ingredients: ['wheat flour', 'oil', 'salt'],
                    category: 'breakfast',
                    difficulty: 'medium',
                    time: '20 min',
                    calories: 180,
                    protein: '4g',
                    carbs: '25g',
                    fat: '8g'
                },
                {
                    name: 'Tomato Rice',
                    ingredients: ['rice', 'tomatoes', 'onions', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '25 min',
                    calories: 260,
                    protein: '6g',
                    carbs: '50g',
                    fat: '5g'
                },
                {
                    name: 'Butter Chicken',
                    ingredients: ['chicken', 'tomatoes', 'cream', 'butter', 'spices'],
                    category: 'dinner',
                    difficulty: 'medium',
                    time: '45 min',
                    calories: 420,
                    protein: '35g',
                    carbs: '8g',
                    fat: '28g'
                }
            ],
            'Friday': [
                {
                    name: 'Aloo Paratha',
                    ingredients: ['potatoes', 'wheat flour', 'onions', 'spices', 'ghee'],
                    category: 'breakfast',
                    difficulty: 'medium',
                    time: '30 min',
                    calories: 280,
                    protein: '8g',
                    carbs: '45g',
                    fat: '10g'
                },
                {
                    name: 'Palak Paneer',
                    ingredients: ['spinach', 'paneer', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'medium',
                    time: '25 min',
                    calories: 220,
                    protein: '16g',
                    carbs: '8g',
                    fat: '14g'
                },
                {
                    name: 'Biryani',
                    ingredients: ['rice', 'chicken', 'onions', 'garlic', 'ginger', 'spices'],
                    category: 'dinner',
                    difficulty: 'hard',
                    time: '60 min',
                    calories: 450,
                    protein: '25g',
                    carbs: '65g',
                    fat: '12g'
                }
            ],
            'Saturday': [
                {
                    name: 'Ginger Tea',
                    ingredients: ['ginger', 'tea leaves', 'milk', 'sugar'],
                    category: 'breakfast',
                    difficulty: 'easy',
                    time: '10 min',
                    calories: 80,
                    protein: '2g',
                    carbs: '12g',
                    fat: '2g'
                },
                {
                    name: 'Dal Fry',
                    ingredients: ['dal', 'onions', 'garlic', 'ginger', 'spices', 'ghee'],
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '25 min',
                    calories: 200,
                    protein: '14g',
                    carbs: '28g',
                    fat: '6g'
                },
                {
                    name: 'Paneer Tikka',
                    ingredients: ['paneer', 'yogurt', 'garlic', 'ginger', 'spices'],
                    category: 'dinner',
                    difficulty: 'medium',
                    time: '25 min',
                    calories: 280,
                    protein: '22g',
                    carbs: '6g',
                    fat: '18g'
                }
            ],
            'Sunday': [
                {
                    name: 'Roti',
                    ingredients: ['wheat flour', 'water', 'salt', 'ghee'],
                    category: 'breakfast',
                    difficulty: 'easy',
                    time: '15 min',
                    calories: 120,
                    protein: '4g',
                    carbs: '22g',
                    fat: '2g'
                },
                {
                    name: 'Pulao',
                    ingredients: ['rice', 'vegetables', 'garlic', 'ginger', 'spices'],
                    category: 'lunch',
                    difficulty: 'medium',
                    time: '30 min',
                    calories: 320,
                    protein: '8g',
                    carbs: '60g',
                    fat: '6g'
                },
                {
                    name: 'Chicken Tikka',
                    ingredients: ['chicken', 'yogurt', 'garlic', 'ginger', 'spices'],
                    category: 'dinner',
                    difficulty: 'medium',
                    time: '35 min',
                    calories: 320,
                    protein: '38g',
                    carbs: '6g',
                    fat: '16g'
                }
            ]
        };
    }

    generateMealsForDay() {
        const meals = [];
        const availableMeals = this.getAvailableMeals();
        
        // Generate 2-3 meals per day with different categories
        const categories = ['breakfast', 'lunch', 'dinner'];
        const numMeals = Math.floor(Math.random() * 2) + 2; // 2-3 meals
        
        for (let i = 0; i < numMeals && availableMeals.length > 0; i++) {
            const category = categories[i] || categories[Math.floor(Math.random() * categories.length)];
            const categoryMeals = availableMeals.filter(meal => meal.category === category);
            
            if (categoryMeals.length > 0) {
                const randomIndex = Math.floor(Math.random() * categoryMeals.length);
                const meal = categoryMeals[randomIndex];
                
                // Remove the meal from available meals to avoid duplicates
                const mealIndex = availableMeals.indexOf(meal);
                if (mealIndex > -1) {
                    availableMeals.splice(mealIndex, 1);
                }
                
                meals.push(meal);
            }
        }

        return meals;
    }

    getAvailableMeals() {
        const availableMeals = [];
        
        // Check each ingredient against the meal database
        this.ingredients.forEach(ingredient => {
            if (this.mealDatabase[ingredient]) {
                availableMeals.push(...this.mealDatabase[ingredient]);
            }
        });

        // Filter by dietary preferences
        let filteredMeals = availableMeals.filter(meal => {
            if (this.dietaryPreferences.vegetarian && this.containsMeat(meal.ingredients)) {
                return false;
            }
            if (this.dietaryPreferences.vegan && this.containsAnimalProducts(meal.ingredients)) {
                return false;
            }
            if (this.dietaryPreferences.glutenFree && this.containsGluten(meal.ingredients)) {
                return false;
            }
            if (this.dietaryPreferences.lowCarb && meal.carbs && parseInt(meal.carbs) > 30) {
                return false;
            }
            return true;
        });

        // If no specific meals found, create generic Indian meals based on available ingredients
        if (filteredMeals.length === 0) {
            filteredMeals.push(
                { 
                    name: 'Mixed Vegetable Curry', 
                    ingredients: this.ingredients.slice(0, 4),
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '25 min',
                    calories: 200,
                    protein: '8g',
                    carbs: '25g',
                    fat: '8g'
                },
                { 
                    name: 'Simple Dal', 
                    ingredients: this.ingredients.filter(ing => ['dal', 'onions', 'garlic', 'ginger'].includes(ing)),
                    category: 'lunch',
                    difficulty: 'easy',
                    time: '30 min',
                    calories: 180,
                    protein: '12g',
                    carbs: '25g',
                    fat: '4g'
                }
            );
        }

        return filteredMeals;
    }

    containsMeat(ingredients) {
        const meatIngredients = ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'fish', 'shrimp', 'mutton'];
        return ingredients.some(ing => meatIngredients.includes(ing));
    }

    containsAnimalProducts(ingredients) {
        const animalProducts = ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'fish', 'shrimp', 'mutton', 'eggs', 'milk', 'yogurt', 'paneer', 'ghee', 'butter'];
        return ingredients.some(ing => animalProducts.includes(ing));
    }

    containsGluten(ingredients) {
        const glutenIngredients = ['wheat flour', 'maida', 'bread', 'pasta', 'wheat', 'flour', 'tortillas'];
        return ingredients.some(ing => glutenIngredients.includes(ing));
    }

    renderMealPlan() {
        this.mealPlanContainer.innerHTML = '';
        
        Object.entries(this.mealPlanData).forEach(([day, meals]) => {
            const dayElement = document.createElement('div');
            dayElement.className = 'meal-day';
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.innerHTML = `📅 ${day}`;
            
            dayElement.appendChild(dayHeader);
            
            meals.forEach(meal => {
                const mealElement = document.createElement('div');
                mealElement.className = 'meal-suggestion';
                
                const isFavorite = this.favorites.some(fav => fav.name === meal.name);
                const recipeUrl = this.getRecipeUrl(meal.name);
                
                mealElement.innerHTML = `
                    <div class="meal-name">${meal.name}</div>
                    <div class="meal-ingredients">Ingredients: ${meal.ingredients.join(', ')}</div>
                    <div class="meal-meta">
                        <span>⏱️ ${meal.time}</span>
                        <span>🔥 ${meal.calories} cal</span>
                        <span>💪 ${meal.protein}</span>
                        <span>🌾 ${meal.carbs}</span>
                        <span>🫒 ${meal.fat}</span>
                        <span class="difficulty-${meal.difficulty}">${meal.difficulty}</span>
                    </div>
                    <div class="meal-actions">
                        <button class="meal-action-btn ${isFavorite ? 'favorite' : ''}" onclick="mealPlanner.toggleFavorite('${meal.name}')">
                            ${isFavorite ? '❤️' : '🤍'} ${isFavorite ? 'Favorited' : 'Favorite'}
                        </button>
                        ${recipeUrl ? `<a href="${recipeUrl}" target="_blank" class="meal-action-btn recipe-btn">📖 Recipe</a>` : ''}
                    </div>
                `;
                dayElement.appendChild(mealElement);
            });
            
            this.mealPlanContainer.appendChild(dayElement);
        });
    }

    getRecipeUrl(mealName) {
        // Create a search URL for the meal recipe
        const searchQuery = encodeURIComponent(`${mealName} recipe indian`);
        return `https://www.google.com/search?q=${searchQuery}`;
    }

    toggleFavorite(mealName) {
        const meal = this.findMealByName(mealName);
        if (!meal) return;

        const existingIndex = this.favorites.findIndex(fav => fav.name === mealName);
        
        if (existingIndex > -1) {
            this.favorites.splice(existingIndex, 1);
        } else {
            this.favorites.push(meal);
        }
        
        this.renderMealPlan();
        this.renderFavorites();
        this.saveToLocalStorage();
    }

    findMealByName(mealName) {
        for (const category in this.mealDatabase) {
            const meal = this.mealDatabase[category].find(m => m.name === mealName);
            if (meal) return meal;
        }
        return null;
    }

    renderFavorites() {
        this.favoritesList.innerHTML = '';
        
        if (this.favorites.length === 0) {
            this.favoritesList.innerHTML = '<p style="color: #86868b; text-align: center; padding: 20px;">No favorite meals yet. Click the favorite button on any meal to add it here!</p>';
            return;
        }
        
        this.favorites.forEach(meal => {
            const favoriteElement = document.createElement('div');
            favoriteElement.className = 'favorite-meal';
            favoriteElement.innerHTML = `
                <div class="favorite-meal-header">
                    <div class="favorite-meal-name">${meal.name}</div>
                    <button class="remove-favorite" onclick="mealPlanner.removeFavorite('${meal.name}')">×</button>
                </div>
                <div style="color: #86868b; font-size: 0.9rem;">${meal.ingredients.join(', ')}</div>
            `;
            this.favoritesList.appendChild(favoriteElement);
        });
    }

    removeFavorite(mealName) {
        this.favorites = this.favorites.filter(fav => fav.name !== mealName);
        this.renderFavorites();
        this.renderMealPlan();
        this.saveToLocalStorage();
    }

    generateShoppingList() {
        if (!this.mealPlanData || Object.keys(this.mealPlanData).length === 0) return;

        // Calculate required ingredients for the week
        const requiredIngredients = {};
        Object.values(this.mealPlanData).forEach(meals => {
            meals.forEach(meal => {
                meal.ingredients.forEach(ingredient => {
                    if (requiredIngredients[ingredient]) {
                        requiredIngredients[ingredient]++;
                    } else {
                        requiredIngredients[ingredient] = 1;
                    }
                });
            });
        });

        // Compare with available ingredients and quantities
        const shoppingList = [];
        Object.entries(requiredIngredients).forEach(([ingredient, count]) => {
            const availableQuantity = this.ingredientQuantities[ingredient] || '';
            const hasIngredient = this.ingredients.includes(ingredient);

            // Calculate per-meal estimate (in grams or ml)
            const perMealEstimates = {
                'rice': 100, 'dal': 50, 'wheat flour': 100, 'semolina': 100, 'onions': 100, 'tomatoes': 100, 'potatoes': 100,
                'garlic': 10, 'ginger': 10, 'chicken': 200, 'paneer': 100, 'milk': 250, 'yogurt': 100, 'ghee': 15, 'butter': 15, 'oil': 30,
                'salt': 10, 'sugar': 20, 'turmeric': 5, 'cumin': 5, 'coriander': 5, 'cardamom': 2, 'cinnamon': 2, 'black pepper': 2,
                'red chili powder': 5, 'garam masala': 5, 'curry leaves': 10, 'mint leaves': 10, 'lemon': 1, 'tea leaves': 10, 'coffee': 10
            };
            const perMeal = perMealEstimates[ingredient] || 50; // default 50g/ml per meal
            let totalNeeded = count * perMeal;

            // Get minimum weekly requirement
            const minimumAmounts = {
                'salt': 50, 'sugar': 100, 'oil': 100, 'vegetable oil': 100, 'mustard oil': 100, 'sesame oil': 100, 'coconut oil': 100,
                'ghee': 50, 'butter': 50, 'rice': 500, 'wheat flour': 500, 'semolina': 500, 'besan': 200, 'dal': 300, 'onions': 10 * 100,
                'tomatoes': 10 * 100, 'potatoes': 10 * 100, 'garlic': 20 * 10, 'ginger': 5 * 10, 'chicken': 1000, 'paneer': 500, 'milk': 1000,
                'yogurt': 500, 'turmeric': 20, 'cumin': 20, 'coriander': 20, 'cardamom': 10, 'cinnamon': 10, 'black pepper': 10,
                'red chili powder': 20, 'garam masala': 20, 'curry leaves': 50, 'mint leaves': 50, 'lemon': 5, 'tea leaves': 50, 'coffee': 50
            };
            const minRequired = minimumAmounts[ingredient] || totalNeeded;
            // Use the greater of the two
            totalNeeded = Math.max(totalNeeded, minRequired);

            if (!hasIngredient) {
                shoppingList.push({
                    ingredient: ingredient,
                    quantity: this.formatQuantity(totalNeeded, ingredient),
                    reason: 'Not available'
                });
            } else if (availableQuantity) {
                const quantityNum = this.parseQuantity(availableQuantity);
                if (quantityNum < totalNeeded) {
                    const additionalNeeded = totalNeeded - quantityNum;
                    shoppingList.push({
                        ingredient: ingredient,
                        quantity: this.formatQuantity(additionalNeeded, ingredient),
                        reason: `Need ${this.formatQuantity(additionalNeeded, ingredient)} more (have ${availableQuantity})`
                    });
                }
            } else {
                shoppingList.push({
                    ingredient: ingredient,
                    quantity: this.formatQuantity(totalNeeded, ingredient),
                    reason: 'Quantity not specified'
                });
            }
        });

        this.renderShoppingList(shoppingList);
        this.shoppingListSection.style.display = 'block';
    }

    formatQuantity(amount, ingredient) {
        // Format quantity for display
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)} kg`;
        } else if (amount >= 1) {
            return `${Math.ceil(amount)}g`;
        } else {
            return `${Math.ceil(amount * 1000)}mg`;
        }
    }

    parseQuantity(quantityStr) {
        if (typeof quantityStr !== 'string') {
            if (quantityStr === undefined || quantityStr === null) return 0;
            quantityStr = String(quantityStr);
        }
        const str = quantityStr.toLowerCase().trim();
        // Handle common units
        if (str.includes('kg') || str.includes('kilo')) {
            return parseFloat(str) * 1000;
        } else if (str.includes('g') || str.includes('gram')) {
            return parseFloat(str);
        } else if (str.includes('l') || str.includes('liter')) {
            return parseFloat(str) * 1000;
        } else if (str.includes('ml') || str.includes('milliliter')) {
            return parseFloat(str);
        } else if (str.includes('piece') || str.includes('pieces') || str.includes('pc')) {
            return parseFloat(str) * 50; // Assume 50g per piece
        } else if (str.includes('clove') || str.includes('cloves')) {
            return parseFloat(str) * 3; // Assume 3g per clove
        } else if (str.includes('inch') || str.includes('inches')) {
            return parseFloat(str) * 10; // Assume 10g per inch
        } else if (str.includes('cup')) {
            return parseFloat(str) * 200; // Assume 200g per cup
        } else if (str.includes('tbsp') || str.includes('tablespoon')) {
            return parseFloat(str) * 15; // Assume 15g per tbsp
        } else if (str.includes('tsp') || str.includes('teaspoon')) {
            return parseFloat(str) * 5; // Assume 5g per tsp
        }
        // Try to parse as number
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    }

    renderShoppingList(shoppingList) {
        this.shoppingList.innerHTML = '';
        
        if (shoppingList.length === 0) {
            this.shoppingList.innerHTML = '<p style="color: #86868b; text-align: center; padding: 20px;">You have all the ingredients you need!</p>';
            return;
        }

        // Categorize ingredients for Indian cooking
        const categories = {
            'Proteins': shoppingList.filter(item => ['chicken', 'paneer', 'dal', 'tofu', 'eggs'].includes(item.ingredient)),
            'Vegetables': shoppingList.filter(item => ['tomatoes', 'onions', 'potatoes', 'cauliflower', 'spinach', 'cucumber', 'carrots', 'peas'].includes(item.ingredient)),
            'Grains & Flours': shoppingList.filter(item => ['rice', 'wheat flour', 'semolina', 'besan'].includes(item.ingredient)),
            'Dairy & Oils': shoppingList.filter(item => ['milk', 'yogurt', 'ghee', 'butter', 'cream'].includes(item.ingredient)),
            'Spices & Herbs': shoppingList.filter(item => ['garlic', 'ginger', 'cumin', 'turmeric', 'coriander', 'cardamom'].includes(item.ingredient)),
            'Others': shoppingList.filter(item => ['oil', 'tea leaves', 'sugar', 'salt'].includes(item.ingredient))
        };

        Object.entries(categories).forEach(([category, items]) => {
            if (items.length > 0) {
                const categoryElement = document.createElement('div');
                categoryElement.className = 'shopping-category';
                
                const categoryTitle = document.createElement('div');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = category;
                categoryElement.appendChild(categoryTitle);
                
                items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'shopping-item';
                    itemElement.innerHTML = `
                        <input type="checkbox" id="item-${item.ingredient}">
                        <span class="shopping-item-name">${item.ingredient}</span>
                        <span class="shopping-item-quantity">${item.quantity}</span>
                        <span class="shopping-item-reason">${item.reason}</span>
                    `;
                    categoryElement.appendChild(itemElement);
                });
                
                this.shoppingList.appendChild(categoryElement);
            }
        });
    }

    clearShoppingList() {
        this.shoppingListSection.style.display = 'none';
    }

    printShoppingList() {
        const printWindow = window.open('', '_blank');
        const shoppingListContent = this.shoppingList.innerHTML;
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Indian Shopping List</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .shopping-category { margin-bottom: 20px; }
                        .category-title { font-weight: bold; font-size: 18px; margin-bottom: 10px; border-bottom: 2px solid #333; }
                        .shopping-item { padding: 5px 0; }
                        .shopping-item input { margin-right: 10px; }
                    </style>
                </head>
                <body>
                    <h1>Indian Shopping List</h1>
                    ${shoppingListContent}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    exportMealPlan() {
        if (!this.mealPlanData || Object.keys(this.mealPlanData).length === 0) {
            alert('No meal plan to export!');
            return;
        }

        // Create a canvas to capture the meal plan as an image
        this.createMealPlanImage();
    }

    createMealPlanImage() {
        // Create a temporary container with the meal plan content
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            width: 800px;
            background: white;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1d1d1f;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        `;

        // Add header
        const header = document.createElement('div');
        header.innerHTML = `
            <h1 style="text-align: center; font-size: 2.5rem; margin-bottom: 16px; color: #1d1d1f;">🍽️ My Meal Planner</h1>
            <p style="text-align: center; font-size: 1.25rem; color: #86868b; margin-bottom: 40px;">Your Weekly Indian Meal Plan</p>
        `;
        tempContainer.appendChild(header);

        // Add meal plan content
        Object.entries(this.mealPlanData).forEach(([day, meals]) => {
            const dayElement = document.createElement('div');
            dayElement.style.cssText = `
                margin-bottom: 30px;
                padding: 24px;
                background: #fafafa;
                border-radius: 16px;
                border: 1px solid #e5e5e7;
            `;
            
            const dayHeader = document.createElement('div');
            dayHeader.style.cssText = `
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 20px;
                color: #1d1d1f;
            `;
            dayHeader.textContent = `📅 ${day}`;
            dayElement.appendChild(dayHeader);
            
            meals.forEach(meal => {
                const mealElement = document.createElement('div');
                mealElement.style.cssText = `
                    background: white;
                    padding: 20px;
                    margin-bottom: 16px;
                    border-radius: 12px;
                    border: 1px solid #e5e5e7;
                `;
                
                mealElement.innerHTML = `
                    <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 8px; color: #1d1d1f;">${meal.name}</div>
                    <div style="color: #86868b; margin-bottom: 12px;">Ingredients: ${meal.ingredients.join(', ')}</div>
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.9rem; color: #1d1d1f;">
                        <span>⏱️ ${meal.time}</span>
                        <span>🔥 ${meal.calories} cal</span>
                        <span>💪 ${meal.protein}</span>
                        <span>🌾 ${meal.carbs}</span>
                        <span>🫒 ${meal.fat}</span>
                        <span style="padding: 4px 8px; border-radius: 6px; background: #f2f2f7;">${meal.difficulty}</span>
                    </div>
                `;
                dayElement.appendChild(mealElement);
            });
            
            tempContainer.appendChild(dayElement);
        });

        // Add footer
        const footer = document.createElement('div');
        footer.style.cssText = `
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e7;
            color: #86868b;
            font-size: 0.9rem;
        `;
        footer.textContent = `Generated on ${new Date().toLocaleDateString()} | Indian Meal Planner`;
        tempContainer.appendChild(footer);

        // Add to DOM temporarily
        document.body.appendChild(tempContainer);

        // Use html2canvas to capture the image
        if (typeof html2canvas !== 'undefined') {
            html2canvas(tempContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                width: 800,
                height: tempContainer.scrollHeight
            }).then(canvas => {
                // Convert to image and download
                const link = document.createElement('a');
                link.download = `meal-plan-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL();
                link.click();
                
                // Clean up
                document.body.removeChild(tempContainer);
            });
        } else {
            // Fallback: load html2canvas from CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                html2canvas(tempContainer, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    width: 800,
                    height: tempContainer.scrollHeight
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `meal-plan-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                    document.body.removeChild(tempContainer);
                });
            };
            document.head.appendChild(script);
        }
    }

    clearMealPlan() {
        this.mealPlanData = {};
        this.mealPlanSection.style.display = 'none';
        this.shoppingListSection.style.display = 'none';
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        localStorage.setItem('mealPlannerIngredients', JSON.stringify(this.ingredients));
        localStorage.setItem('mealPlannerQuantities', JSON.stringify(this.ingredientQuantities));
        localStorage.setItem('mealPlannerMealPlan', JSON.stringify(this.mealPlanData));
        localStorage.setItem('mealPlannerFavorites', JSON.stringify(this.favorites));
        localStorage.setItem('mealPlannerPreferences', JSON.stringify(this.dietaryPreferences));
    }

    loadFromLocalStorage() {
        const savedIngredients = localStorage.getItem('mealPlannerIngredients');
        const savedQuantities = localStorage.getItem('mealPlannerQuantities');
        const savedMealPlan = localStorage.getItem('mealPlannerMealPlan');
        const savedFavorites = localStorage.getItem('mealPlannerFavorites');
        const savedPreferences = localStorage.getItem('mealPlannerPreferences');

        if (savedIngredients) {
            this.ingredients = JSON.parse(savedIngredients);
            // Restore checkbox states
            this.ingredients.forEach(ingredient => {
                const checkbox = document.querySelector(`input[value="${ingredient}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
            this.renderIngredients();
        }

        if (savedQuantities) {
            this.ingredientQuantities = JSON.parse(savedQuantities);
            // Restore quantity inputs
            Object.entries(this.ingredientQuantities).forEach(([ingredient, quantity]) => {
                const quantityInput = document.querySelector(`input[data-ingredient="${ingredient}"]`);
                if (quantityInput) {
                    quantityInput.value = quantity;
                }
            });
        }

        if (savedMealPlan) {
            this.mealPlanData = JSON.parse(savedMealPlan);
            this.renderMealPlan();
            this.mealPlanSection.style.display = 'block';
        }

        if (savedFavorites) {
            this.favorites = JSON.parse(savedFavorites);
            this.renderFavorites();
        }

        if (savedPreferences) {
            this.dietaryPreferences = JSON.parse(savedPreferences);
            // Restore checkbox states for dietary preferences
            Object.entries(this.dietaryPreferences).forEach(([pref, enabled]) => {
                const checkbox = document.getElementById(pref);
                if (checkbox) {
                    checkbox.checked = enabled;
                }
            });
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Checkbox-style, radio-behavior for diet type
  document.querySelectorAll('.diet-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function(e) {
      if (this.checked) {
        document.querySelectorAll('.diet-checkbox').forEach(cb => {
          if (cb !== this) cb.checked = false;
        });
        if (window.mealPlanner) {
          window.mealPlanner.selectedDietType = this.value;
        }
      } else {
        // Prevent unchecking all (always keep one checked)
        this.checked = true;
      }
    });
  });
  window.mealPlanner = new MealPlanner();
}); 