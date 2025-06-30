# Indian Meal Planner Web App

A modern, responsive Indian meal planner web app that helps you generate weekly meal plans based on your available ingredients, dietary preferences, and nutrition goals. Powered by authentic Indian recipes and optional AI meal planning (Gemini API).

## Features
- **Ingredient Selection:** Choose from a comprehensive list of Indian ingredients, with quantity inputs.
- **Dietary Preferences:** Select one diet type (Anything, Keto, Paleo, Vegan, Vegetarian) using visually modern toggle buttons.
- **Macros & Calories:** Input your target calories and macros (carbs, protein, fat) per day.
- **Meal Plan Modes:** Toggle between AI-powered meal plan (using Gemini API) and Strict Local Plan (only what you can make with your ingredients).
- **Shopping List:** Automatically generates a shopping list for missing/insufficient ingredients.
- **Favorites:** Mark meals as favorites for quick access.
- **Export/Print:** Export your meal plan as an image or print it.
- **Modern UI:** Apple-inspired, WhatsApp-style patterned background, fully responsive, and visually appealing.

## Demo
<!-- Add a screenshot after deployment -->
![Screenshot](screenshot.png)

## Getting Started

### 1. Clone the Repository
```sh
git clone https://github.com/YOUR_USERNAME/indian-meal-planner.git
cd indian-meal-planner
```

### 2. Add Your Gemini API Key (Optional, for AI mode)
- Open `script.js` and add your Gemini API key where indicated.
- **Note:** For production, do NOT expose your API key in client-side code. Use a backend or serverless function for security.

### 3. Open Locally
Just open `index.html` in your browser.

## Deployment

### Deploy on Netlify (Recommended)
1. Push your code to GitHub.
2. Sign up at [Netlify](https://www.netlify.com/) and connect your GitHub repo.
3. Click **Deploy site**. Netlify will give you a live URL.

## API Key Security
- **Warning:** Never expose your Google/Gemini API key in public code. For production, use a backend or Netlify serverless function to keep your key secret.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

## Supported Ingredients

The app includes a database of common ingredients and meal suggestions:

- **Proteins**: chicken, beef, fish, eggs
- **Grains**: pasta, rice, bread
- **Vegetables**: tomatoes, lettuce, vegetables (general)
- **And more!**

## Technical Details

- **Frontend Only**: No server required - everything runs in your browser
- **Local Storage**: Your data is saved locally and persists between sessions
- **Pure JavaScript**: Built with vanilla HTML, CSS, and JavaScript
- **Responsive**: Works on all device sizes

## Customization

You can easily customize the meal database by editing the `initializeMealDatabase()` function in `script.js`. Add your own favorite recipes and ingredients!

## Browser Compatibility

Works in all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

---

Enjoy your meal planning journey! 🎯 