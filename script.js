// Configuration - REPLACE THESE WITH YOUR OWN VALUES
const PASSWORD = "admin123"; // Change this password
const BITLY_API_KEY = "0d6afa5e64d20378e777a1ee4a6540342f7aaf69"; // Get from Bit.ly dashboard
const GROUP_GUID = "BmbmirIcNUz"; // Get from Bit.ly API

// Authentication
function checkPassword() {
    const enteredPassword = document.getElementById('password').value;
    if (enteredPassword === PASSWORD) {
        localStorage.setItem('authenticated', 'true');
        document.getElementById('login').style.display = 'none';
        document.getElementById('main').style.display = 'block';
    } else {
        alert('Incorrect password!');
    }
}

// Main link generation function
function generateLink() {
    const longUrl = document.getElementById('url').value.trim();
    const title = document.getElementById('title').value.trim();
    const backhalf = document.getElementById('backhalf').value.trim();
    const generateQR = document.getElementById('qr').checked;

    // Validation
    if (!longUrl) {
        alert('Please enter a URL');
        return;
    }

    // Prepare API payload
    const payload = {
        long_url: longUrl,
        domain: "bit.ly",
        group_guid: GROUP_GUID
    };

    // Add optional fields
    if (title) payload.title = title;
    if (backhalf) {
        // Backhalf validation
        if (!/^[a-zA-Z0-9_-]{5,30}$/.test(backhalf)) {
            alert('Custom backhalf must be:\n5-30 characters\nOnly letters, numbers, hyphens (-), and underscores (_)');
            return;
        }
        payload.custom_bitlink = `bit.ly/${backhalf.replace(/^bit\.ly\//, '')}`;
    }

    // API call
    fetch('https://api-ssl.bitly.com/v4/shorten', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${BITLY_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.description || err.message || 'API request failed');
            });
        }
        return response.json();
    })
    .then(data => {
        let resultHtml = `
            <div class="alert alert-success">
                <strong>Success!</strong>
                <p>Short URL: <a href="${data.link}" target="_blank">${data.link}</a></p>
        `;

        if (generateQR) {
            resultHtml += `
                <div class="mt-3">
                    <p class="mb-2">QR Code:</p>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.link)}" 
                         alt="QR Code" 
                         class="img-thumbnail">
                </div>
            `;
        }

        resultHtml += `</div>`;
        document.getElementById('result').innerHTML = resultHtml;
    })
    .catch(error => {
        console.error('Error:', error);
        let errorMessage = error.message;
        
        // Handle common errors
        if (errorMessage.includes('CUSTOM_BITLINK_ALREADY_EXISTS')) {
            errorMessage = 'This custom backhalf is already in use';
        } else if (errorMessage.includes('INVALID_CUSTOM_BITLINK')) {
            errorMessage = 'Invalid custom backhalf format';
        }

        document.getElementById('result').innerHTML = `
            <div class="alert alert-danger">
                <strong>Error:</strong> ${errorMessage}
            </div>
        `;
    });
}

// Check authentication state on page load
window.onload = function() {
    if (localStorage.getItem('authenticated') === 'true') {
        document.getElementById('login').style.display = 'none';
        document.getElementById('main').style.display = 'block';
    }
}
