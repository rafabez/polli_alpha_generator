document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const generatedImage = document.getElementById('generated-image');
    const loadingIndicator = document.getElementById('loading-indicator');
    const statusMessage = document.getElementById('status-message');
    const styleSelect = document.getElementById('style-select');

    // Configuration
    const config = {
        // Remove.bg API key
        removeBgApiKey: '8UV2PRCupAE2T4JKZ4q4bDt7',
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

    // Populate style dropdown
    for (const [key, value] of Object.entries(config.styles)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        styleSelect.appendChild(option);
    }

    // Event listeners
    generateBtn.addEventListener('click', generateImage);
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateImage();
        }
    });

    /**
     * Main function to generate an image based on the prompt
     */
    async function generateImage() {
        const userPrompt = promptInput.value.trim();
        
        if (!userPrompt) {
            updateStatus('Please enter a prompt first', 'error');
            return;
        }

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        generatedImage.classList.add('hidden');
        updateStatus('Creating your space artwork...', 'info');

        try {
            // Get the selected style
            const selectedStyle = styleSelect.value;
            const stylePrompt = config.styles[selectedStyle] || config.styles.cartoon;
            
            // Add the style prefix to the user's prompt
            const fullPrompt = stylePrompt + ' ' + userPrompt;
            
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
                
                // Show the transparent image with floating effect
                generatedImage.onload = () => {
                    loadingIndicator.classList.add('hidden');
                    generatedImage.classList.remove('hidden');
                    updateStatus('Your space artwork is ready!', 'success');
                    
                    // Add download button
                    addDownloadButton(transparentImageUrl);
                };
                
                generatedImage.onerror = () => {
                    loadingIndicator.classList.add('hidden');
                    updateStatus('Failed to display image. Please try again.', 'error');
                };
                
                // Set the transparent image source
                generatedImage.src = transparentImageUrl;
            } catch (bgError) {
                // If background removal fails, show the original image
                console.error('Background removal failed:', bgError);
                updateStatus('Background removal failed. Showing original image.', 'error');
                
                generatedImage.onload = () => {
                    loadingIndicator.classList.add('hidden');
                    generatedImage.classList.remove('hidden');
                    
                    // Add download button for original image
                    addDownloadButton(generatedImageUrl);
                };
                
                generatedImage.src = generatedImageUrl;
            }
            
        } catch (error) {
            console.error('Error in image generation process:', error);
            loadingIndicator.classList.add('hidden');
            updateStatus(`Error: ${error.message}. Please try again.`, 'error');
        }
    }
    
    /**
     * Adds a download button to the page
     * @param {string} imageUrl - The URL of the image to download
     */
    function addDownloadButton(imageUrl) {
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Space Artwork';
        downloadButton.className = 'download-btn';
        downloadButton.addEventListener('click', () => {
            downloadImage(imageUrl);
        });
        
        const statusContainer = document.querySelector('.status-container');
        // Remove previous download button if it exists
        const existingButton = document.querySelector('.download-btn');
        if (existingButton) {
            existingButton.remove();
        }
        statusContainer.appendChild(downloadButton);
    }
    
    /**
     * Downloads the image directly
     * @param {string} imageUrl - The URL of the image to download
     */
    function downloadImage(imageUrl) {
        const a = document.createElement('a');
        a.href = imageUrl;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `space-artwork-${timestamp}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
     * Updates the status message with appropriate styling
     * @param {string} message - The message to display
     * @param {string} type - The type of message (info, success, error)
     */
    function updateStatus(message, type = 'info') {
        statusMessage.textContent = message;
        
        // Reset classes
        statusMessage.className = '';
        
        // Add type class
        statusMessage.classList.add(type);
    }
});
