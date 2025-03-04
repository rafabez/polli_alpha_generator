import os
import sys
import requests
from datetime import datetime

def download_image(image_url):
    # Create directories if they don't exist
    os.makedirs('images', exist_ok=True)
    
    # Generate a filename based on timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"images/image_{timestamp}.jpg"
    
    print(f"Downloading image from {image_url}")
    
    try:
        # Download the image
        response = requests.get(image_url, stream=True)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Check content type to confirm it's an image
        content_type = response.headers.get('Content-Type', '')
        if not content_type.startswith('image/'):
            print(f"Warning: Content doesn't appear to be an image. Content-Type: {content_type}")
        
        # Write the binary content to file
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:  # Filter out keep-alive chunks
                    f.write(chunk)
        
        if os.path.exists(filename) and os.path.getsize(filename) > 0:
            print(f"Image downloaded and saved as {filename}")
        else:
            print(f"Error: Downloaded file is empty")
            sys.exit(1)
        
        # Save the filename to a file so other scripts can use it
        with open('current_image.txt', 'w') as f:
            f.write(filename)
        
        return filename
    except requests.exceptions.RequestException as e:
        print(f"Error downloading image: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python download_image.py <image_url>")
        sys.exit(1)
    
    image_url = sys.argv[1]
    download_image(image_url)
