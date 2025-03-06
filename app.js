// DREAMLOADING App - Core Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements for better performance
    const elementSelect = document.getElementById('element-select');
    const styleSelect = document.getElementById('style-select');
    const sizeSelect = document.getElementById('size-select');
    const generateBtn = document.getElementById('generate-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mobileControlsToggle = document.getElementById('mobile-controls-toggle');
    const backToIntroBtn = document.getElementById('back-to-intro');
    const scene = document.getElementById('scene');
    const loadingIndicator = document.getElementById('loading-indicator');
    const statusMessage = document.getElementById('status-message');
    
    // Set up theme tracking 
    const currentTheme = getCurrentTheme();
    
    // Initialize elements array to track generated elements
    let elements = [];
    
    // Flag to track if it's the first time loading the theme
    const isFirstVisit = !sessionStorage.getItem(`visited_${currentTheme}`);
    
    /**
     * Initialize the app with event listeners and setup
     */
    function init() {
        // Set up event listeners
        generateBtn.addEventListener('click', generateElement);
        clearAllBtn.addEventListener('click', clearAllElements);
        sidebarToggle.addEventListener('click', toggleSidebar);
        if (mobileControlsToggle) {
            mobileControlsToggle.addEventListener('click', toggleMobileControls);
        }
        
        // Set up info popup functionality
        setupInfoPopup();
        
        // Populate dropdowns with theme-specific data
        populateDropdowns();
        
        // Set up the theme
        setupTheme();
        
        // Update status message
        updateStatus('Select an element and style, then click Generate');
        
        // Set up back to intro button
        if (backToIntroBtn) {
            backToIntroBtn.addEventListener('click', () => {
                window.location.href = 'index.html'; // Directly navigate to index.html
            });
        }
        
        // Show info popup on first visit to this theme
        if (isFirstVisit) {
            setTimeout(() => {
                const infoPopup = document.getElementById('info-popup');
                if (infoPopup) {
                    infoPopup.classList.add('visible');
                    sessionStorage.setItem(`visited_${currentTheme}`, 'true');
                }
            }, 1000);
        }
    }
    
    init();
    
    /**
     * Set up the theme based on the current theme setting
     */
    function setupTheme() {
        // Set the theme title
        const themeTitle = document.getElementById('theme-title');
        if (themeTitle && window.themeData[currentTheme]) {
            themeTitle.textContent = window.themeData[currentTheme].title;
        }
        
        // Apply theme-specific background if not already set in HTML
        const themeBackground = document.querySelector('.theme-background');
        if (themeBackground && window.themeData[currentTheme]) {
            // Add the theme class to the background if not already present
            const themeClass = window.themeData[currentTheme].background;
            if (!themeBackground.classList.contains(themeClass)) {
                themeBackground.classList.add(themeClass);
            }
        }
    }
    
    /**
     * Populate dropdowns with theme-specific data
     */
    function populateDropdowns() {
        if (!window.themeData || !window.themeData[currentTheme]) {
            console.error('Theme data not available');
            return;
        }
        
        const theme = window.themeData[currentTheme];
        
        // Populate element select
        if (elementSelect && theme.elements) {
            populateDropdown(elementSelect, theme.elements);
        }
        
        // Populate style select
        if (styleSelect && theme.styles) {
            populateDropdown(styleSelect, theme.styles);
        }
    }
    
    /**
     * Populate a dropdown with options
     * @param {HTMLSelectElement} dropdown - The dropdown to populate
     * @param {Array} options - Array of option objects with value and label properties
     */
    function populateDropdown(dropdown, options) {
        // Clear existing options
        dropdown.innerHTML = '';
        
        // Add options from the theme data
        options.forEach((option, index) => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            
            // Select the first option by default
            if (index === 0) {
                optionElement.selected = true;
            }
            
            dropdown.appendChild(optionElement);
        });
    }
    
    /**
     * Toggle sidebar visibility
     */
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('collapsed');
        
        // Update toggle icon
        const toggleIcon = sidebarToggle.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
        }
    }
    
    /**
     * Toggle mobile controls visibility
     */
    function toggleMobileControls() {
        const controlsContainer = document.querySelector('.controls-container');
        controlsContainer.classList.toggle('expanded');
        
        // Update toggle icon
        const toggleIcon = mobileControlsToggle.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = controlsContainer.classList.contains('expanded') ? '▲' : '▼';
        }
    }
    
    /**
     * Set up the info popup functionality
     */
    function setupInfoPopup() {
        const infoButton = document.getElementById('info-button');
        const infoPopup = document.getElementById('info-popup');
        const closeButton = document.getElementById('info-popup-close');
        
        if (!infoButton || !infoPopup || !closeButton) {
            console.error('Info popup elements not found');
            return;
        }
        
        // Show popup when info button is clicked
        infoButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            infoPopup.classList.add('visible');
            console.log('Info popup opened');
        });
        
        // Hide popup when close button is clicked
        closeButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            infoPopup.classList.remove('visible');
            console.log('Info popup closed via close button');
        });
        
        // Hide popup when clicking outside of it
        document.addEventListener('click', (event) => {
            if (infoPopup.classList.contains('visible') && 
                !infoPopup.contains(event.target) && 
                event.target !== infoButton) {
                infoPopup.classList.remove('visible');
                console.log('Info popup closed via outside click');
            }
        });
        
        // Escape key to close popup
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && infoPopup.classList.contains('visible')) {
                infoPopup.classList.remove('visible');
                console.log('Info popup closed via Escape key');
            }
        });
        
        // Make popup draggable
        makeDraggable(infoPopup);
        
        console.log('Info popup functionality initialized');
    }
    
    /**
     * Make an element draggable
     * @param {HTMLElement} element - Element to make draggable
     */
    function makeDraggable(element) {
        if (!element) return;
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        // Reset the transform when we first make it draggable so it starts in the center
        element.style.transform = 'translate(-50%, -50%)';
        
        // Check if the element has a header element to use as the drag handle
        const dragHandle = element.querySelector('.info-popup-header') || element;
        
        dragHandle.addEventListener('mousedown', dragStart);
        dragHandle.addEventListener('touchstart', dragStart, { passive: false });
        
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        
        function dragStart(e) {
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            
            if (e.target === dragHandle || dragHandle.contains(e.target)) {
                isDragging = true;
                element.style.transition = 'none';
                
                // When starting to drag, change the transform origin so it doesn't scale from center
                element.classList.add('dragging');
            }
            
            e.preventDefault();
            e.stopPropagation();
        }
        
        function dragEnd(e) {
            if (!isDragging) return;
            
            initialX = currentX;
            initialY = currentY;
            
            isDragging = false;
            element.style.transition = 'all 0.1s ease';
            element.classList.remove('dragging');
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }
            
            xOffset = currentX;
            yOffset = currentY;
            
            // Calculate position to keep it within viewport bounds
            const rect = element.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Ensure we don't drag it completely off screen
            const minX = -viewportWidth / 2 + rect.width / 2;
            const maxX = viewportWidth / 2 - rect.width / 2;
            const minY = -viewportHeight / 2 + rect.height / 2;
            const maxY = viewportHeight / 2 - rect.height / 2;
            
            const boundedX = Math.min(Math.max(currentX, minX), maxX);
            const boundedY = Math.min(Math.max(currentY, minY), maxY);
            
            setTranslate(boundedX, boundedY, element);
        }
        
        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
        }
    }
    
    /**
     * Update status message
     * @param {string} message - Message to display
     * @param {string} type - Message type (success, error, info)
     */
    function updateStatus(message, type = 'info') {
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = ''; // Reset classes
            statusMessage.classList.add(type);
            
            // Show the info popup for important messages but not for element creation success
            if ((type === 'error') && !message.includes('Generated')) {
                const infoPopup = document.getElementById('info-popup');
                if (infoPopup && !infoPopup.classList.contains('visible')) {
                    infoPopup.classList.add('visible');
                }
            }
        }
    }
    
    /**
     * Generate a new element based on selected options
     */
    function generateElement() {
        const elementValue = elementSelect.value;
        const styleValue = styleSelect.value;
        const sizeValue = sizeSelect.value;
        
        if (!elementValue || !styleValue) {
            updateStatus('Please select all required options', 'error');
            return;
        }
        
        updateStatus('Generating...', 'info');
        showLoading();
        
        // Get the element label for the prompt
        const elementOption = [...elementSelect.options].find(option => option.value === elementValue);
        const elementLabel = elementOption ? elementOption.textContent : elementValue;
        
        // Get the style label for the prompt
        const styleOption = [...styleSelect.options].find(option => option.value === styleValue);
        const styleLabel = styleOption ? styleOption.textContent : styleValue;
        
        // Build the prompt
        let fullPrompt = '';
        
        if (currentTheme === 'numbers') {
            // For numbers theme, we want to focus on the number itself
            fullPrompt = `${styleLabel} style number ${elementLabel} with white background`;
        } else {
            // For other themes, we include both the element name and style
            fullPrompt = `${styleLabel} style ${elementLabel} with white background`;
        }
        
        // Generate the image
        generateImage(fullPrompt, elementLabel, sizeValue);
    }
    
    /**
     * Generate an image using the Pollinations API
     * @param {string} fullPrompt - The full prompt to use
     * @param {string} elementName - Name of the element (for the alt text)
     * @param {string} size - Size class for the element
     */
    function generateImage(fullPrompt, elementName, size) {
        try {
            // Show loading indicator
            showLoading();
            
            // Prepare the API URL with parameters
            const encodedPrompt = encodeURIComponent(fullPrompt);
            const width = 512;  // Fixed size for better performance and consistent quality
            const height = 512;
            const seed = Math.floor(Math.random() * 1000000); // Random seed for element generation variety
            
            // Generate the initial image URL
            const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}`;
            
            // Create a new image element
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Enable CORS
            
            // Function to process with background removal
            const processWithBackgroundRemoval = () => {
                fetch(apiUrl)
                    .then(response => response.blob())
                    .then(imageBlob => {
                        // Create FormData with the image
                        const formData = new FormData();
                        formData.append('size', 'auto');
                        formData.append('image_file', imageBlob, 'image.png');
                        
                        // Call the remove.bg API
                        fetch('https://api.remove.bg/v1.0/removebg', {
                            method: 'POST',
                            headers: {
                                'X-Api-Key': 'aKL9mnpPJGeCCqA79ViWrgry' // API key from the original project
                            },
                            body: formData
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Error with remove.bg API: ${response.status}`);
                            }
                            return response.blob();
                        })
                        .then(processedBlob => {
                            // Create a URL for the processed image
                            const processedUrl = URL.createObjectURL(processedBlob);
                            
                            // Update the image source
                            img.src = processedUrl;
                        })
                        .catch(error => {
                            console.error('Background removal error:', error);
                            // Fall back to original image
                            img.src = apiUrl;
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching original image:', error);
                        img.src = apiUrl;
                    });
            };
            
            // Process with background removal
            processWithBackgroundRemoval();
            
            // Handle image loading success
            img.onload = function() {
                // Create a container for the element
                const elementDiv = document.createElement('div');
                elementDiv.className = `element ${size}`;
                
                // Set random position within the scene
                const sceneWidth = scene.clientWidth;
                const sceneHeight = scene.clientHeight;
                
                // Determine size based on selected option
                let elementSize;
                switch (size) {
                    case 'small':
                        elementSize = Math.min(sceneWidth, sceneHeight) * 0.15;
                        break;
                    case 'large':
                        elementSize = Math.min(sceneWidth, sceneHeight) * 0.35;
                        break;
                    default: // medium
                        elementSize = Math.min(sceneWidth, sceneHeight) * 0.25;
                }
                
                // Set random position, ensuring the element stays within bounds
                const maxX = sceneWidth - elementSize;
                const maxY = sceneHeight - elementSize;
                const randomX = Math.random() * maxX;
                const randomY = Math.random() * maxY;
                
                elementDiv.style.width = `${elementSize}px`;
                elementDiv.style.height = `${elementSize}px`;
                elementDiv.style.left = `${randomX}px`;
                elementDiv.style.top = `${randomY}px`;
                
                // Add data attributes for element information
                elementDiv.dataset.name = elementName;
                
                // Preload audio for this element
                preloadElementAudio(elementName);
                
                // Add tooltip with element name
                const tooltip = document.createElement('div');
                tooltip.className = 'element-tooltip';
                tooltip.textContent = elementName;
                elementDiv.appendChild(tooltip);
                
                // Set up tooltip behavior
                elementDiv.addEventListener('mouseenter', function() {
                    tooltip.classList.add('visible');
                });
                
                elementDiv.addEventListener('mouseleave', function() {
                    tooltip.classList.remove('visible');
                });
                
                // Add double-click event for text-to-speech
                elementDiv.addEventListener('dblclick', function() {
                    speakElementName(elementName);
                    
                    // Show tooltip when double-clicked
                    tooltip.classList.add('visible');
                    
                    // Clear any existing timeout
                    if (elementDiv.tooltipTimeout) {
                        clearTimeout(elementDiv.tooltipTimeout);
                    }
                    
                    // Set timeout to hide tooltip after 3 seconds
                    elementDiv.tooltipTimeout = setTimeout(() => {
                        tooltip.classList.remove('visible');
                    }, 3000);
                });
                
                // Append the image to the element
                elementDiv.appendChild(img);
                
                // Make the element draggable
                makeElementDraggable(elementDiv);
                
                // Add the element to the scene
                scene.appendChild(elementDiv);
                
                // Update status and hide loading indicator
                updateStatus('Element added! Double-click to hear its name.', 'success');
                hideLoading();
            };
            
            // Handle image loading error
            img.onerror = function() {
                console.error('Failed to load image from:', apiUrl);
                updateStatus('Failed to generate image. Please try again.', 'error');
                hideLoading();
            };
        } catch (error) {
            console.error('Error generating image:', error);
            updateStatus('Error generating element. Please try again.', 'error');
            hideLoading();
        }
    }
    
    /**
     * Make an element draggable
     * @param {HTMLElement} element - The element to make draggable
     */
    function makeElementDraggable(element) {
        // Skip making the info-popup draggable
        if (element.id === 'info-popup' || element.closest('#info-popup')) {
            return;
        }
        
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let xOffset = 0;
        let yOffset = 0;
        
        element.onmousedown = dragMouseDown;
        element.ontouchstart = dragTouchStart;
        
        function dragMouseDown(e) {
            e.preventDefault();
            // Get the mouse cursor position at startup
            startX = e.clientX;
            startY = e.clientY;
            document.onmouseup = closeDragElement;
            // Call a function whenever the cursor moves
            document.onmousemove = elementDrag;
            // Add dragging class
            element.classList.add('dragging');
        }
        
        function dragTouchStart(e) {
            e.preventDefault();
            // Get the touch position at startup
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            document.ontouchend = closeDragElement;
            // Call a function whenever the touch moves
            document.ontouchmove = elementTouchDrag;
            // Add dragging class
            element.classList.add('dragging');
        }
        
        function elementDrag(e) {
            e.preventDefault();
            // Calculate the new cursor position
            const newX = e.clientX;
            const newY = e.clientY;
            const diffX = newX - startX;
            const diffY = newY - startY;
            startX = newX;
            startY = newY;
            // Set the element's new position
            element.style.top = (element.offsetTop + diffY) + "px";
            element.style.left = (element.offsetLeft + diffX) + "px";
        }
        
        function elementTouchDrag(e) {
            e.preventDefault();
            // Calculate the new touch position
            const newX = e.touches[0].clientX;
            const newY = e.touches[0].clientY;
            const diffX = newX - startX;
            const diffY = newY - startY;
            startX = newX;
            startY = newY;
            // Set the element's new position
            element.style.top = (element.offsetTop + diffY) + "px";
            element.style.left = (element.offsetLeft + diffX) + "px";
        }
        
        function closeDragElement() {
            // Stop moving when mouse/touch is released
            document.onmouseup = null;
            document.onmousemove = null;
            document.ontouchend = null;
            document.ontouchmove = null;
            // Remove dragging class
            element.classList.remove('dragging');
        }
    }
    
    /**
     * Preloads audio for an element to avoid delays on double-click
     * @param {string} text - Element name to preload audio for
     */
    function preloadElementAudio(text) {
        try {
            // Prepare the text with "Say:" prefix
            const speechText = `Say: ${text}`;
            
            // Create audio element for preloading
            const audio = new Audio();
            
            // Add to a global cache
            if (!window.audioCache) {
                window.audioCache = {};
            }
            
            // Set the source to Pollinations API with 'nova' voice
            const encodedText = encodeURIComponent(speechText);
            audio.src = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=nova`;
            
            // Store in cache for later use
            window.audioCache[text] = audio;
            
            // Preload the audio
            audio.load();
            
            console.log(`Preloaded audio for: ${text}`);
        } catch (error) {
            console.error('Error preloading audio:', error);
        }
    }
    
    /**
     * Speak an element name using text-to-speech with Pollinations API
     * @param {string} text - Text to speak
     */
    function speakElementName(text) {
        try {
            // Check if we have this audio preloaded
            if (window.audioCache && window.audioCache[text]) {
                // Use the preloaded audio
                const audio = window.audioCache[text];
                
                // Reset the audio to ensure it plays from the beginning
                audio.currentTime = 0;
                
                // Play the audio
                audio.play().catch(error => {
                    console.error('Error playing preloaded audio:', error);
                    // Fallback to creating new audio if preloaded one fails
                    createAndPlayAudio(text);
                });
            } else {
                // If not preloaded, create and play it directly
                createAndPlayAudio(text);
            }
            
            // Display the text in a temporary overlay
            showTextOverlay(text);
        } catch (error) {
            console.error('Error with speech synthesis:', error);
        }
    }
    
    /**
     * Creates and plays audio for a given text
     * @param {string} text - Text to speak
     */
    function createAndPlayAudio(text) {
        // Prepare the text with "Say:" prefix
        const speechText = `Say: ${text}`;
        
        // Create audio element
        const audio = new Audio();
        
        // Set the source to Pollinations API with 'nova' voice
        const encodedText = encodeURIComponent(speechText);
        audio.src = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=nova`;
        
        // Play the audio
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }
    
    /**
     * Show a temporary text overlay with the element name
     * @param {string} text - Text to display
     */
    function showTextOverlay(text) {
        // Check if an overlay already exists
        let overlay = document.querySelector('.text-overlay');
        
        // If not, create one
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'text-overlay';
            document.body.appendChild(overlay);
        }
        
        // Set the text content
        overlay.textContent = text;
        
        // Show the overlay
        overlay.classList.add('visible');
        
        // Hide after animation completes
        setTimeout(() => {
            overlay.classList.remove('visible');
        }, 2000);
    }
    
    /**
     * Clear all elements from the scene
     */
    function clearAllElements() {
        // Get all elements
        const elements = scene.querySelectorAll('.element');
        
        // Remove each element with a fade-out effect
        elements.forEach(element => {
            element.classList.add('fade-out');
            
            // Remove the element after the animation completes
            setTimeout(() => {
                element.remove();
            }, 300);
        });
        
        updateStatus('All elements cleared', 'info');
    }
    
    /**
     * Show loading indicator
     */
    function showLoading() {
        loadingIndicator.classList.remove('hidden');
    }
    
    /**
     * Hide loading indicator
     */
    function hideLoading() {
        loadingIndicator.classList.add('hidden');
    }
    
    /**
     * Get the current theme from the page
     * @returns {string} Current theme name
     */
    function getCurrentTheme() {
        const themeTitle = document.getElementById('theme-title');
        if (themeTitle) {
            const title = themeTitle.textContent.trim().toLowerCase();
            if (title.includes('underwater')) return 'underwater';
            if (title.includes('animal')) return 'animals';
            if (title.includes('numbers')) return 'numbers';
            if (title.includes('space')) return 'space';
        }
        
        // Try to determine from URL if title not available
        const url = window.location.href;
        if (url.includes('underwater')) return 'underwater';
        if (url.includes('animals')) return 'animals';
        if (url.includes('numbers')) return 'numbers';
        if (url.includes('space')) return 'space';
        
        return 'space'; // Default to space theme
    }
    
    /**
     * Displays the info popup with usage instructions
     */
    function showInfoPopup() {
        const infoDiv = document.getElementById('info-popup');
        
        if (infoDiv) {
            // Update info content with clear instructions
            infoDiv.innerHTML = `
                <div class="info-header">
                    <h2>How to Use</h2>
                    <button id="close-info" class="close-btn">&times;</button>
                </div>
                <div class="info-content">
                    <h3>Space Scene Builder</h3>
                    <ol>
                        <li>Select a space element from the dropdown</li>
                        <li>Choose your preferred art style</li>
                        <li>Select a size for your element</li>
                        <li>Click "Generate" to create your element</li>
                    </ol>
                    
                    <h3>Interacting with Elements</h3>
                    <ul>
                        <li>Click and drag to position elements in your scene</li>
                        <li>Hover over an element to see its name</li>
                        <li>Double-click on an element to hear its name</li>
                        <li>Use "Clear All" to remove all elements and start over</li>
                    </ul>
                </div>
            `;
            
            infoDiv.classList.remove('hidden');
            
            // Close info popup when the close button is clicked
            document.getElementById('close-info').addEventListener('click', function() {
                infoDiv.classList.add('hidden');
            });
        }
    }
});
