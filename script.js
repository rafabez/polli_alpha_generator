document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const fixBgBtn = document.getElementById('fix-bg-btn');
    const originalImage = document.getElementById('original-image');
    const transparentImage = document.getElementById('transparent-image');
    const sliderHandle = document.getElementById('slider-handle');
    const enlargeBtn = document.getElementById('enlarge-btn');
    const downloadBtn = document.getElementById('download-btn');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.querySelector('.close-modal');
    const loadingIndicator = document.getElementById('loading-indicator');

    // Settings elements
    const modelSelect = document.getElementById('model-select');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const enhancePromptCheckbox = document.getElementById('enhance-prompt');
    const seedInput = document.getElementById('seed');
    const bgToleranceSlider = document.getElementById('bg-tolerance');
    const toleranceValue = document.getElementById('tolerance-value');
    const greenIntensitySlider = document.getElementById('green-intensity');
    const intensityValue = document.getElementById('intensity-value');
    const privateCheckbox = document.getElementById('private-image');
    const noLogoCheckbox = document.getElementById('no-logo');

    // Variables
    let isDragging = false;
    let currentOriginalImageUrl = null;
    let lastGeneratedPrompt = null;
    let lastEnhancedPrompt = null;
    const isMobile = window.innerWidth <= 768;

    // Check if images are already loaded
    if (!originalImage.complete || !transparentImage.complete) {
        enlargeBtn.disabled = true;
        downloadBtn.disabled = true;
    }

    // Update tolerance value display
    bgToleranceSlider.addEventListener('input', () => {
        toleranceValue.textContent = bgToleranceSlider.value;
    });

    // Update green intensity value display
    greenIntensitySlider.addEventListener('input', () => {
        intensityValue.textContent = greenIntensitySlider.value;
    });

    // Slider functionality
    sliderHandle.addEventListener('mousedown', startDrag);
    sliderHandle.addEventListener('touchstart', startDrag);

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function startDrag(e) {
        isDragging = true;
        e.preventDefault(); // Prevent text selection
    }

    function drag(e) {
        if (!isDragging) return;

        const container = sliderHandle.parentElement;
        const containerRect = container.getBoundingClientRect();

        let clientX = e.clientX;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
        }

        // Calculate position as percentage of container width
        const position = Math.min(Math.max(0, clientX - containerRect.left), containerRect.width);
        const percent = (position / containerRect.width) * 100;

        // Update slider position
        sliderHandle.style.left = `${percent}%`;

        // Update clip path for original image
        document.querySelector('.original-image-container').style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    }

    function endDrag() {
        isDragging = false;
    }

    // Modal functionality
    enlargeBtn.addEventListener('click', () => {
        // Use the transparent image for the modal since background removal is automatic
        modalImage.src = transparentImage.src;
        modal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }

        // Hide download menu when clicking outside
        if (!e.target.closest('.download-container')) {
            document.querySelector('.download-menu').classList.remove('active');
        }
    });

    // Download menu functionality
    downloadBtn.addEventListener('click', () => {
        const downloadMenu = document.querySelector('.download-menu');
        downloadMenu.classList.toggle('active');
    });

    // Download original image
    document.getElementById('download-original-btn').addEventListener('click', () => {
        if (currentOriginalImageUrl) {
            // Create a sanitized filename from the prompt
            // Use the enhanced prompt when available (for better filenames)
            const promptToUse = lastEnhancedPrompt || lastGeneratedPrompt;
            const cleanPrompt = promptToUse
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .trim()
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .substring(0, 50); // Limit length

            // Open in a new tab instead of downloading directly
            // This prevents navigating away from the app
            window.open(currentOriginalImageUrl, '_blank');

            // Hide the menu after opening the tab
            document.querySelector('.download-menu').classList.remove('active');
        }
    });

    // Download alpha (transparent) image
    document.getElementById('download-alpha-btn').addEventListener('click', () => {
        if (transparentImage.src) {
            // Create a sanitized filename from the prompt
            // Use the enhanced prompt when available (for better filenames)
            const promptToUse = lastEnhancedPrompt || lastGeneratedPrompt;
            const cleanPrompt = promptToUse
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .trim()
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .substring(0, 50); // Limit length

            const filename = `polli-alpha_${cleanPrompt}.png`;

            const link = document.createElement('a');
            link.href = transparentImage.src;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Hide the menu after download
            document.querySelector('.download-menu').classList.remove('active');
        }
    });

    // Generate image functionality
    generateBtn.addEventListener('click', generateImage);

    // Fix background functionality
    fixBgBtn.addEventListener('click', () => {
        if (currentOriginalImageUrl) {
            // Show loading
            loadingIndicator.classList.remove('hidden');

            // Process with updated background removal settings
            const width = widthInput.value;
            const height = heightInput.value;
            processWithBackgroundRemoval(currentOriginalImageUrl, transparentImage, { width, height }).then(() => {
                // Show the Fix BG Alpha button and enable UI elements
                fixBgBtn.classList.remove('hidden');
                loadingIndicator.classList.add('hidden');
                enlargeBtn.disabled = false;
                downloadBtn.disabled = false;
                transparentImage.style.display = 'block';
            }).catch(err => {
                console.error('Background removal failed:', err);
                loadingIndicator.classList.add('hidden');
            });
        } else {
            alert('Please generate an image first before fixing the background.');
        }
    });

    // Allow pressing Ctrl+Enter in the prompt textarea
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            generateImage();
        }
    });

    function generateImage() {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a prompt to generate an image.');
            return;
        }

        // Save the last generated prompt
        lastGeneratedPrompt = prompt;

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        originalImage.style.display = 'none';
        transparentImage.style.display = 'none';
        enlargeBtn.disabled = true;
        downloadBtn.disabled = true;
        fixBgBtn.classList.add('hidden');

        // Get settings
        const width = widthInput.value;
        const height = heightInput.value;
        const model = modelSelect.value;
        const enhance = enhancePromptCheckbox.checked;
        const privateImg = privateCheckbox.checked;
        const noLogo = noLogoCheckbox.checked;

        // Generate a random seed if not explicitly set
        const manualSeed = seedInput.value.trim();
        const seed = manualSeed || Math.floor(Math.random() * 1000000000).toString();

        // Create the URL with parameters
        // Always add the background removal prompt since we're automating it
        let finalPrompt = prompt + ", with white flat solid background with no shadows or gradients.";

        // Store the enhanced prompt for filenames
        lastEnhancedPrompt = finalPrompt;

        let baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}`;

        // Add parameters
        const params = [];
        if (model) params.push(`model=${model}`);
        params.push(`seed=${seed}`); // Always include a seed (random or manual)
        params.push(`width=${width}`);
        params.push(`height=${height}`);
        if (enhance) params.push('enhance=true');
        if (privateImg) params.push('private=true');
        if (noLogo) params.push('nologo=true');

        const apiUrl = params.length > 0 ? `${baseUrl}?${params.join('&')}` : baseUrl;
        currentOriginalImageUrl = apiUrl;

        // Create a new image to load
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            // Display the original image
            originalImage.src = apiUrl;
            originalImage.style.display = 'block';

            // Process with background removal and update the transparent image
            processWithBackgroundRemoval(apiUrl, transparentImage, { width, height }).then(() => {
                // Show the Fix BG Alpha button and enable UI elements
                fixBgBtn.classList.remove('hidden');
                loadingIndicator.classList.add('hidden');
                enlargeBtn.disabled = false;
                downloadBtn.disabled = false;
                transparentImage.style.display = 'block';
            }).catch(err => {
                console.error('Background removal failed:', err);
                loadingIndicator.classList.add('hidden');
            });
        };

        img.onerror = () => {
            loadingIndicator.classList.add('hidden');
            alert('Failed to generate image. Please try again with a different prompt.');
        };

        img.src = apiUrl;
    }
});

/**
 * Process an image with background removal
 * @param {string} originalImageUrl - URL of the original image
 * @param {HTMLImageElement} img - The image element to set the processed result on
 * @param {Object} options - Options including width, height, etc.
 * @returns {Promise<void>} - Resolves when processing is complete
 */
async function processWithBackgroundRemoval(originalImageUrl, img, options = {}) {
    return new Promise(async (resolve, reject) => {
        console.log('Starting background removal process...');

    // First, load the original image
    try {
        const response = await fetch(originalImageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch original image: ${response.status}`);
        }

        const imageBlob = await response.blob();
        const blobUrl = URL.createObjectURL(imageBlob);

        // First try u2NET via PHP proxy
        try {
            console.log('🔍 Attempting background removal with u2NET API via PHP proxy...');

            // Create form data for PHP proxy
            const formData = new FormData();
            formData.append('image', imageBlob, 'image.png');

            // Send to the PHP proxy
            const proxyResponse = await fetch('./proxy.php', {
                method: 'POST',
                body: formData
            });

            if (proxyResponse.ok) {
                console.log('✅ u2NET background removal successful!');
                const processedBlob = await proxyResponse.blob();
                const processedUrl = URL.createObjectURL(processedBlob);

                // Set the processed image to the target img element
                img.onload = function() {
                    console.log('✅ Background-removed image loaded successfully with u2NET!');
                    URL.revokeObjectURL(processedUrl);
                    URL.revokeObjectURL(blobUrl);
                    resolve();
                };

                img.onerror = function() {
                    console.error('Failed to load processed image');
                    URL.revokeObjectURL(processedUrl);
                    URL.revokeObjectURL(blobUrl);
                    reject(new Error('Failed to load processed image'));
                };

                // Set the processed image
                img.src = processedUrl;
                return; // Exit early if successful
            } else {
                console.warn('⚠️ PHP proxy returned error:', await proxyResponse.text());
            }
        } catch (proxyError) {
            console.error('🛑 Error using PHP proxy:', proxyError);
        }

        // Fall back to client-side processing if PHP proxy fails
        console.log('🎨 Falling back to client-side background removal');
        await fallbackToClientSide(blobUrl, img, options);
        resolve();
    } catch (error) {
        console.error('Background removal error:', error);
        // Fall back to original image without background removal
        img.src = originalImageUrl;
        img.onload = () => resolve();
        img.onerror = () => reject(error);
    }
});
}

/**
 * Client-side background removal fallback
 * @param {string} blobUrl - Blob URL of the image to process
 * @param {HTMLImageElement} img - The image element to update
 * @param {Object} options - Processing options
 * @returns {Promise<void>} - Resolves when processing is complete
 */
async function fallbackToClientSide(blobUrl, img, options) {
    console.log('Starting client-side background removal...');
    const { width, height } = options;

    return new Promise((resolve, reject) => {
        // Create a new image element to load the image
        const originalImg = new Image();
        originalImg.crossOrigin = "Anonymous";
        
        originalImg.onload = () => {
            // Performance optimization: Use smaller canvas dimensions for processing
            const maxProcessingSize = window.innerWidth < 768 ? 400 : 600; // Smaller for mobile

            // Calculate aspect ratio
            const aspectRatio = originalImg.width / originalImg.height;

            // Create a processing canvas with optimized dimensions
            const canvas = document.createElement('canvas');
            let pWidth, pHeight;

            if (originalImg.width > originalImg.height) {
                pWidth = Math.min(maxProcessingSize, originalImg.width);
                pHeight = Math.round(pWidth / aspectRatio);
            } else {
                pHeight = Math.min(maxProcessingSize, originalImg.height);
                pWidth = Math.round(pHeight * aspectRatio);
            }

            canvas.width = pWidth;
            canvas.height = pHeight;
            const ctx = canvas.getContext('2d');

            // Draw the image to the canvas (downscaled for processing)
            ctx.drawImage(originalImg, 0, 0, pWidth, pHeight);

            // Get the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            // Find the predominant color in the corners (likely background)
            const cornerColors = [];

            // Check corners (reduced area for efficiency)
            const cornerSize = Math.min(8, Math.floor(Math.min(pWidth, pHeight) / 20));

            // Function to get average color in a region
            const getAverageColor = (startX, startY, regionWidth, regionHeight) => {
                let r = 0, g = 0, b = 0, count = 0;

                for (let y = startY; y < startY + regionHeight && y < canvas.height; y++) {
                    for (let x = startX; x < startX + regionWidth && x < canvas.width; x++) {
                        const i = (y * canvas.width + x) * 4;
                        r += pixels[i];
                        g += pixels[i + 1];
                        b += pixels[i + 2];
                        count++;
                    }
                }

                if (count === 0) return { r: 0, g: 0, b: 0 };

                return {
                    r: Math.round(r / count),
                    g: Math.round(g / count),
                    b: Math.round(b / count)
                };
            };

            // Get colors from all 4 corners
            cornerColors.push(getAverageColor(0, 0, cornerSize, cornerSize)); // Top-left
            cornerColors.push(getAverageColor(pWidth - cornerSize, 0, cornerSize, cornerSize)); // Top-right
            cornerColors.push(getAverageColor(0, pHeight - cornerSize, cornerSize, cornerSize)); // Bottom-left
            cornerColors.push(getAverageColor(pWidth - cornerSize, pHeight - cornerSize, cornerSize, cornerSize)); // Bottom-right

            // Get the predominant color
            const colorSimilarity = (c1, c2) => {
                const dr = c1.r - c2.r;
                const dg = c1.g - c2.g;
                const db = c1.b - c2.b;
                return Math.sqrt(dr * dr + dg * dg + db * db);
            };

            // Find the color that is most similar to other colors
            let bestColor = cornerColors[0];
            let lowestTotalDistance = Number.MAX_VALUE;

            for (const color of cornerColors) {
                let totalDistance = 0;
                for (const otherColor of cornerColors) {
                    totalDistance += colorSimilarity(color, otherColor);
                }

                if (totalDistance < lowestTotalDistance) {
                    lowestTotalDistance = totalDistance;
                    bestColor = color;
                }
            }

            // Remove the background with some color tolerance
            const tolerance = 60; // Decreased from 100 to make background removal less aggressive

            // Process each pixel
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                // For white backgrounds
                const isWhitish = (r > 240 && g > 240 && b > 240);

                // Distance from background color
                const distance = Math.sqrt(
                    Math.pow(r - bestColor.r, 2) +
                    Math.pow(g - bestColor.g, 2) +
                    Math.pow(b - bestColor.b, 2)
                );

                // Make pixel transparent if it matches criteria
                if (isWhitish || distance < tolerance) {
                    // Set alpha to 0 for transparent
                    pixels[i + 3] = 0;
                }
            }

            // Put the modified image data back on the canvas
            ctx.putImageData(imageData, 0, 0);

            // Create a final canvas at the original requested size
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = width || originalImg.width;
            finalCanvas.height = height || originalImg.height;
            const finalCtx = finalCanvas.getContext('2d');

            // Draw the processed image at the desired size
            finalCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 
                            0, 0, finalCanvas.width, finalCanvas.height);

            // Convert canvas to image URL with optimized PNG compression
            const processedUrl = finalCanvas.toDataURL('image/png', 0.85);

            console.log('✅ Client-side background removal complete');

            // Set up a callback for when the image loads
            img.onload = function() {
                URL.revokeObjectURL(blobUrl);
                resolve();
            };

            img.onerror = function() {
                console.error('Error displaying processed image');
                URL.revokeObjectURL(blobUrl);
                reject(new Error('Error displaying processed image'));
            };

            // Set the processed image
            img.src = processedUrl;
        };

        originalImg.onerror = (err) => {
            console.error('Error loading image for processing');
            img.src = blobUrl;
            URL.revokeObjectURL(blobUrl);
            reject(err);
        };
        
        // Start loading the image
        originalImg.src = blobUrl;
    });
}
