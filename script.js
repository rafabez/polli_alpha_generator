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
            processWithBackgroundRemoval(currentOriginalImageUrl, width, height);
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
        let finalPrompt = prompt + ", with bright green screen background, flat solid chroma key green background with no shadows or gradients, ensure subject has no green elements, subject well-separated from background for easy background removal";
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
        
        img.onload = function() {
            // Display the original image
            originalImage.src = apiUrl;
            originalImage.style.display = 'block';
            
            // Process with background removal
            processWithBackgroundRemoval(apiUrl, width, height);
            
            // Show the Fix BG Alpha button
            fixBgBtn.classList.remove('hidden');
        };
        
        img.onerror = function() {
            loadingIndicator.classList.add('hidden');
            alert('Failed to generate image. Please try again with a different prompt.');
        };
        
        img.src = apiUrl;
    }
    
    // Function to process with background removal
    function processWithBackgroundRemoval(apiUrl, width, height) {
        // Use a client-side solution with a background removal library
        // First, load the original image
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch original image: ${response.status}`);
                }
                return response.blob();
            })
            .then(imageBlob => {
                // Create a URL for the blob
                const blobUrl = URL.createObjectURL(imageBlob);
                
                // Create a new image element to load the image
                const originalImg = new Image();
                originalImg.crossOrigin = "Anonymous";
                originalImg.onload = () => {
                    // Performance optimization: Use smaller canvas dimensions for processing
                    // This significantly speeds up the pixel manipulation
                    const maxProcessingSize = isMobile ? 400 : 600; // Smaller for mobile
                    
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
                    
                    // Get the tolerance value from the slider
                    const tolerance = parseInt(bgToleranceSlider.value);
                    const greenIntensity = parseFloat(greenIntensitySlider.value);
                    
                    // Remove the background with some color tolerance
                    // Chroma key green is typically around RGB(0, 177, 64) to RGB(0, 255, 0)
                    // We'll optimize for detecting greens in this range
                    for (let i = 0; i < pixels.length; i += 4) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];
                        
                        // Less aggressive green dominance check (higher threshold)
                        const isGreenDominant = g > r * greenIntensity && g > b * greenIntensity;
                        
                        // Less aggressive chroma green detection
                        const isChromaGreen = 
                            r < 120 && // Lower threshold for red (fewer pixels will qualify)
                            g > 100 && // Higher threshold for green (fewer pixels will qualify)
                            b < 120 && // Lower threshold for blue (fewer pixels will qualify)
                            isGreenDominant;
                        
                        // Additional check for any greenish pixel (more specific)
                        const isGreenish = g > Math.max(r, b) * 1.4 && g > 80;
                        
                        // Improved performance: Only calculate complex distance if necessary
                        // This avoids unnecessary math operations for obvious green pixels
                        let makeTransparent = isChromaGreen || isGreenish;
                        
                        if (!makeTransparent) {
                            // Only perform this calculation for non-obvious pixels
                            const distance = Math.sqrt(
                                Math.pow(r - bestColor.r, 2) +
                                Math.pow(g - bestColor.g, 2) +
                                Math.pow(b - bestColor.b, 2)
                            );
                            makeTransparent = distance < tolerance;
                        }
                        
                        // Make pixel transparent if it matches any criteria
                        if (makeTransparent) {
                            // Set alpha to 0 for transparent
                            pixels[i + 3] = 0;
                        }
                    }
                    
                    // Put the modified image data back on the canvas
                    ctx.putImageData(imageData, 0, 0);
                    
                    // Create a final canvas at the original requested size
                    const finalCanvas = document.createElement('canvas');
                    finalCanvas.width = width;
                    finalCanvas.height = height;
                    const finalCtx = finalCanvas.getContext('2d');
                    
                    // Draw the processed image at the desired size
                    finalCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 
                                    0, 0, width, height);
                    
                    // Convert canvas to image URL with optimized PNG compression
                    const processedUrl = finalCanvas.toDataURL('image/png', 0.85);
                    
                    // Set the processed image
                    transparentImage.src = processedUrl;
                    transparentImage.style.display = 'block';
                    
                    // Reset the slider position
                    sliderHandle.style.left = '50%';
                    document.querySelector('.original-image-container').style.clipPath = 'inset(0 50% 0 0)';
                    
                    // Enable controls
                    enableControls();
                    
                    // Clean up the blob URL
                    URL.revokeObjectURL(blobUrl);
                };
                
                originalImg.onerror = () => {
                    console.error('Error loading image for processing');
                    transparentImage.src = apiUrl;
                    transparentImage.style.display = 'block';
                    enableControls();
                    URL.revokeObjectURL(blobUrl);
                };
                
                originalImg.src = blobUrl;
            })
            .catch(error => {
                console.error('Background removal error:', error);
                transparentImage.src = apiUrl;
                transparentImage.style.display = 'block';
                enableControls();
            });
    }
    
    // Enable controls after image generation
    function enableControls() {
        loadingIndicator.classList.add('hidden');
        enlargeBtn.disabled = false;
        downloadBtn.disabled = false;
    }
    
    // Download functionality
    downloadBtn.addEventListener('click', () => {
        // Always download the transparent version since background removal is automatic
        const imageToDownload = transparentImage.src;
        const link = document.createElement('a');
        link.href = imageToDownload;
        link.download = `polli-image-${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
