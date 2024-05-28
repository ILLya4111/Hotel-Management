document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('psw').value;

    // Create request body
    const requestBody = {
        usernameOrEmail: email,
        password: password
    };

    // Send POST request to /api/auth/signin
    fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (response.status === 401) {
                throw new Error('Login failed: Unauthorized');
            }
            return response.json();
        })
        .then(data => {
            if (data.token) {
                console.log(data.token)
                // Set JWT token in cookies
                document.cookie = `token=${data.token}`
                console.log(getAuthToken())
                // Handle successful login (e.g., redirect to another page)
                window.location.href = '/index.html';
            } else {
                alert('Login failed: Invalid response from server');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
});

function getAuthToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') {
            return value;
        }
    }
    return null; // Якщо токен не знайдено
}