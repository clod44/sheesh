
function clog(...args) {
    const timestamp = formatDate(Date.now(), true);
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