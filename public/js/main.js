// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get server status
    fetchServerStatus();
});

// Function to fetch server status from API
async function fetchServerStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = `Server is running. Last checked: ${new Date(data.timestamp).toLocaleString()}`;
        statusElement.style.color = 'green';
    } catch (error) {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = 'Unable to connect to server';
        statusElement.style.color = 'red';
        console.error('Error fetching server status:', error);
    }
}