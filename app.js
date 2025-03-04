document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const generatedImage = document.getElementById('generated-image');
    const loadingIndicator = document.getElementById('loading-indicator');
    const statusMessage = document.getElementById('status-message');

    // Configuration
    const config = {
        // Set this to true when GitHub Actions integration is ready
        enableBackgroundRemoval: false,
        // Replace with your GitHub token when ready to use
        githubToken: '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',
        // Replace with your GitHub username
        githubUsername: 'rafabez',
        // Repository name
        repoName: 'transparent_bg__image_generation',
        // Style prefix to add to all prompts for consistent image generation
        stylePrompt: 'cartoon style comic book style drawing with white background, '
    };

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
    function generateImage() {
        const userPrompt = promptInput.value.trim();
        
        if (!userPrompt) {
            updateStatus('Please enter a prompt first', 'error');
            return;
        }

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        generatedImage.classList.add('hidden');
        updateStatus('Generating image...', 'info');

        // Add the style prefix to the user's prompt
        const fullPrompt = config.stylePrompt + userPrompt;
        
        // Prepare the API URL with parameters
        const encodedPrompt = encodeURIComponent(fullPrompt);
        const width = 300;
        const height = 300;
        const seed = Math.floor(Math.random() * 1000000); // Random seed
        
        // Log the full prompt being used
        console.log('Using prompt:', fullPrompt);
        
        const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}`;
        
        // Fetch the image
        fetchImage(apiUrl);
    }

    /**
     * Fetches the image from the Pollinations API
     * @param {string} apiUrl - The full URL for the Pollinations API request
     */
    function fetchImage(apiUrl) {
        // Since we're directly using the image URL, we'll set it as the src
        generatedImage.onload = () => {
            // Hide loading indicator and show image when loaded
            loadingIndicator.classList.add('hidden');
            generatedImage.classList.remove('hidden');
            updateStatus('Image generated successfully!', 'success');
            
            // If background removal is enabled, trigger the process
            if (config.enableBackgroundRemoval && config.githubToken) {
                processImageWithGitHubActions(apiUrl);
            } else {
                updateStatus('Image generated! Background removal is not enabled yet.', 'success');
                console.log('To enable background removal, update the config in app.js and set up GitHub Actions.');
            }
        };
        
        generatedImage.onerror = () => {
            loadingIndicator.classList.add('hidden');
            updateStatus('Failed to generate image. Try a different prompt.', 'error');
        };
        
        // Set the image source to the API URL
        generatedImage.src = apiUrl;
    }

    /**
     * Triggers the GitHub Actions workflow to process the image
     * @param {string} imageUrl - The URL of the image to process
     */
    async function processImageWithGitHubActions(imageUrl) {
        updateStatus('Sending image for background removal...', 'info');
        
        try {
            const response = await fetch(
                `https://api.github.com/repos/${config.githubUsername}/${config.repoName}/dispatches`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${config.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        event_type: 'process-image',
                        client_payload: {
                            image_url: imageUrl
                        }
                    })
                }
            );
            
            if (response.status === 204) {
                updateStatus('Image sent for processing! Check back soon for the result.', 'success');
            } else {
                updateStatus('Failed to trigger background removal process.', 'error');
                console.error('GitHub API response:', response.status);
            }
        } catch (error) {
            updateStatus('Error connecting to GitHub API.', 'error');
            console.error('Error:', error);
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
