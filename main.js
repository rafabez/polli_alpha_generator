// DREAMLOADING - Main App Initialization
document.addEventListener('DOMContentLoaded', () => {
    const themes = {
        space: {
            title: "Space is The Place",
            description: "Explore stars, planets and the universe!",
            background: "space",
            prompt: "space landscape with stars and planets",
            htmlFile: "space_theme.html"
        },
        underwater: {
            title: "Underwater World",
            description: "Dive into the oceans and discover sea creatures!",
            background: "underwater",
            prompt: "underwater scene with coral reef and fish",
            htmlFile: "underwater_theme.html"
        },
        animals: {
            title: "Animal Animals",
            description: "Meet friendly animals from all over the world!",
            background: "forest",
            prompt: "forest with trees and animals",
            htmlFile: "animals_theme.html"
        },
        numbers: {
            title: "The Numbers",
            description: "Learn numbers in a fun space environment!",
            background: "space-numbers",
            prompt: "galaxy with stars and numbers",
            htmlFile: "numbers_theme.html"
        }
    };

    // Initialize app
    initApp();

    /**
     * Initialize the application
     */
    function initApp() {
        // Check if we're on the intro screen
        const introScreen = document.getElementById('intro-screen');
        
        if (introScreen) {
            setupIntroScreen();
        } else {
            // We're in a theme view, set up back button
            setupBackButton();
        }
    }

    /**
     * Set up the intro screen with theme cards
     */
    function setupIntroScreen() {
        const themeContainer = document.getElementById('theme-container');
        
        // Create a card for each theme
        Object.entries(themes).forEach(([key, theme]) => {
            createThemeCard(key, theme, themeContainer);
        });
    }

    /**
     * Create a theme card element
     * @param {string} key - Theme key 
     * @param {object} theme - Theme details
     * @param {HTMLElement} container - Container to append to
     */
    function createThemeCard(key, theme, container) {
        const card = document.createElement('div');
        card.className = 'theme-card';
        card.dataset.theme = key;
        
        // Generate background using pollinations AI - always use seed 42 for consistency
        const encodedPrompt = encodeURIComponent(theme.prompt);
        const seed = 42; // Always use 42 for consistent thumbnails
        const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}`;
        
        card.innerHTML = `
            <div class="theme-image" style="background-image: url('${apiUrl}')"></div>
            <div class="theme-info">
                <h2>${theme.title}</h2>
                <p>${theme.description}</p>
            </div>
        `;
        
        // Add click event to navigate to theme
        card.addEventListener('click', () => {
            navigateToTheme(key);
        });
        
        container.appendChild(card);
    }

    /**
     * Navigate to a specific theme
     * @param {string} themeKey - Key of the theme to navigate to
     */
    function navigateToTheme(themeKey) {
        // Store the current theme key for reference
        localStorage.setItem('currentTheme', themeKey);
        
        // Navigate to the theme-specific HTML file
        if (themes[themeKey] && themes[themeKey].htmlFile) {
            window.location.href = themes[themeKey].htmlFile;
        } else {
            console.error('HTML file not found for theme:', themeKey);
        }
    }

    /**
     * Set up back button functionality for theme views
     */
    function setupBackButton() {
        const backButton = document.getElementById('back-to-intro');
        
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }
});
