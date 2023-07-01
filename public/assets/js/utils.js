
function clog(...args) {
    const timestamp = formatDate(Date.now(), false);
    console.log(`[${timestamp}]`, ...args);
}

function formatDate(timestamp, includeDate = false) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    if (includeDate) {
        return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
    } else {
        return `${hours}:${minutes}:${seconds}`;
    }
}


// Function to get the value of a specific cookie
function getCookieValue(cookieName) {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();

        // Check if the cookie starts with the provided name
        if (cookie.startsWith(cookieName + '=')) {
            // Extract and return the cookie value
            return cookie.substring(cookieName.length + 1);
        }
    }

    // Cookie not found
    return null;
}

// Get the session token from the cookie
let sessionToken = getCookieValue('session');
function updateSessionToken() {
    sessionToken = getCookieValue('session');
}
clog("sessionToken: ", sessionToken == null ? " no token " : sessionToken)



function compressAndResizeImage(imageDataUrl, maxWidth, maxHeight, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Resize the canvas to the desired dimensions
            canvas.width = maxWidth;
            canvas.height = maxHeight;

            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0, maxWidth, maxHeight);

            // Get the compressed data URL
            const compressedImage = canvas.toDataURL('image/jpeg', quality);

            // Resolve the promise with the compressed image data URL
            resolve(compressedImage);
        };

        // Set the source of the image to the provided data URL
        img.src = imageDataUrl;
    });
}






// Convert data URL to Blob
function dataURLtoBlob(dataURL) {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}




async function updateOnlineCount(target) {
    try {
        const response = await fetch("/api/onlineCount");
        const data = await response.json();
        target.textContent = `Global (${data.onlineCount})`
    } catch (error) {
        clog("Error:", error)
    }
}



