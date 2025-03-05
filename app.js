document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements for better performance
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
        removeBgApiKey: 'aKL9mnpPJGeCCqA79ViWrgry',
        // Text-to-speech settings
        tts: {
            apiUrl: 'https://text.pollinations.ai/',
            model: 'openai-audio',
            voice: 'nova', // Child-friendly voice
        },
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

    // Initialize by creating stars and populating dropdowns - do this only once at startup
    createTwinklingStars();
    populateDropdowns();
    updateStatusMessage();
    
    // Audio cache for storing pre-generated audio files
    const audioCache = new Map();
    
    // Set up event listeners - using event delegation where possible
    generateBtn.addEventListener('click', generateImage);
    elementSelect.addEventListener('change', updateStatusMessage);
    styleSelect.addEventListener('change', updateStatusMessage);
    clearAllBtn.addEventListener('click', clearAllElements);
    
    // Initialize sidebar toggle functionality
    initSidebarToggle();
    
    /**
     * Populates the dropdown elements with options
     */
    function populateDropdowns() {
        // Populate space elements dropdown
        populateDropdown(elementSelect, config.spaceElements, true);
        
        // Populate style dropdown
        populateDropdown(styleSelect, config.styles);
    }
    
    /**
     * Populates a dropdown element with options
     * @param {HTMLSelectElement} selectElement - The select element to populate
     * @param {Object} options - Object containing options (key-value pairs)
     * @param {boolean} useValueAsLabel - Whether to use the value as the label
     */
    function populateDropdown(selectElement, options, useValueAsLabel = false) {
        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        for (const [key, value] of Object.entries(options)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = useValueAsLabel ? key : key.charAt(0).toUpperCase() + key.slice(1);
            fragment.appendChild(option);
        }
        
        selectElement.appendChild(fragment);
    }

    /**
     * Clears all elements from the space scene
     */
    function clearAllElements() {
        // Use more efficient innerHTML clearing
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
            const width = 512;  // Fixed size for better performance and consistent quality
            const height = 512;
            const seed = Math.floor(Math.random() * 1000000); // Random seed
            
            const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}`;
            
            // First generate the image
            updateStatus('Generating image...', 'info');
            
            // Use a timeout to prevent long-running requests
            const imageUrl = await loadImageWithTimeout(apiUrl, 30000);
            
            // Now process the image to remove the background
            updateStatus('Removing background...', 'info');
            
            // Use the remove.bg API to remove the background
            const processedImageBlob = await removeImageBackground(imageUrl);
            
            // Create a URL for the processed image
            const processedImageUrl = URL.createObjectURL(processedImageBlob);
            
            // Add the processed image to the scene
            addElementToScene(processedImageUrl, selectedElement, selectedSize);
            
            // Update status
            updateStatus('Space element added successfully!', 'success');
        } catch (error) {
            console.error('Error in image generation process:', error);
            updateStatus(`Error: ${error.message || 'Failed to create image'}`, 'error');
        } finally {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
        }
    }
    
    /**
     * Loads an image with a timeout
     * @param {string} url - The URL of the image to load
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<string>} - A promise that resolves to the image URL
     */
    function loadImageWithTimeout(url, timeout) {
        return new Promise((resolve, reject) => {
            const tempImage = new Image();
            
            // Set a timeout in case image loading takes too long
            const timeoutId = setTimeout(() => {
                reject(new Error('Image generation timed out. Please try again.'));
            }, timeout);
            
            tempImage.onload = () => {
                clearTimeout(timeoutId);
                resolve(url);
            };
            
            tempImage.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error('Failed to load image from API'));
            };
            
            tempImage.src = url;
        });
    }
    
    /**
     * Removes the background from an image using the remove.bg API
     * @param {string} imageUrl - The URL of the image to process
     * @returns {Promise<Blob>} - A promise that resolves to a Blob of the processed image
     */
    async function removeImageBackground(imageUrl) {
        try {
            // Create FormData for the API request
            const formData = new FormData();
            
            // First, fetch the original image and convert to blob
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) throw new Error('Failed to fetch image');
            
            const imageBlob = await imageResponse.blob();
            formData.append('image_file', imageBlob);
            
            // Add API key
            formData.append('size', 'auto');
            
            // Use cached results when possible to minimize API calls
            const apiUrl = 'https://api.remove.bg/v1.0/removebg';
            
            // Initialize AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
            
            // Make API request with timeout
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'X-Api-Key': config.removeBgApiKey
                },
                body: formData,
                signal: controller.signal
            });
            
            // Clear timeout since request completed
            clearTimeout(timeoutId);
            
            // Check for errors
            if (!response.ok) {
                // Try to get error details from response
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.errors?.[0]?.title || `API returned ${response.status}`;
                throw new Error(errorMessage);
            }
            
            // Get the processed image blob
            const processedImageBlob = await response.blob();
            return processedImageBlob;
        } catch (error) {
            // Handle different error types
            if (error.name === 'AbortError') {
                throw new Error('Background removal timed out. Please try again.');
            }
            
            console.error('Background removal error:', error);
            throw new Error(`Failed to remove background: ${error.message}`);
        }
    }

    /**
     * Adds a new element to the space scene
     * @param {string} imageUrl - The URL of the image to add
     * @param {string} elementType - The type of element
     * @param {string} sizePreference - The user's size preference (small, medium, large)
     */
    function addElementToScene(imageUrl, elementType, sizePreference = 'medium') {
        // Create element container
        const element = document.createElement('div');
        element.className = 'space-element';
        element.dataset.type = elementType;
        
        // Create image element
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = elementType;
        
        // Add loading indicator or placeholder until image loads
        img.style.opacity = '0';
        const placeholder = document.createElement('div');
        placeholder.className = 'element-placeholder';
        element.appendChild(placeholder);
        
        // Create tooltip element for showing element name
        const tooltip = document.createElement('div');
        tooltip.className = 'element-tooltip';
        tooltip.textContent = elementType;
        element.appendChild(tooltip);
        
        // Optimize image loading
        img.onload = () => {
            // Remove placeholder when image loads
            if (placeholder.parentNode === element) {
                element.removeChild(placeholder);
            }
            img.style.opacity = '1';
        };
        
        // Add image to element
        element.appendChild(img);
        
        // Add to scene
        spaceScene.appendChild(element);
        
        // Calculate size and position
        positionElementByType(element, elementType, sizePreference);
        
        // Make element draggable
        makeDraggable(element);
        
        // Preload audio for this element type (async)
        preloadElementAudio(elementType);
        
        return element;
    }
    
    /**
     * Preloads audio for an element type
     * @param {string} elementType - The type of element
     */
    async function preloadElementAudio(elementType) {
        try {
            // Check if audio is already cached
            if (audioCache.has(elementType)) return;
            
            // Prepare the text prompt with the required "Say:" prefix
            const textPrompt = `Say: ${elementType}`;
            
            // Use the Pollinations text-to-speech API to generate audio
            // Format: https://text.pollinations.ai/Welcome%20to%20Pollinations?model=openai-audio&voice=nova
            const apiUrl = `${config.tts.apiUrl}${encodeURIComponent(textPrompt)}?model=${config.tts.model}&voice=${config.tts.voice}`;
            
            // Fetch audio from API
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch audio from API');
            
            // Get the audio blob
            const audioBlob = await response.blob();
            
            // Create a URL for the audio
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Cache the audio for future use
            audioCache.set(elementType, audioUrl);
            
            console.log(`Preloaded audio for: ${elementType}`);
        } catch (error) {
            console.error('Error preloading audio:', error);
        }
    }
    
    /**
     * Makes an element draggable
     * @param {HTMLElement} element - The element to make draggable
     */
    function makeDraggable(element) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let currentX = 0, currentY = 0;
        let animationFrameId = null;
        
        // Use passive event listeners for better performance in touch events
        element.addEventListener('mousedown', startDrag);
        element.addEventListener('touchstart', startDrag, { passive: false });
        
        // Keep track of tooltip timeout
        let tooltipTimeoutId = null;
        
        // Add double-click event listener to show element name
        element.addEventListener('dblclick', handleDoubleClick);
        
        /**
         * Handle double-click event to show element tooltip
         * @param {Event} e - The event object
         */
        function handleDoubleClick(e) {
            // Prevent double-clicks from being interpreted as two single clicks
            e.preventDefault();
            e.stopPropagation();
            
            // Find tooltip element
            const tooltip = element.querySelector('.element-tooltip');
            if (!tooltip) return;
            
            // Toggle visibility
            tooltip.classList.toggle('visible');
            
            // Clear any existing timeout
            if (tooltipTimeoutId) {
                clearTimeout(tooltipTimeoutId);
            }
            
            // If tooltip is visible, set a timeout to hide it after 4 seconds
            if (tooltip.classList.contains('visible')) {
                tooltipTimeoutId = setTimeout(() => {
                    tooltip.classList.remove('visible');
                    tooltipTimeoutId = null;
                }, 4000); // 4 seconds
            }
            
            // Play audio for the element name
            playElementAudio(element.dataset.type);
        }
        
        /**
         * Initialize or update the current position tracking
         */
        function initializePosition() {
            // Get the computed style to determine the current position
            const style = window.getComputedStyle(element);
            
            // Get the current position (could be from transform, left/top, or other properties)
            const matrix = new DOMMatrix(style.transform);
            
            // If element already has explicit left/top values, use those
            if (element.style.left && element.style.left !== 'auto') {
                currentX = parseInt(element.style.left, 10) || 0;
            } else {
                // Otherwise use transform translateX value
                currentX = matrix.m41;
            }
            
            if (element.style.top && element.style.top !== 'auto') {
                currentY = parseInt(element.style.top, 10) || 0;
            } else {
                // Otherwise use transform translateY value
                currentY = matrix.m42;
            }
            
            // Make sure the element has absolute positioning
            if (style.position !== 'absolute' && style.position !== 'fixed') {
                element.style.position = 'absolute';
            }
            
            // Apply the calculated position to ensure consistent starting point
            element.style.left = `${currentX}px`;
            element.style.top = `${currentY}px`;
            element.style.transform = ''; // Clear transform to avoid conflicts
        }
        
        /**
         * Start dragging the element
         * @param {Event} e - The event object
         */
        function startDrag(e) {
            // Hide tooltip when dragging starts
            const tooltip = element.querySelector('.element-tooltip');
            if (tooltip && tooltip.classList.contains('visible')) {
                tooltip.classList.remove('visible');
                if (tooltipTimeoutId) {
                    clearTimeout(tooltipTimeoutId);
                    tooltipTimeoutId = null;
                }
            }
            
            // Prevent default behavior to avoid issues
            e.preventDefault();
            
            // Bring element to front when dragging starts
            bringToFront(element);
            
            // Initialize the current position tracking if needed
            initializePosition();
            
            // Record the starting mouse/touch position
            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX - currentX;
                startY = e.touches[0].clientY - currentY;
            } else {
                startX = e.clientX - currentX;
                startY = e.clientY - currentY;
            }
            
            isDragging = true;
            element.classList.add('dragging');
            
            // Add document-level event listeners only when dragging starts
            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);
            
            // Use requestAnimationFrame for smoother dragging
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(updatePosition);
        }
        
        /**
         * Continue dragging the element
         * @param {Event} e - The event object
         */
        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            
            // Update position based on current mouse/touch coordinates
            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX - startX;
                currentY = e.touches[0].clientY - startY;
            } else {
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
            }
            
            // Ensure the element stays within the space scene
            const sceneRect = spaceScene.getBoundingClientRect();
            const elemRect = element.getBoundingClientRect();
            
            // Calculate boundaries
            const minX = 0;
            const maxX = sceneRect.width - elemRect.width;
            const minY = 0;
            const maxY = sceneRect.height - elemRect.height;
            
            // Apply boundaries
            currentX = Math.max(minX, Math.min(currentX, maxX));
            currentY = Math.max(minY, Math.min(currentY, maxY));
        }
        
        /**
         * Updates the position of the element during dragging
         * Uses requestAnimationFrame for smoother performance
         */
        function updatePosition() {
            if (isDragging) {
                // Apply the new position
                element.style.left = `${currentX}px`;
                element.style.top = `${currentY}px`;
                
                // Continue animation loop
                animationFrameId = requestAnimationFrame(updatePosition);
            }
        }
        
        /**
         * Stop dragging the element
         */
        function stopDrag() {
            isDragging = false;
            element.classList.remove('dragging');
            
            // Remove document-level event listeners when dragging stops
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }
    }
    
    /**
     * Brings an element to the front
     * @param {HTMLElement} element - The element to bring to front
     */
    function bringToFront(element) {
        // Get all draggable elements
        const draggableElements = document.querySelectorAll('.space-element');
        
        // Find highest z-index
        let maxZ = 0;
        draggableElements.forEach(el => {
            const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
            maxZ = Math.max(maxZ, zIndex);
        });
        
        // Set new z-index
        element.style.zIndex = maxZ + 1;
    }

    /**
     * Creates dynamic twinkling stars in the background
     */
    function createTwinklingStars() {
        // Clear existing stars first
        const existingStars = document.querySelectorAll('.space-background .star');
        existingStars.forEach(star => star.remove());
        
        // Create stars with a document fragment for better performance
        const fragment = document.createDocumentFragment();
        const starCount = Math.min(100, window.innerWidth / 10); // Limit based on screen width
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Randomize star properties
            const size = Math.random() * 3 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Set different animation delays for more natural effect
            star.style.animationDelay = `${Math.random() * 3}s`;
            star.style.animationDuration = `${3 + Math.random() * 4}s`;
            
            fragment.appendChild(star);
        }
        
        spaceBackground.appendChild(fragment);
    }
    
    /**
     * Positions an element based on its type and size preference
     * @param {HTMLElement} element - The element to position
     * @param {string} elementType - The type of element
     * @param {string} sizePreference - The user's size preference (small, medium, large)
     */
    function positionElementByType(element, elementType, sizePreference) {
        // Calculate the size based on element type and user preference
        const size = calculateSizeForElement(elementType, sizePreference);
        
        // Set the size
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        
        // Get the scene dimensions
        const sceneRect = spaceScene.getBoundingClientRect();
        
        // Determine category to help with positioning
        const category = getCategoryForElement(elementType);
        
        // Set different initial positions based on element category
        switch (category) {
            case 'star':
                // Stars appear in the top portion of the scene
                positionElement(element, 
                    Math.random() * (sceneRect.width - size), 
                    Math.random() * (sceneRect.height / 3), 
                    size);
                break;
                
            case 'planet':
                // Planets appear in the middle section
                positionElement(element, 
                    Math.random() * (sceneRect.width - size), 
                    sceneRect.height / 3 + Math.random() * (sceneRect.height / 3), 
                    size);
                break;
                
            case 'spacecraft':
                // Spacecraft appear in varying positions
                positionElement(element, 
                    Math.random() * (sceneRect.width - size), 
                    Math.random() * (sceneRect.height - size), 
                    size);
                break;
                
            case 'alien':
                // Aliens and beings appear more in lower parts
                positionElement(element, 
                    Math.random() * (sceneRect.width - size), 
                    sceneRect.height / 2 + Math.random() * (sceneRect.height / 2 - size), 
                    size);
                break;
                
            default:
                // Random positioning for other elements
                positionRandomly(element, sceneRect, size);
        }
    }
    
    /**
     * Positions an element at random x,y coordinates within scene boundaries
     * @param {HTMLElement} element - The element to position
     * @param {DOMRect} sceneRect - The scene's bounding rectangle
     * @param {number} size - The size of the element
     */
    function positionRandomly(element, sceneRect, size) {
        const x = Math.random() * (sceneRect.width - size);
        const y = Math.random() * (sceneRect.height - size);
        positionElement(element, x, y, size);
    }
    
    /**
     * Positions an element at specific x,y coordinates
     * @param {HTMLElement} element - The element to position
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {number} size - The size of the element
     */
    function positionElement(element, x, y, size) {
        // Use transform for better performance
        element.style.transform = `translate(${x}px, ${y}px)`;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
    }
    
    /**
     * Calculates the size for an element based on its type and user preference
     * @param {string} elementType - The type of element
     * @param {string} sizePreference - The user's size preference (small, medium, large)
     * @returns {number} - The calculated size in pixels
     */
    function calculateSizeForElement(elementType, sizePreference) {
        // Base sizes
        const sizes = {
            small: {
                default: 100,
                star: 80,
                planet: 120,
                spacecraft: 100,
                alien: 100
            },
            medium: {
                default: 150,
                star: 120,
                planet: 180,
                spacecraft: 150,
                alien: 150
            },
            large: {
                default: 200,
                star: 160,
                planet: 240,
                spacecraft: 200,
                alien: 200
            }
        };
        
        // Get the element's category
        const category = getCategoryForElement(elementType);
        
        // Get the size preference, fallback to medium if not valid
        const sizePref = sizes[sizePreference] ? sizePreference : 'medium';
        
        // Determine size based on category and preference
        return sizes[sizePref][category] || sizes[sizePref].default;
    }
    
    /**
     * Determines the appropriate category for an element type
     * @param {string} elementType - The type of element
     * @returns {string} - The category name
     */
    function getCategoryForElement(elementType) {
        // Define categories
        const categories = {
            star: ['Sun', 'Star Cluster', 'Constellation', 'Supernova', 'Quasar', 'Stardust'],
            planet: ['Earth', 'Moon', 'Mars', 'Venus', 'Jupiter', 'Saturn', 'Pluto', 'Asteroid', 'Comet', 'Meteor', 'Black Hole', 'Nebula', 'Galaxy'],
            spacecraft: ['Spaceship', 'Space Station', 'Satellite', 'Space Telescope', 'Lunar Rover', 'Space Shuttle', 'Rocket', 'Space Probe', 'Space Capsule'],
            alien: ['Alien', 'UFO', 'Robot', 'Astronaut', 'Spacewalk', 'Space Explorer']
        };
        
        // Find which category the element belongs to
        for (const [category, elements] of Object.entries(categories)) {
            if (elements.includes(elementType)) {
                return category;
            }
        }
        
        // Default to 'default' if no category found
        return 'default';
    }
    
    /**
     * Updates the status message
     * @param {string} message - The message to display
     * @param {string} type - The type of message (success, error, info)
     */
    function updateStatus(message, type = 'info') {
        if (!statusMessage) return;
        
        // Update content
        statusMessage.textContent = message;
        
        // Update class based on type
        statusMessage.className = `status-message ${type}`;
        
        // For errors and success, automatically fade out after a delay
        if (type === 'success' || type === 'error') {
            // Use class for CSS transitions
            statusMessage.classList.add('fade-in');
            
            setTimeout(() => {
                statusMessage.classList.remove('fade-in');
                statusMessage.classList.add('fade-out');
                
                // Reset to default info after fading out
                setTimeout(() => {
                    updateStatusMessage();
                    statusMessage.classList.remove('fade-out');
                }, 500);
            }, 3000);
        }
    }
    
    /**
     * Initialize sidebar toggle functionality
     */
    function initSidebarToggle() {
        const sidebarToggleBtn = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggleBtn && sidebar) {
            sidebarToggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                
                // Update toggle button icon
                const toggleIcon = sidebarToggleBtn.querySelector('.toggle-icon');
                if (toggleIcon) {
                    toggleIcon.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
                }
            });
        }
        
        // Initialize mobile controls toggle
        initMobileControlsToggle();
    }
    
    /**
     * Initialize mobile controls toggle functionality
     */
    function initMobileControlsToggle() {
        const mobileToggleBtn = document.getElementById('mobile-controls-toggle');
        const controlsContainer = document.querySelector('.controls-container');
        
        if (mobileToggleBtn && controlsContainer) {
            // Check if we're on mobile and collapse by default if screen width is small
            if (window.innerWidth <= 768) {
                controlsContainer.classList.add('collapsed');
                mobileToggleBtn.classList.add('collapsed');
            }
            
            mobileToggleBtn.addEventListener('click', () => {
                controlsContainer.classList.toggle('collapsed');
                mobileToggleBtn.classList.toggle('collapsed');
            });
            
            // Also toggle when window is resized
            window.addEventListener('resize', () => {
                if (window.innerWidth <= 768) {
                    if (!controlsContainer.classList.contains('collapsed')) {
                        // Don't auto-collapse if user has explicitly expanded
                    }
                } else {
                    // Always expanded on desktop
                    controlsContainer.classList.remove('collapsed');
                    mobileToggleBtn.classList.remove('collapsed');
                }
            });
        }
    }
    
    // Optimize window resize event handler with throttling
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Clear previous timeout
        if (resizeTimeout) clearTimeout(resizeTimeout);
        
        // Set new timeout - will only run after resizing stops
        resizeTimeout = setTimeout(() => {
            createTwinklingStars();
        }, 250); // 250ms delay
    });
    
    /**
     * Plays audio for an element name
     * @param {string} elementName - The name of the element
     */
    async function playElementAudio(elementName) {
        try {
            // Check if audio is already cached
            if (audioCache.has(elementName)) {
                const audioUrl = audioCache.get(elementName);
                const audio = new Audio(audioUrl);
                audio.play();
                return;
            }
            
            // If not cached (rare case), preload and then play
            await preloadElementAudio(elementName);
            
            // Now it should be in the cache
            if (audioCache.has(elementName)) {
                const audioUrl = audioCache.get(elementName);
                const audio = new Audio(audioUrl);
                audio.play();
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }
});
