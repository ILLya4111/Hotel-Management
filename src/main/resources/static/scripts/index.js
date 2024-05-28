async function getHotels(searchQuery = '') {
    try {
        const url = `/api/hotels`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch hotels: ${res.statusText}`);
        const hotels = await res.json();

        // Логування отриманих даних
        console.log('Hotels:', hotels);

        // Перевірка, чи є відповідь масивом
        if (!Array.isArray(hotels)) throw new Error('Hotels data is not an array');

        // Фільтруємо готелі за введеним словом у назві або адресі
        const filteredHotels = hotels.filter(hotel =>
            hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.address.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filteredHotels;
    } catch (error) {
        console.error('Error fetching hotels:', error);
        return [];
    }
}

async function getHotelImage(hotelId) {
    try {
        const res = await fetch(`/api/hotels/${hotelId}/image`);
        if (res.ok) {
            const imageBlob = await res.blob();
            return URL.createObjectURL(imageBlob);
        }
    } catch (error) {
        console.error('Error fetching hotel image:', error);
    }
    return 'default-hotel-image.jpg'; // Fallback image URL
}

async function displayHotels(searchQuery = '') {
    const hotels = await getHotels(searchQuery);

    const hotelsList = document.getElementById('hotelsList');
    hotelsList.innerHTML = '';

    for (const hotel of hotels) {
        const imageUrl = await getHotelImage(hotel.id);
        hotelToHTML(hotel, imageUrl);
    }
}

function hotelToHTML(hotel, imageUrl) {
    const hotelsList = document.getElementById('hotelsList');

    hotelsList.insertAdjacentHTML('beforeend', `
                <a class="hotel-container" id="img${hotel.id}" href="hotel.html?id=${hotel.id}">
                    <img src="${imageUrl}" alt="Error" class="imgHotel"> <hr>
                    <p class="nameHotel">${hotel.name}</p>
                    <p class="addresHotel"><i class="fa-solid fa-location-dot"></i> ${hotel.address}</p>
                </a>
            `);
}

document.querySelector('.example').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const searchText = formData.get('search');

    await displayHotels(searchText);
});

window.addEventListener('DOMContentLoaded', async function () {
    await displayHotels();
});
////.....................................

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


