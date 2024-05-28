const token = getAuthToken();

document.addEventListener('DOMContentLoaded', function() {
    if (!token) {
        window.location.href = '/login.html'; // Якщо токена немає, редирект на сторінку входу
        return;
    }

    fetch('/api/auth/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return response.json();
        })
        .then(data => {
            let number;
            if (data.phoneNumber == null) {
                number = "Відредагуйте аккаунт";
            } else {
                number = data.phoneNumber;
            }
            document.getElementById('username').textContent = data.username;
            document.getElementById('firstName').textContent = data.firstName;
            document.getElementById('secondName').textContent = data.secondName;
            document.getElementById('phoneNumber').textContent = number;
            document.getElementById('email').textContent = data.email;

            const roles = data.roles.map(role => role.name);
            if (roles.includes('ROLE_HOTEL_ADMIN')) {
                document.querySelector('.myHotel').style.display = 'block';
                fetchUserHotels();
                fetchUserBookings();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load user data');
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

function exitTheData() {
    document.cookie = 'token=; Max-Age=0'; // Видалення токена з cookie
    window.location.href = '/index.html';
}

function fetchUserHotels() {
    console.log('Fetching hotels data'); // Додаємо логування

    fetch(`/api/admin/hotels`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            console.log('Response status:', response.status); // Логування статусу відповіді
            if (response.status === 404) {
                displayCreateHotelOption();
                return null; // Немає готелю, повертаємо null
            }
            if (!response.ok) {
                throw new Error('Failed to fetch hotels data');
            }
            return response.json();
        })
        .then(hotels => {
            console.log('Hotels data:', hotels); // Логування даних готелів
            if (hotels && hotels.length > 0) {
                hotels.forEach(hotel => {
                    fetchHotelImage(hotel);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displayCreateHotelOption() {
    const hotelSection = document.getElementById('hotelSection');
    hotelSection.style.display = `block`
    hotelSection.innerHTML = `
                <a href="registerHotel.html" class="nameHotel">
                    <p class="btnCreateHotel">Створити готель</p>
                </a>
            `;
}

function fetchHotelImage(hotel) {
    fetch(`/api/hotels/${hotel.id}/image`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch hotel image');
            }
            return response.blob();
        })
        .then(imageBlob => {
            const imageUrl = URL.createObjectURL(imageBlob);
            displayHotel(hotel, imageUrl);
        })
        .catch(error => {
            console.error('Error:', error);
            displayHotel(hotel, 'default-image.png'); // Якщо не вдалося завантажити зображення, використовуємо зображення за замовчуванням
        });
}

function displayHotel(hotel, imageUrl) {
    const hotelSection = document.getElementById('hotelSection');
    const cont = document.getElementById('cont');
    cont.style.display = 'block';
    const hotelDiv = document.createElement('div');
    hotelDiv.innerHTML = `
                <a href="/hotelOffice.html?id=${hotel.id}" class="nameHotel">
                    <img src="${imageUrl}" alt="Фото готеля" class="hotel-view"><hr>
                    <h1>${hotel.name}</h1>
                </a><hr>
            `;
    hotelSection.appendChild(hotelDiv);
}

function fetchUserBookings() {
    console.log('Fetching bookings data'); // Додаємо логування

    fetch(`/api/bookings`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            console.log('Response status:', response.status); // Логування статусу відповіді
            if (!response.ok) {
                throw new Error('Failed to fetch bookings data');
            }
            return response.json();
        })
        .then(bookings => {
            console.log('Bookings data:', bookings); // Логування даних бронювань
            if (bookings && bookings.length > 0) {
                displayBookings(bookings);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displayBookings(bookings) {
    const bookingSelection = document.getElementById('bookingSelection');
    bookings.forEach(booking => {
        const totalPrice = calculateTotalPrice(new Date(booking.settlementDate), new Date(booking.evictionDate), booking.room.pricePerDay);
        const bookingBlock = document.createElement('div');
        bookingBlock.classList.add('booking-block');
        bookingBlock.id = `book${booking.id}`;
        bookingBlock.innerHTML = `
                    <p class="infoBooking">Номер кімнати: ${booking.room.number};</p>
                    <p class="infoBooking">Ціна бронювання: ${totalPrice} грн;</p>
                    <p class="infoBooking">${booking.settlementDate} - ${booking.evictionDate}.</p>
                    <button onclick="deleteBooking(${booking.id})">Видалити</button>
                `;
        bookingSelection.appendChild(bookingBlock);
    });
}

function calculateTotalPrice(settlementDate, evictionDate, pricePerDay) {
    const days = Math.ceil((evictionDate - settlementDate) / (1000 * 60 * 60 * 24)) + 1;
    return days * pricePerDay;
}

async function changeTheData() {
    window.location.href = `/changeUser.html`;
}

async function deleteBooking(bookingId) {
    const token = getAuthToken();
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete booking: ${response.statusText}`);
        }

        // Видаляємо елемент з DOM
        const bookingElement = document.getElementById(`booking-${bookingId}`);
        if (bookingElement) {
            bookingElement.remove();
        }

        alert('Бронювання успішно видалено!');
    } catch (error) {
        console.error('Error deleting booking:', error.message);
    }
}