document.getElementById('submit').addEventListener('click', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const firstName = document.getElementById('firstName').value;
    const secondName = document.getElementById('secondName').value;
    // const phoneNumber = document.getElementById('phoneNumber').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('repeatPassword').value;
    const isHotelAdmin = document.getElementById('isHotelAdmin').checked;

    if (password !== repeatPassword) {
        alert('Passwords do not match');
        return;
    }
    const roles = [
        { name : "ROLE_USER" }
    ]
    if (isHotelAdmin) {
        roles.push({name : "ROLE_HOTEL_ADMIN"})
    }

    const user = {
        username: username,
        email: email,
        password: password,
        firstName: firstName,
        secondName: secondName,
        // phoneNumber: phoneNumber,
        roles: roles
    };

    fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (response.ok) {
                return fetch('/api/auth/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ usernameOrEmail: email, password: password })
                });
            } else {
                return response.json().then(data => {
                    throw new Error(data.message || 'Registration failed');
                });
            }
        })
        .then(response => {
            if (response.status === 401) {
                throw new Error('Login failed: Unauthorized');
            }
            return response.json();
        })
        .then(data => {
            if (data.token) {
                document.cookie = `token=${data.token}`;
                // Перенаправлення на іншу сторінку після успішного входу
                window.location.href = '/index.html';
            } else {
                alert('Login failed: Invalid response from server');
            }
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
});
