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
    
    # Download the image
    response = requests.get(image_url, stream=True)
    response.raise_for_status()
    
    with open(filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print(f"Image downloaded and saved as {filename}")
    
    # Save the filename to a file so other scripts can use it
    with open('current_image.txt', 'w') as f:
        f.write(filename)
    
    return filename

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python download_image.py <image_url>")
        sys.exit(1)
    
    image_url = sys.argv[1]
    download_image(image_url)
