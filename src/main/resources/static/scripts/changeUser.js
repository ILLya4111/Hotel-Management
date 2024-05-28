const token = getAuthToken();
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


document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/auth/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('username').value = data.username || '';
                document.getElementById('firstName').value = data.firstName || '';
                document.getElementById('secondName').value = data.secondName || '';
                document.getElementById('phone').value = data.phoneNumber || '';
                document.getElementById('email').value = data.email || '';
            }
        })
        .catch(error => {
            alert('Error fetching user data: ' + error.message);
        });
});

document.getElementById('submit').addEventListener('click', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const firstName = document.getElementById('firstName').value;
    const secondName = document.getElementById('secondName').value;
    const phoneNumber = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    const userData = {
        email: email,
        firstName: firstName,
        secondName: secondName,
        phoneNumber: phoneNumber
    };

    fetch('/api/auth/user', {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (response.ok) {
                alert('Дані успішно оновлено');
                window.location.href=`userOffice.html`
            } else {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to update data');
                });
            }
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
});

