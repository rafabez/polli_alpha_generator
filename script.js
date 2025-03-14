document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const originalImage = document.getElementById('original-image');
    const transparentImage = document.getElementById('transparent-image');
    const sliderHandle = document.getElementById('slider-handle');
    const enlargeBtn = document.getElementById('enlarge-btn');
    const downloadBtn = document.getElementById('download-btn');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.querySelector('.close-modal');
    const loadingIndicator = document.getElementById('loading-indicator');
    const loadingText = document.querySelector('#loading-indicator p');
    const thumbnailGallery = document.getElementById('thumbnail-gallery');

    // Settings elements
    const modelSelect = document.getElementById('model-select');
    const aspectRatioSelect = document.getElementById('aspect-ratio-select');
    const resolutionSelect = document.getElementById('resolution-select');
    const enhancePromptCheckbox = document.getElementById('enhance-prompt');
    const whiteBgCheckbox = document.getElementById('white-bg');
    const seedInput = document.getElementById('seed');
    const privateCheckbox = document.getElementById('private-image');
    const noLogoCheckbox = document.getElementById('no-logo');

    // Variables
    let isDragging = false;
    let currentOriginalImageUrl = null;
    let lastGeneratedPrompt = null;
    let lastEnhancedPrompt = null;
    const isMobile = window.innerWidth <= 768;
    let imageHistory = []; // Store history of generated images
    const maxHistoryItems = 20; // Maximum number of history items to keep
    let preloadedImages = {}; // Object to store preloaded images

    // Resolution presets (pixels)
    const resolutionPresets = {
        high: 1024,
        medium: 768,
        low: 512
    };

    // Function to calculate dimensions based on aspect ratio and resolution
    function calculateDimensions(aspectRatio, resolution) {
        const baseSize = resolutionPresets[resolution];
        const [width, height] = aspectRatio.split(':').map(Number);
        
        // Calculate dimensions while maintaining aspect ratio
        // and ensuring the longer side is at the resolution preset value
        if (width >= height) {
            // Landscape or square
            return {
                width: baseSize,
                height: Math.round(baseSize * (height / width))
            };
        } else {
            // Portrait
            return {
                width: Math.round(baseSize * (width / height)),
                height: baseSize
            };
        }
    }

    // Check if images are already loaded
    if (!originalImage.complete || !transparentImage.complete) {
        enlargeBtn.disabled = true;
        downloadBtn.disabled = true;
    }

    // Modal functionality
    enlargeBtn.addEventListener('click', () => {
        if (transparentImage.complete && transparentImage.naturalWidth !== 0) {
            // Use canvas to create a fresh copy of the image for the modal
            // This avoids blob URL issues
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = transparentImage.naturalWidth;
            canvas.height = transparentImage.naturalHeight;
            
            // Draw the transparent image to the canvas
            ctx.drawImage(transparentImage, 0, 0);
            
            // Convert to a new data URL
            try {
                const dataURL = canvas.toDataURL('image/png');
                modalImage.src = dataURL;
                modal.style.display = 'flex';
            } catch (error) {
                console.error('Failed to create image for modal:', error);
                alert('Sorry, there was an error displaying the enlarged image.');
            }
        } else {
            console.error('Image not fully loaded');
            alert('Please wait for the image to fully load before expanding.');
        }
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
            
            const filename = `polli-original_${cleanPrompt}.png`;

            // Create a temporary canvas to convert the image to a downloadable format
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const tempImg = new Image();
            tempImg.crossOrigin = "Anonymous";
            
            tempImg.onload = function() {
                canvas.width = tempImg.width;
                canvas.height = tempImg.height;
                ctx.drawImage(tempImg, 0, 0);
                
                // Convert to data URL and trigger download
                try {
                    const dataURL = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = dataURL;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (e) {
                    console.error('Error creating download:', e);
                    // Fallback to open in new tab if download fails
                    window.open(currentOriginalImageUrl, '_blank');
                }
            };
            
            tempImg.onerror = function() {
                console.error('Failed to load image for download');
                // Fallback to direct opening
                window.open(currentOriginalImageUrl, '_blank');
            };
            
            tempImg.src = currentOriginalImageUrl;

            // Hide the menu after download
            document.querySelector('.download-menu').classList.remove('active');
        }
    });

    // Download alpha (transparent) image
    document.getElementById('download-alpha-btn').addEventListener('click', () => {
        if (transparentImage.src && transparentImage.complete) {
            // Create a sanitized filename from the prompt
            // Use the enhanced prompt when available (for better filenames)
            const promptToUse = lastEnhancedPrompt || lastGeneratedPrompt;
            const cleanPrompt = promptToUse
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .trim()
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .substring(0, 50); // Limit length

            const filename = `polli-alpha_${cleanPrompt}.png`;

            // Create a canvas to ensure we're downloading a fresh copy of the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = transparentImage.naturalWidth;
            canvas.height = transparentImage.naturalHeight;
            ctx.drawImage(transparentImage, 0, 0);
            
            // Convert to data URL and trigger download
            try {
                canvas.toBlob((blob) => {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Clean up the blob URL after download starts
                    setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                    }, 100);
                }, 'image/png');
            } catch (e) {
                console.error('Error downloading alpha image:', e);
                alert('Failed to download the transparent image. Please try again.');
            }

            // Hide the menu after download
            document.querySelector('.download-menu').classList.remove('active');
        } else {
            alert('Transparent image is not ready yet. Please wait for it to finish loading.');
        }
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

    // Generate image functionality
    generateBtn.addEventListener('click', generateImage);

    // Allow pressing Enter or Ctrl+Enter in the prompt textarea
    promptInput.addEventListener('keydown', (e) => {
        // Check for Enter (without Shift key for multiline support) or Ctrl+Enter
        if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Enter' && e.ctrlKey)) {
            e.preventDefault();
            generateImage();
        }
    });

    // Preload images to improve thumbnail loading performance
    function preloadImage(url, id) {
        return new Promise((resolve, reject) => {
            // Check if already preloaded
            if (preloadedImages[id] && preloadedImages[id].original) {
                resolve(preloadedImages[id]);
                return;
            }

            // Create image object
            const img = new Image();
            img.crossOrigin = "Anonymous";

            img.onload = () => {
                // If not already in the preloaded images, add it
                if (!preloadedImages[id]) {
                    preloadedImages[id] = {};
                }
                
                preloadedImages[id].original = url;
                
                // Process for transparency in background
                processWithBackgroundRemoval(url, new Image())
                    .then((transparentUrl) => {
                        preloadedImages[id].transparent = transparentUrl;
                        resolve(preloadedImages[id]);
                    })
                    .catch((err) => {
                        console.error('Failed to preload transparent version', err);
                        resolve(preloadedImages[id]); // Resolve anyway with what we have
                    });
            };

            img.onerror = () => {
                console.error('Failed to preload image:', url);
                reject(new Error(`Failed to preload image: ${url}`));
            };

            img.src = url;
        });
    }

    // Function to add an image to history
    function addToImageHistory(originalUrl, thumbnailDataUrl, prompt) {
        // Create a new history item
        const historyItem = {
            id: Date.now(), // Unique ID using timestamp
            originalUrl: originalUrl,
            thumbnailUrl: thumbnailDataUrl,
            prompt: prompt,
            createdAt: new Date().toISOString()
        };
        
        // Add to the beginning of the array
        imageHistory.unshift(historyItem);
        
        // Limit the number of items in history
        if (imageHistory.length > maxHistoryItems) {
            const removedItems = imageHistory.splice(maxHistoryItems);
            // Clean up preloaded images for removed items
            removedItems.forEach(item => {
                delete preloadedImages[item.id];
            });
        }
        
        // Update the gallery UI
        updateThumbnailGallery();
        
        // Preload this image for future quick access
        preloadImage(originalUrl, historyItem.id).catch(err => console.error('Preload error:', err));
    }

    // Function to update the thumbnail gallery UI
    function updateThumbnailGallery() {
        // Clear the current gallery
        thumbnailGallery.innerHTML = '';
        
        // Add each thumbnail to the gallery
        imageHistory.forEach((item, index) => {
            const thumbnailItem = document.createElement('div');
            thumbnailItem.className = 'thumbnail-item';
            thumbnailItem.dataset.id = item.id;
            
            if (index === 0) {
                thumbnailItem.classList.add('active');
            }
            
            // Create thumbnail image
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = item.thumbnailUrl;
            thumbnailImg.alt = item.prompt.substring(0, 20) + '...';
            thumbnailImg.title = item.prompt;
            
            // Add click handler
            thumbnailItem.addEventListener('click', () => {
                loadImageFromHistory(item);
            });
            
            // Add to DOM
            thumbnailItem.appendChild(thumbnailImg);
            thumbnailGallery.appendChild(thumbnailItem);
            
            // Start preloading in background for better performance
            preloadImage(item.originalUrl, item.id).catch(err => console.error('Preload error:', err));
        });
    }

    // Function to load an image from history
    function loadImageFromHistory(historyItem) {
        // Update active state
        const thumbnails = document.querySelectorAll('.thumbnail-item');
        thumbnails.forEach(thumb => {
            thumb.classList.remove('active');
            if (thumb.dataset.id === historyItem.id.toString()) {
                thumb.classList.add('active');
            }
        });
        
        // Show loading with custom message for history items
        loadingIndicator.classList.remove('hidden');
        loadingText.textContent = 'Loading image from history...';
        
        // Set current original image URL
        currentOriginalImageUrl = historyItem.originalUrl;
        lastGeneratedPrompt = historyItem.prompt;
        
        // Check if we already have the preloaded image
        if (preloadedImages[historyItem.id]) {
            // Display the original image
            originalImage.src = historyItem.originalUrl;
            originalImage.style.display = 'block';
            
            if (preloadedImages[historyItem.id].transparent) {
                // If we have preloaded transparent image, use it directly
                transparentImage.src = preloadedImages[historyItem.id].transparent;
                transparentImage.style.display = 'block';
                loadingIndicator.classList.add('hidden');
                enlargeBtn.disabled = false;
                downloadBtn.disabled = false;
                return;
            }
        }
        
        // Load the original image
        originalImage.src = historyItem.originalUrl;
        originalImage.style.display = 'block';
        
        // Process with background removal for the transparent version
        processWithBackgroundRemoval(historyItem.originalUrl, transparentImage)
            .then((transparentUrl) => {
                if (!preloadedImages[historyItem.id]) {
                    preloadedImages[historyItem.id] = {};
                }
                preloadedImages[historyItem.id].transparent = transparentUrl;
                
                loadingIndicator.classList.add('hidden');
                enlargeBtn.disabled = false;
                downloadBtn.disabled = false;
                transparentImage.style.display = 'block';
            })
            .catch(err => {
                console.error('Background removal failed:', err);
                loadingIndicator.classList.add('hidden');
                loadingText.textContent = 'Generating your image...'; // Reset text
                alert('Failed to process the image. Please try again.');
            });
    }

    function generateImage() {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a prompt to generate an image.');
            return;
        }

        // Save the last generated prompt
        lastGeneratedPrompt = prompt;

        // Show loading indicator with default text
        loadingIndicator.classList.remove('hidden');
        loadingText.textContent = 'Generating your image...';
        originalImage.style.display = 'none';
        transparentImage.style.display = 'none';
        enlargeBtn.disabled = true;
        downloadBtn.disabled = true;

        // Get settings
        const model = modelSelect.value;
        const aspectRatio = aspectRatioSelect.value;
        const resolution = resolutionSelect.value;
        const enhance = enhancePromptCheckbox.checked;
        const privateImg = privateCheckbox.checked;
        const noLogo = noLogoCheckbox.checked;

        // Calculate dimensions based on aspect ratio and resolution
        const { width, height } = calculateDimensions(aspectRatio, resolution);

        // Generate a random seed if not explicitly set
        const manualSeed = seedInput.value.trim();
        const seed = manualSeed || Math.floor(Math.random() * 1000000000).toString();

        // Create the URL with parameters
        // Always add the background removal prompt since we're automating it
        const whiteBgString = ", with white flat solid background with no shadows or gradients.";
        let finalPrompt = prompt + (whiteBgCheckbox.checked ? whiteBgString : "");

        // Store the enhanced prompt for filenames
        lastEnhancedPrompt = finalPrompt;

        let baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}`;

        // Add parameters
        const params = [];
        if (model) params.push(`model=${model}`);
        params.push(`seed=${seed}`); // Always include a seed (random or manual)
        params.push(`width=${width}`); // Use calculated width
        params.push(`height=${height}`); // Use calculated height
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

            // Create a thumbnail from the original image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const thumbnailSize = 150;
            
            // Calculate thumbnail dimensions (maintaining aspect ratio)
            let thumbWidth, thumbHeight;
            if (img.width >= img.height) {
                thumbWidth = thumbnailSize;
                thumbHeight = (img.height / img.width) * thumbnailSize;
            } else {
                thumbHeight = thumbnailSize;
                thumbWidth = (img.width / img.height) * thumbnailSize;
            }
            
            canvas.width = thumbWidth;
            canvas.height = thumbHeight;
            ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
            
            // Convert to data URL for thumbnail
            const thumbnailDataUrl = canvas.toDataURL('image/png');
            
            // Generate a unique ID for this image
            const imageId = Date.now();
            
            // Add to history
            addToImageHistory(apiUrl, thumbnailDataUrl, prompt);

            // Process with background removal and update the transparent image
            processWithBackgroundRemoval(apiUrl, transparentImage)
                .then((transparentUrl) => {
                    // Store the transparent image URL in preloaded images
                    if (!preloadedImages[imageId]) {
                        preloadedImages[imageId] = { original: apiUrl };
                    }
                    preloadedImages[imageId].transparent = transparentUrl;
                    
                    // Enable UI elements
                    loadingIndicator.classList.add('hidden');
                    enlargeBtn.disabled = false;
                    downloadBtn.disabled = false;
                    transparentImage.style.display = 'block';
                })
                .catch(err => {
                    console.error('Background removal failed:', err);
                    loadingIndicator.classList.add('hidden');
                });
        };

        img.onerror = () => {
            loadingIndicator.classList.add('hidden');
            loadingText.textContent = 'Generating your image...'; // Reset text
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
 * @returns {Promise<string>} - Resolves with the transparent image URL when processing is complete
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
                    resolve(processedUrl); // Return the URL for caching
                };
                
                img.onerror = function() {
                    console.error('❌ Error loading background-removed image from u2NET');
                    URL.revokeObjectURL(processedUrl);
                    
                    // Try client-side fallback
                    fallbackToClientSide(blobUrl, img, options)
                        .then(resolve)
                        .catch(reject);
                };
                
                img.src = processedUrl;
            } else {
                console.warn('⚠️ u2NET API returned an error, falling back to client-side method');
                fallbackToClientSide(blobUrl, img, options)
                    .then(resolve)
                    .catch(reject);
            }
        } catch (error) {
            console.warn('⚠️ Error with u2NET API, falling back to client-side method:', error);
            fallbackToClientSide(blobUrl, img, options)
                .then(resolve)
                .catch(reject);
        }
    } catch (error) {
        console.error('❌ Error fetching original image:', error);
        reject(error);
    }
});
}

/**
 * Client-side background removal fallback
 * @param {string} blobUrl - Blob URL of the image to process
 * @param {HTMLImageElement} img - The image element to update
 * @param {Object} options - Processing options
 * @returns {Promise<string>} - Resolves with the transparent image URL when processing is complete
 */
async function fallbackToClientSide(blobUrl, img, options) {
    return new Promise((resolve, reject) => {
        console.log('🔄 Falling back to client-side background removal...');
        
        const tempImg = new Image();
        tempImg.crossOrigin = "Anonymous";
        
        tempImg.onload = function() {
            try {
                console.log('📊 Processing image for background removal...');
                
                // Create a canvas to process the image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = tempImg.width;
                canvas.height = tempImg.height;
                
                // Draw the image to the canvas
                ctx.drawImage(tempImg, 0, 0);
                
                // Get the image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Get color tolerance from slider or use default
                const colorTolerance = 35; // Default tolerance
                const greenIntensity = 1.0; // Default intensity
                
                // Process the image data to make white/light green backgrounds transparent
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Check if the pixel is predominantly white/light
                    const isWhite = r > 230 && g > 230 && b > 230;
                    
                    // Enhanced green screen detection
                    // Check if green is the dominant channel with tolerance
                    const isGreen = g > r + colorTolerance * greenIntensity && 
                                   g > b + colorTolerance * greenIntensity;
                    
                    // If white or green background pixel, make it transparent
                    if (isWhite || isGreen) {
                        // Set alpha channel to transparent
                        data[i + 3] = 0;
                    }
                }
                
                // Put the modified image data back to the canvas
                ctx.putImageData(imageData, 0, 0);
                
                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    const processedUrl = URL.createObjectURL(blob);
                    
                    // Set the processed image to the target img element
                    img.onload = function() {
                        console.log('✅ Client-side background removal completed successfully!');
                        resolve(processedUrl); // Return the URL for caching
                    };
                    
                    img.onerror = function() {
                        console.error('❌ Error loading processed image');
                        URL.revokeObjectURL(processedUrl);
                        URL.revokeObjectURL(blobUrl);
                        reject(new Error('Failed to load processed image'));
                    };
                    
                    img.src = processedUrl;
                }, 'image/png');
                
            } catch (error) {
                console.error('❌ Error in client-side background removal:', error);
                URL.revokeObjectURL(blobUrl);
                reject(error);
            }
        };
        
        tempImg.onerror = function() {
            console.error('❌ Error loading image for client-side background removal');
            URL.revokeObjectURL(blobUrl);
            reject(new Error('Failed to load image for processing'));
        };
        
        tempImg.src = blobUrl;
    });
}
