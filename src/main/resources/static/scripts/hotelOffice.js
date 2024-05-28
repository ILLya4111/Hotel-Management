const token = getAuthToken();
async function getHotelInfo(hotelId) {
    const response = await fetch(`/api/hotels/${hotelId}`);
    return await response.json();
}

async function getHotelRooms(hotelId, searchQuery = '') {
    const response = await fetch(`/api/hotels/${hotelId}/rooms`);
    const rooms = await response.json();

    // Фільтруємо кімнати за введеними параметрами
    const filteredRooms = rooms.filter(room =>
        room.number.toString().includes(searchQuery) ||
        room.size.toString().includes(searchQuery) ||
        room.pricePerDay.toString().includes(searchQuery)
    );

    return filteredRooms;
}


async function getHotelImage(hotelId) {
    const response = await fetch(`/api/hotels/${hotelId}/image`);
    if (!response.ok) {
        throw new Error(`Failed to fetch hotel image: ${response.statusText}`);
    }
    return response.url;
}

async function getRoomImage(hotelId, roomNumber) {
    const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomNumber}/image`);
    if (!response.ok) {
        throw new Error(`Failed to fetch room image: ${response.statusText}`);
    }
    return response.url;
}

async function displayHotelInfo(hotelId) {
    const hotelInfo = await getHotelInfo(hotelId);
    const hotelNameElement = document.querySelector('h1');
    const hotelAddressElement = document.querySelector('p:nth-of-type(1)');
    const hotelDescriptionElement = document.querySelector('p:nth-of-type(2)');
    const hotelImageElement = document.getElementById('hotelImage');

    hotelNameElement.textContent = hotelInfo.name;
    hotelAddressElement.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${hotelInfo.address}`;
    hotelDescriptionElement.textContent = hotelInfo.description;

    try {
        hotelImageElement.src = await getHotelImage(hotelId);
    } catch (error) {
        console.error(error.message);
    }
}

async function displayRooms(hotelId, searchQuery = '') {
    const rooms = await getHotelRooms(hotelId, searchQuery);
    const roomsList = document.getElementById('roomsList');

    roomsList.innerHTML = ''; // Очищаємо попередні номери

    for (let room of rooms) {
        const roomElement = await roomToHTML(hotelId, room);
        roomsList.insertAdjacentHTML('beforeend', roomElement);
    }
}


async function displayHotelPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('id');

    await displayHotelInfo(hotelId);
    await displayRooms(hotelId);
}

window.addEventListener('DOMContentLoaded', async function () {
    await displayHotelPage();
});

async function roomToHTML(hotelId, room) {
    let roomImageUrl = '';
    try {
        roomImageUrl = await getRoomImage(hotelId, room.number);
    } catch (error) {
        console.error(error.message);
    }

    return `
        <div class="room-block" id="${room.number}">
            <div class="image-container">
                <img class="room-preview" src="${roomImageUrl}" alt="Попередній перегляд зображення"/>
            </div>
            <div class="texti">
                <h2 class="t">Номер кімнати:</h2>
                <p class="t">${room.number}</p>
            </div>
            <div class="texti">
                <h2 class="t">Кількість осіб:</h2>
                <p class="t">${room.size}</p>
            </div>
            <div class="texti">
                <h2 class="t">Ціна за День (UAH):</h2>
                <p class="t">${room.pricePerDay}</p>
            </div>
            <div>
                <a href="#" class="ad" onclick="showBookingInfo(${hotelId}, ${room.number})">Переглянути<br> Інформацію</a>
            </div>
        </div>
    `;
}




async function redirectToHotelPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('id');
    window.location.href = `/changeHotel.html?id=${hotelId}`;
}


// Оголосіть функцію searchRooms
async function searchRooms() {
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('id');
    const searchQuery = document.querySelector('.example input[name="search"]').value;
    await displayRooms(hotelId, searchQuery);
}

async function deleteHotel(hotelId) {
    try {
        const response = await fetch(`/api/hotels/${hotelId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to delete hotel: ${response.statusText}`);
        }
        // Якщо готель успішно видалено, перенаправте користувача на головну сторінку або іншу відповідну сторінку
        alert('Готель успішно видалено!');
        window.location.href = '/userOffice.html'; // Змініть URL на потрібний
    } catch (error) {
        console.error(error.message);
    }
}

function deleteHotelFromButton() {
    const hotelId = getHotelIdFromURL();
    if (hotelId) {
        deleteHotel(hotelId);
    } else {
        console.error('Hotel ID is undefined');
    }
}


function getHotelIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}


async function showBookingInfo(hotelId, roomNumber) {
    try {
        const response = await fetch(`/api/bookings/${hotelId}/${roomNumber}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch booking information: ${response.statusText}`);
        }
        const bookings = await response.json();

        const container = document.querySelector('.container1');
        container.innerHTML = '<p>Список людей які забронювали номер</p>';

        bookings.forEach(booking => {
            const bookingInfo = `
                <div class="infoUsers" id="booking-${booking.id}">
                    <p>Username: ${booking.user.username}</p>
                    <p>Phone: ${booking.user.phoneNumber ? booking.user.phoneNumber : 'N/A'}</p>
                    <p>Дата заселення: ${new Date(booking.settlementDate).toLocaleDateString()}</p>
                    <p>Дата виселення: ${new Date(booking.evictionDate).toLocaleDateString()}</p>
                    <button onclick="deleteBooking(${booking.id})">Видалити</button>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', bookingInfo);
        });

    } catch (error) {
        console.error('Error fetching booking information:', error.message);
    }
}
async function deleteBooking(bookingId) {

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




//....................................................

document.addEventListener('DOMContentLoaded', function() {


    if (token) {
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
            .then(user => {
                const userProfileLink = document.getElementById('user-profile');
                userProfileLink.textContent = user.username;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
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
