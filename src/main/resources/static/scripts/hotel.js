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
        const hotelImageUrl = await getHotelImage(hotelId);
        hotelImageElement.src = hotelImageUrl;
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
                <a id="img${room.id}" href="registerRoom.html?id=${hotelId}&number=${room.number}" class="ad">Забронювати</a>
            </div>
        </div>
    `;
}

// Оголосіть функцію searchRooms
async function searchRooms() {
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('id');
    const searchQuery = document.querySelector('.example input[name="search"]').value;
    await displayRooms(hotelId, searchQuery);
}

//...................................................

document.addEventListener('DOMContentLoaded', function() {
    const token = getAuthToken();

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
                userProfileLink.style.display = 'inline';
                const btnHeaders = document.getElementById('btnHeader');
                btnHeaders.style.display = 'none';
                const btnHeaders1 = document.getElementById('btnHeader1');
                btnHeaders1.style.display = 'none';
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
