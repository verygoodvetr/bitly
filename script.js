// Configuration - REPLACE THESE WITH YOUR OWN VALUES
const PASSWORD = "admin123"; // Change this password
const BITLY_API_KEY = "0d6afa5e64d20378e777a1ee4a6540342f7aaf69"; // Get from Bit.ly dashboard
const GROUP_GUID = "BmbmirIcNUz"; // Get from Bit.ly API

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

function generateLink() {
    const longUrl = document.getElementById('url').value;
    const title = document.getElementById('title').value;
    const backhalf = document.getElementById('backhalf').value;
    const generateQR = document.getElementById('qr').checked;

    if (!longUrl) {
        alert('Please enter a URL');
        return;
    }

    const payload = {
        long_url: longUrl,
        domain: "bit.ly",
        group_guid: GROUP_GUID
    };

    if (title) payload.title = title;
    if (backhalf) payload.custom_bitlink = `bit.ly/${backhalf}`;

    fetch('https://api-ssl.bitly.com/v4/shorten', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${BITLY_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        let resultHtml = `<p>Short URL: <a href="${data.link}" target="_blank">${data.link}</a></p>`;
        
        if (generateQR) {
            resultHtml += `
                <div class="mt-3">
                    <p>QR Code:</p>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.link}" 
                         alt="QR Code" 
                         class="img-fluid">
                </div>
            `;
        }
        
        document.getElementById('result').innerHTML = resultHtml;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error generating link');
    });
}

// Check authentication state
window.onload = function() {
    if (localStorage.getItem('authenticated') === 'true') {
        document.getElementById('login').style.display = 'none';
        document.getElementById('main').style.display = 'block';
    }
}
