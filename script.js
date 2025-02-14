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
    const backhalf = document.getElementById('backhalf').value.trim();
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
    if (backhalf) {
        // Validate backhalf format
        if (!/^[a-zA-Z0-9_-]{1,30}$/.test(backhalf)) {
            alert('Backhalf can only contain:\n- Letters A-Z (case insensitive)\n- Numbers 0-9\n- Underscores (_)\n- Hyphens (-)\nMax 30 characters');
            return;
        }
        payload.custom_bitlink = `bit.ly/${backhalf.replace(/^bit\.ly\//, '')}`;
    }

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
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
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
        const errorMsg = error.description || 'Error generating link';
        alert(`Error: ${errorMsg}\n\nPossible reasons:\n- Custom backhalf already exists\n- Invalid characters in backhalf\n- API rate limit reached`);
    });
}

// Check authentication state
window.onload = function() {
    if (localStorage.getItem('authenticated') === 'true') {
        document.getElementById('login').style.display = 'none';
        document.getElementById('main').style.display = 'block';
    }
}
