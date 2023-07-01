
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
function updateSessionToken(){
    sessionToken = getCookieValue('session');
}
clog(sessionToken)