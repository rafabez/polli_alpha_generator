document.addEventListener('DOMContentLoaded', () => {
    const elementSelect = document.getElementById('element-select');
    const generateBtn = document.getElementById('generate-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const statusMessage = document.getElementById('status-message');
    const styleSelect = document.getElementById('style-select');
    const sizeSelect = document.getElementById('size-select');
    const spaceScene = document.getElementById('space-scene');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const spaceBackground = document.querySelector('.space-background');

    // Configuration
    const config = {
        // Remove.bg API key
        removeBgApiKey: '8UV2PRCupAE2T4JKZ4q4bDt7',
        // Space elements
        spaceElements: {
            // Celestial bodies
            "Sun": "bright glowing sun",
            "Earth": "planet earth",
            "Moon": "lunar surface with craters",
            "Mars": "red planet mars",
            "Venus": "planet venus",
            "Jupiter": "gas giant jupiter with swirling clouds",
            "Saturn": "planet saturn with rings",
            "Pluto": "dwarf planet pluto",
            "Comet": "comet with streaming tail",
            "Asteroid": "rocky space asteroid",
            "Meteor": "blazing meteor",
            "Black Hole": "black hole with accretion disk",
            "Nebula": "colorful nebula cloud",
            "Galaxy": "spiral galaxy",
            "Supernova": "exploding supernova",
            "Quasar": "bright quasar",
            
            // Human-made objects
            "Spaceship": "futuristic spaceship",
            "Space Station": "orbiting space station",
            "Satellite": "communications satellite",
            "Space Telescope": "hubble-style space telescope",
            "Lunar Rover": "moon rover vehicle",
            "Space Shuttle": "nasa space shuttle",
            "Rocket": "launching rocket",
            "Space Probe": "deep space probe",
            "Space Capsule": "astronaut space capsule",
            
            // Aliens and sci-fi
            "Alien": "friendly alien being",
            "UFO": "flying saucer ufo",
            "Robot": "space exploration robot",
            "Space Colony": "futuristic space colony",
            "Wormhole": "space-time wormhole",
            "Portal": "interstellar portal",
            
            // Astronauts
            "Astronaut": "astronaut in spacesuit",
            "Spacewalk": "astronaut on spacewalk",
            "Space Explorer": "human space explorer",
            
            // Other space objects
            "Space Dust": "cosmic dust particles",
            "Northern Lights": "aurora borealis in space",
            "Star Cluster": "cluster of bright stars",
            "Constellation": "constellation of stars",
            "Milky Way": "milky way galaxy view",
            "Stardust": "shimmering stardust"
        },
        // Style options
        styles: {
            cartoon: 'cartoon comic book style drawing with white background, and generate only this:',
            cyberpunk: 'cyberpunk neon digital art with white background,and generate only this:',
            scifi: 'sci-fi futuristic detailed illustration with white background,and generate only this:',
            realistic: 'realistic detailed illustration with white background,and generate only this:',
            anime: 'anime style colorful illustration with white background,and generate only this:',
            watercolor: 'watercolor painting style with white background,and generate only this:',
            pixelart: 'pixel art style with white background,and generate only this:',
            minimalist: 'minimalist clean vector illustration with white background,and generate only this:',
            fantasy: 'fantasy mythical illustration with white background,and generate only this:',
            steampunk: 'steampunk mechanical detailed art with white background,and generate only this:',
            vaporwave: 'vaporwave retro 80s style with white background,and generate only this:',
            alien: 'alien extraterrestrial weird art with white background,and generate only this:',
            surreal: 'surreal dreamlike psychedelic art with white background,and generate only this:'
        }
    };

    // Create dynamic twinkling stars for the background
    createTwinklingStars();

    // Populate space elements dropdown
    populateDropdown(elementSelect, config.spaceElements, true);
    
    // Populate style dropdown
    populateDropdown(styleSelect, config.styles);
    
    /**
     * Populates a dropdown element with options
     * @param {HTMLSelectElement} selectElement - The select element to populate
     * @param {Object} options - Object containing options (key-value pairs)
     * @param {boolean} useValueAsLabel - Whether to use the value as the label
     */
    function populateDropdown(selectElement, options, useValueAsLabel = false) {
        for (const [key, value] of Object.entries(options)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = useValueAsLabel ? key : key.charAt(0).toUpperCase() + key.slice(1);
            selectElement.appendChild(option);
        }
    }

    // Initialize status message
    updateStatusMessage();
    
    // Set up event listeners
    generateBtn.addEventListener('click', generateImage);
    elementSelect.addEventListener('change', updateStatusMessage);
    styleSelect.addEventListener('change', updateStatusMessage);
    clearAllBtn.addEventListener('click', clearAllElements);
    
    // Initialize sidebar toggle functionality
    initSidebarToggle();
    
    // Create twinkling stars background
    createTwinklingStars();
    
    // Initialize by populating dropdowns
    populateDropdowns();

    /**
     * Clears all elements from the space scene
     */
    function clearAllElements() {
        spaceScene.innerHTML = '';
        updateStatus('All space elements cleared', 'info');
    }
    
    /**
     * Updates the status message based on current selections
     */
    function updateStatusMessage() {
        const element = elementSelect.options[elementSelect.selectedIndex].text;
        const style = styleSelect.options[styleSelect.selectedIndex].text;
        const size = sizeSelect.options[sizeSelect.selectedIndex].text;
        statusMessage.textContent = `Ready to generate a ${style} style ${element} (${size})`;
        statusMessage.className = 'info';
    }
    
    /**
     * Main function to generate an image based on the selected element and style
     */
    async function generateImage() {
        const selectedElement = elementSelect.value;
        const selectedStyle = styleSelect.value;
        const selectedSize = sizeSelect.value;
        
        if (!selectedElement) {
            updateStatus('Please select a space element first', 'error');
            return;
        }

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        updateStatus('Creating your space artwork...', 'info');

        try {
            // Get the selected style and space element
            const stylePrompt = config.styles[selectedStyle] || config.styles.cartoon;
            const elementPrompt = config.spaceElements[selectedElement] || selectedElement;
            
            // Combine style and element for the final prompt
            const fullPrompt = stylePrompt + ' ' + elementPrompt;
            
            // Prepare the API URL with parameters
            const encodedPrompt = encodeURIComponent(fullPrompt);
            const width = 512;  // Increased size for better quality
            const height = 512;
            const seed = Math.floor(Math.random() * 1000000); // Random seed
            
            // Log the full prompt being used
            console.log('Using prompt:', fullPrompt);
            
            const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}`;
            
            // First generate the image
            updateStatus('Generating image...', 'info');
            
            // Use a timeout to prevent long-running requests
            const imageLoadPromise = new Promise((resolve, reject) => {
                const tempImage = new Image();
                
                // Set a timeout in case image loading takes too long
                const timeout = setTimeout(() => {
                    reject(new Error('Image generation timed out. Please try again.'));
                }, 30000); // 30 seconds timeout
                
                tempImage.onload = () => {
                    clearTimeout(timeout);
                    resolve(apiUrl);
                };
                
                tempImage.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Failed to generate image. Please try a different prompt.'));
                };
                
                tempImage.src = apiUrl;
            });
            
            const generatedImageUrl = await imageLoadPromise;
            
            // Then remove the background
            updateStatus('Removing background...', 'info');
            
            try {
                const transparentImageBlob = await removeImageBackground(generatedImageUrl);
                
                // Create a URL for the transparent image
                const transparentImageUrl = URL.createObjectURL(transparentImageBlob);
                
                // Add the new image to the space scene
                addElementToScene(transparentImageUrl, selectedElement, selectedSize);
                
                loadingIndicator.classList.add('hidden');
                updateStatus('Your space artwork is ready!', 'success');
                
            } catch (error) {
                console.error('Background removal failed:', error);
                updateStatus('Error removing background. Using original image.', 'error');
                
                // If background removal fails, use the original image
                addElementToScene(generatedImageUrl, selectedElement, selectedSize);
                
                loadingIndicator.classList.add('hidden');
            }
            
        } catch (error) {
            console.error('Image generation error:', error);
            updateStatus(`Error: ${error.message}`, 'error');
            loadingIndicator.classList.add('hidden');
        }
    }
    
    /**
     * Makes an element draggable
     * @param {HTMLElement} element - The element to make draggable
     */
    function makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;
        let originalAnimationClass = '';
        
        // Mouse event handlers
        element.addEventListener('mousedown', startDrag);
        
        function startDrag(e) {
            // Prevent default behavior and bubbling
            e.preventDefault();
            e.stopPropagation();
            
            // Store original position relative to the viewport
            const rect = element.getBoundingClientRect();
            
            // Calculate the offset of the mouse cursor from the element's top-left corner
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            // Start dragging
            isDragging = true;
            
            // Add the event listeners for mousemove and mouseup
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            
            // Change cursor style
            element.style.cursor = 'grabbing';
            
            // Bring to front
            bringToFront(element);
            
            // Pause animations while dragging
            saveAndPauseAnimation(element);
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            // Calculate the new position
            const sceneRect = spaceScene.getBoundingClientRect();
            
            // Get element dimensions
            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight;
            
            // Calculate boundaries to keep element within scene
            const minX = sceneRect.left;
            const maxX = sceneRect.right - elementWidth;
            const minY = sceneRect.top;
            const maxY = sceneRect.bottom - elementHeight;
            
            // Update position, keeping element within boundaries
            const newX = Math.min(Math.max(e.clientX - offsetX, minX), maxX);
            const newY = Math.min(Math.max(e.clientY - offsetY, minY), maxY);
            
            // Set the new position
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
        }
        
        function stopDrag() {
            if (!isDragging) return;
            
            // End dragging
            isDragging = false;
            
            // Remove the event listeners
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            
            // Reset cursor style
            element.style.cursor = 'grab';
            
            // Restore animation
            restoreAnimation(element);
        }
        
        // Touch event handlers for mobile devices
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd);
        
        function handleTouchStart(e) {
            // Prevent default to disable scrolling while dragging
            e.preventDefault();
            
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const rect = element.getBoundingClientRect();
                offsetX = touch.clientX - rect.left;
                offsetY = touch.clientY - rect.top;
                isDragging = true;
                
                // Bring to front
                bringToFront(element);
                
                // Pause animations while dragging
                saveAndPauseAnimation(element);
            }
        }
        
        function handleTouchMove(e) {
            if (!isDragging) return;
            e.preventDefault();
            
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                
                // Calculate the new position
                const sceneRect = spaceScene.getBoundingClientRect();
                
                // Get element dimensions
                const elementWidth = element.offsetWidth;
                const elementHeight = element.offsetHeight;
                
                // Calculate boundaries to keep element within scene
                const minX = sceneRect.left;
                const maxX = sceneRect.right - elementWidth;
                const minY = sceneRect.top;
                const maxY = sceneRect.bottom - elementHeight;
                
                // Update position, keeping element within boundaries
                const newX = Math.min(Math.max(touch.clientX - offsetX, minX), maxX);
                const newY = Math.min(Math.max(touch.clientY - offsetY, minY), maxY);
                
                // Set the new position
                element.style.left = `${newX}px`;
                element.style.top = `${newY}px`;
            }
        }
        
        function handleTouchEnd() {
            isDragging = false;
            
            // Restore animation
            restoreAnimation(element);
        }
        
        // Function to save and pause animation during drag
        function saveAndPauseAnimation(el) {
            // Find category class (for animation)
            Array.from(el.classList).forEach(className => {
                if (className.startsWith('category-')) {
                    originalAnimationClass = className;
                    el.classList.remove(className);
                }
            });
        }
        
        // Function to restore animation after drag
        function restoreAnimation(el) {
            if (originalAnimationClass) {
                el.classList.add(originalAnimationClass);
            }
        }
    }
    
    /**
     * Brings an element to the front
     * @param {HTMLElement} element - The element to bring to front
     */
    function bringToFront(element) {
        // Get all space elements
        const elements = document.querySelectorAll('.space-element');
        
        // Find the highest z-index
        let maxZ = 20; // Start from 20 to ensure it's above controls (z-index: 15)
        elements.forEach(el => {
            const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
            maxZ = Math.max(maxZ, zIndex);
        });
        
        // Set this element's z-index higher than all others
        element.style.zIndex = maxZ + 1;
    }
    
    /**
     * Adds a new element to the space scene
     * @param {string} imageUrl - The URL of the image to add
     * @param {string} elementType - The type of element
     * @param {string} sizePreference - The user's size preference (small, medium, large)
     */
    function addElementToScene(imageUrl, elementType, sizePreference = 'medium') {
        // Create a new image element
        const newElement = document.createElement('img');
        newElement.src = imageUrl;
        newElement.alt = elementType;
        newElement.className = 'space-element';
        
        // Add the appropriate category class based on element type
        const category = getCategoryForElement(elementType);
        if (category) {
            newElement.classList.add(`category-${category}`);
        }
        
        // Add to the scene first so we can get proper dimensions
        spaceScene.appendChild(newElement);
        
        // Position element appropriately based on type and size preference
        positionElementByType(newElement, elementType, sizePreference);
        
        // Make element draggable
        makeDraggable(newElement);
    }
    
    /**
     * Positions an element based on its type and size preference
     * @param {HTMLElement} element - The element to position
     * @param {string} elementType - The type of element
     * @param {string} sizePreference - The user's size preference (small, medium, large)
     */
    function positionElementByType(element, elementType, sizePreference) {
        const sceneRect = spaceScene.getBoundingClientRect();
        const padding = 20; // padding from edges
        
        // Calculate size based on element type and user preference
        const size = calculateSizeForElement(elementType, sizePreference);
        
        // Get the element category
        const category = getCategoryForElement(elementType);
        
        switch(category) {
            case 'planet':
                // Planets are larger
                // Position planet in the scene (anywhere)
                positionRandomly(element, sceneRect, size);
                break;
                
            case 'star':
                if (elementType === 'Sun') {
                    // Sun should be larger
                    // Position sun near the edge
                    const sunX = Math.random() < 0.5 ? padding : sceneRect.width - size - padding;
                    const sunY = Math.random() * (sceneRect.height - size - padding * 2) + padding;
                    positionElement(element, sunX, sunY, size);
                } else {
                    // Other stars are smaller
                    // Stars positioned anywhere
                    positionRandomly(element, sceneRect, size);
                }
                break;
                
            case 'spaceship':
            case 'rocket':
                // Spaceships and rockets are medium sized
                // Position at the scene sides to allow for fly-through animation
                const spaceshipX = Math.random() < 0.5 ? -size/2 : sceneRect.width - size/2;
                const spaceshipY = Math.random() * (sceneRect.height - size - padding * 2) + padding;
                positionElement(element, spaceshipX, spaceshipY, size);
                break;
                
            case 'comet':
            case 'meteor':
            case 'asteroid':
                // These are smaller
                // Position at the scene sides for fly-through animation
                const meteorX = -size; // Start offscreen
                const meteorY = Math.random() * (sceneRect.height - size - padding * 2) + padding;
                positionElement(element, meteorX, meteorY, size);
                
                // For these elements, add a different animation that crosses the screen
                element.style.animation = 'flyAcross 10s linear infinite';
                element.style.animationDelay = `${Math.random() * 5}s`;
                break;
                
            case 'satellite':
            case 'station':
                // These are medium sized
                // Position in the upper part of the scene
                const stationX = Math.random() * (sceneRect.width - size - padding * 2) + padding;
                const stationY = Math.random() * (sceneRect.height / 2 - size - padding) + padding;
                positionElement(element, stationX, stationY, size);
                break;
                
            case 'alien':
            case 'astronaut':
                // These are medium sized
                // Position anywhere
                positionRandomly(element, sceneRect, size);
                break;
                
            case 'celestial':
            default:
                // Default random size
                // Position anywhere
                positionRandomly(element, sceneRect, size);
                break;
        }
    }
    
    /**
     * Positions an element at random x,y coordinates within scene boundaries
     * @param {HTMLElement} element - The element to position
     * @param {DOMRect} sceneRect - The scene's bounding rectangle
     * @param {number} size - The size of the element
     */
    function positionRandomly(element, sceneRect, size) {
        const padding = 20;
        // Random position (with padding from edges)
        const randomX = Math.floor(Math.random() * (sceneRect.width - size - padding * 2)) + padding;
        const randomY = Math.floor(Math.random() * (sceneRect.height - size - padding * 2)) + padding;
        
        positionElement(element, randomX, randomY, size);
    }
    
    /**
     * Positions an element at specific x,y coordinates
     * @param {HTMLElement} element - The element to position
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {number} size - The size of the element
     */
    function positionElement(element, x, y, size) {
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${size}px`;
        element.style.height = 'auto';
        element.style.zIndex = Math.floor(Math.random() * 10) + 20; // Random z-index starting at 20
    }
    
    /**
     * Calculates the size for an element based on its type and user preference
     * @param {string} elementType - The type of element
     * @param {string} sizePreference - The user's size preference (small, medium, large)
     * @returns {number} - The calculated size in pixels
     */
    function calculateSizeForElement(elementType, sizePreference) {
        // Base size multipliers for each preference
        const sizeMultipliers = {
            small: 0.7,
            medium: 1.0,
            large: 1.4
        };
        
        const multiplier = sizeMultipliers[sizePreference] || 1.0;
        
        // Base sizes for different categories
        let baseSize;
        
        switch (elementType) {
            case 'Sun':
                baseSize = Math.floor(Math.random() * 100) + 150; // 150-250px
                break;
            case 'Earth':
            case 'Mars':
            case 'Venus':
            case 'Jupiter':
            case 'Saturn':
            case 'Pluto':
                baseSize = Math.floor(Math.random() * 80) + 80; // 80-160px
                break;
            case 'Moon':
                baseSize = Math.floor(Math.random() * 40) + 40; // 40-80px
                break;
            case 'Comet':
            case 'Meteor':
            case 'Asteroid':
                baseSize = Math.floor(Math.random() * 30) + 30; // 30-60px
                break;
            case 'Black Hole':
            case 'Nebula':
            case 'Galaxy':
            case 'Supernova':
            case 'Quasar':
                baseSize = Math.floor(Math.random() * 50) + 100; // 100-150px
                break;
            case 'Spaceship':
            case 'Space Station':
            case 'Satellite':
            case 'Space Telescope':
            case 'Lunar Rover':
            case 'Space Shuttle':
            case 'Rocket':
            case 'Space Probe':
            case 'Space Capsule':
                baseSize = Math.floor(Math.random() * 40) + 60; // 60-100px
                break;
            case 'Alien':
            case 'UFO':
            case 'Robot':
            case 'Space Colony':
            case 'Wormhole':
            case 'Portal':
            case 'Astronaut':
            case 'Spacewalk':
            case 'Space Explorer':
                baseSize = Math.floor(Math.random() * 40) + 40; // 40-80px
                break;
            default:
                baseSize = Math.floor(Math.random() * 60) + 60; // 60-120px
        }
        
        return Math.floor(baseSize * multiplier);
    }

    /**
     * Determines the appropriate category for an element type
     * @param {string} elementType - The type of element
     * @returns {string} - The category name
     */
    function getCategoryForElement(elementType) {
        const planetTypes = ['Earth', 'Moon', 'Mars', 'Venus', 'Jupiter', 'Saturn', 'Pluto'];
        const starTypes = ['Sun', 'Star Cluster', 'Constellation', 'Milky Way'];
        const spaceshipTypes = ['Spaceship', 'Space Probe', 'Space Shuttle', 'Space Capsule'];
        const satelliteTypes = ['Satellite', 'Space Telescope'];
        const alienTypes = ['Alien', 'UFO', 'Robot'];
        const astronautTypes = ['Astronaut', 'Spacewalk', 'Space Explorer'];
        const stationTypes = ['Space Station', 'Space Colony'];
        const meteorTypes = ['Meteor'];
        const cometTypes = ['Comet'];
        const asteroidTypes = ['Asteroid'];
        const celestialTypes = ['Black Hole', 'Nebula', 'Galaxy', 'Supernova', 'Quasar', 'Stardust', 'Space Dust'];
        
        if (planetTypes.includes(elementType)) return 'planet';
        if (elementType === 'Moon') return 'moon';
        if (starTypes.includes(elementType)) return 'star';
        if (spaceshipTypes.includes(elementType)) return 'spaceship';
        if (elementType === 'Rocket') return 'rocket';
        if (satelliteTypes.includes(elementType)) return 'satellite';
        if (alienTypes.includes(elementType)) return 'alien';
        if (astronautTypes.includes(elementType)) return 'astronaut';
        if (stationTypes.includes(elementType)) return 'station';
        if (meteorTypes.includes(elementType)) return 'meteor';
        if (cometTypes.includes(elementType)) return 'comet';
        if (asteroidTypes.includes(elementType)) return 'asteroid';
        if (celestialTypes.includes(elementType)) return 'celestial';
        
        return 'celestial'; // Default category
    }

    /**
     * Creates dynamic twinkling stars in the background
     */
    function createTwinklingStars() {
        // Number of stars to create
        const numberOfStars = 150;
        
        for (let i = 0; i < numberOfStars; i++) {
            // Create a star element
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Random size (between 1px and 3px)
            const size = Math.random() * 2 + 1;
            
            // Random opacity
            const opacity = Math.random() * 0.8 + 0.2;
            
            // Random twinkle animation duration
            const duration = Math.random() * 5 + 3;
            const delay = Math.random() * 5;
            
            // Set style properties
            star.style.left = `${posX}%`;
            star.style.top = `${posY}%`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.opacity = opacity;
            star.style.animation = `star-twinkle ${duration}s ease-in-out ${delay}s infinite alternate`;
            
            // Add to background
            spaceBackground.appendChild(star);
        }
    }

    /**
     * Removes the background from an image using the remove.bg API
     * @param {string} imageUrl - The URL of the image to process
     * @returns {Promise<Blob>} - A promise that resolves to a Blob of the processed image
     */
    async function removeImageBackground(imageUrl) {
        try {
            // First, fetch the image as a blob
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
            }
            
            const imageBlob = await imageResponse.blob();
            
            // Create FormData with the image
            const formData = new FormData();
            formData.append('size', 'auto');
            formData.append('image_file', imageBlob, 'image.png');
            
            // Create a promise with timeout for the remove.bg API
            const removePromise = new Promise(async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Background removal timed out'));
                }, 20000); // 20 seconds timeout
                
                try {
                    // Send the image to remove.bg API
                    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                        method: 'POST',
                        headers: {
                            'X-Api-Key': config.removeBgApiKey
                        },
                        body: formData
                    });
                    
                    clearTimeout(timeout);
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        reject(new Error(`Remove.bg API error: ${response.status} ${errorData.errors?.[0]?.title || response.statusText}`));
                        return;
                    }
                    
                    // Get the processed image
                    const processedImageBlob = await response.blob();
                    resolve(processedImageBlob);
                } catch (error) {
                    clearTimeout(timeout);
                    reject(error);
                }
            });
            
            return await removePromise;
        } catch (error) {
            console.error('Error removing background:', error);
            throw error;
        }
    }

    /**
     * Updates the status message
     * @param {string} message - The message to display
     * @param {string} type - The type of message (success, error, info)
     */
    function updateStatus(message, type = 'info') {
        statusMessage.textContent = message;
        
        // Remove all existing classes
        statusMessage.className = '';
        
        // Add the type class
        statusMessage.classList.add(type);
        
        // If it's a success message, set a timer to reset to default after fade out
        if (type === 'success') {
            // Clear any existing timers
            if (window.statusResetTimer) {
                clearTimeout(window.statusResetTimer);
            }
            
            // Set timer to reset status after fadeout animation completes (5s total: 2s delay + 3s animation)
            window.statusResetTimer = setTimeout(() => {
                // Check if the user hasn't interacted with the form during the fadeout
                const element = elementSelect.options[elementSelect.selectedIndex]?.text || '';
                const style = styleSelect.options[styleSelect.selectedIndex]?.text || '';
                const size = sizeSelect.options[sizeSelect.selectedIndex]?.text || '';
                
                if (element && style && size) {
                    statusMessage.textContent = `Ready to generate a ${style} style ${element} (${size})`;
                    statusMessage.className = 'info';
                    statusMessage.style.opacity = '1';
                    statusMessage.style.visibility = 'visible';
                }
            }, 5000);
        }
    }

    // Initialize sidebar toggle functionality
    function initSidebarToggle() {
        const sidebar = document.querySelector('.sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const toggleIcon = sidebarToggle.querySelector('.toggle-icon');
        
        // Check if sidebar state is saved in localStorage
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        // Apply saved state
        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            toggleIcon.textContent = '▶';
        }
        
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            
            // Save state to localStorage
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
            
            // Update icon based on state
            toggleIcon.textContent = isCollapsed ? '▶' : '◀';
        });
    }

    /**
     * Populates all dropdown menus with their options
     */
    function populateDropdowns() {
        // Populate space element dropdown
        populateDropdown(elementSelect, config.spaceElements);
        
        // Populate style dropdown
        populateDropdown(styleSelect, config.styles, true);
    }
});
