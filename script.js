// Configuration
const PASSWORD = "admin123";
const CLIENT_ID = "92f725f4b731f4221a1034580ac9e76f41f0add7"; // From OAuth app
const CLIENT_SECRET = "d49c3e4aab37658ebd8a66a105f4de7759691173"; // From OAuth app
const GROUP_GUID = "BmbmirIcNUz";

let ACCESS_TOKEN = "";

// Authentication
async function checkPassword() {
    const enteredPassword = document.getElementById('password').value;
    if (enteredPassword !== PASSWORD) {
        alert('Incorrect password!');
        return;
    }

    try {
        // Get OAuth access token
        const response = await fetch('https://api-ssl.bitly.com/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error_description || 'Authentication failed');
        
        ACCESS_TOKEN = data.access_token;
        localStorage.setItem('authenticated', 'true');
        document.getElementById('login').style.display = 'none';
        document.getElementById('main').style.display = 'block';
        
    } catch (error) {
        console.error('Auth Error:', error);
        alert(`Authentication failed: ${error.message}`);
    }
}

async function generateLink() {
    const longUrl = document.getElementById('url').value.trim();
    const title = document.getElementById('title').value.trim();
    const backhalf = document.getElementById('backhalf').value.trim();
    const generateQR = document.getElementById('qr').checked;

    // Clear previous results
    document.getElementById('result').innerHTML = '';
    
    // Validation
    if (!longUrl.startsWith('http')) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
    }

    if (backhalf && !/^[a-z0-9_-]{5,30}$/.test(backhalf)) {
        alert('Custom backhalf must be:\n5-30 characters\nLetters, numbers, -, _');
        return;
    }

    try {
        // Create payload
        const payload = {
            long_url: longUrl,
            domain: "bit.ly",
            group_guid: GROUP_GUID,
            title: title || undefined
        };

        if (backhalf) {
            const cleanedBackhalf = backhalf.replace(/^bit\.ly\//, '').toLowerCase(); // Convert to lowercase
            payload.custom_bitlink = `bit.ly/${cleanedBackhalf}`;
        }

        // API call
        const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.description || errorData.message);
        }

        const data = await response.json();
        
        // Display results
        let resultHtml = `
            <div class="alert alert-success mt-4">
                <h4>Link Created!</h4>
                <p><strong>Title:</strong> ${data.title || 'No title'}</p>
                <p><strong>Short URL:</strong> <a href="${data.link}" target="_blank">${data.link}</a></p>
        `;

        if (generateQR) {
            resultHtml += `
                <div class="mt-3">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.link)}" 
                         alt="QR Code" 
                         class="img-thumbnail">
                    <p class="text-muted mt-2">Scan the QR code to visit the link</p>
                </div>
            `;
        }

        resultHtml += `</div>`;
        document.getElementById('result').innerHTML = resultHtml;

    } catch (error) {
        console.error('Generation Error:', error);
        let message = error.message;
        
        if (message.includes('CUSTOM_BITLINK_ALREADY_EXISTS')) {
            message = 'This custom name is already taken. Please try another one.';
        } else if (message.includes('INVALID_ARG_LONG_URL')) {
            message = 'Invalid URL format. Please include http:// or https://';
        }
        
        document.getElementById('result').innerHTML = `
            <div class="alert alert-danger mt-4">
                <h4>Error</h4>
                <p>${message}</p>
                ${error.details ? `<p>Details: ${error.details}</p>` : ''}
            </div>
        `;
    }
}

// Check authentication on load
window.onload = async () => {
    if (localStorage.getItem('authenticated') === 'true') {
        document.getElementById('login').style.display = 'none';
        document.getElementById('main').style.display = 'block';
    }
};
