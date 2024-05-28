const authToken = getAuthToken();

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('id');

    if (hotelId) {
        loadHotelData(hotelId);
    }

    document.getElementById('hotel-form').addEventListener('submit', async function(event) {
        event.preventDefault();
        await saveHotelData(hotelId);
    });
});

async function loadHotelData(hotelId) {
    try {
        const response = await fetch(`/api/hotels/${hotelId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch hotel data');

        const hotel = await response.json();
        document.getElementById('hotel_name').value = hotel.name;
        document.getElementById('hotel_address').value = hotel.address;
        document.getElementById('hotel_description').value = hotel.description;

        const imageResponse = await fetch(`/api/hotels/${hotelId}/image`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            document.getElementById('hotel-preview').src = imageUrl;
            document.getElementById('hotel-preview').style.display = 'block';
        }

        const roomsResponse = await fetch(`/api/hotels/${hotelId}/rooms`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!roomsResponse.ok) throw new Error('Failed to fetch rooms');

        const rooms = await roomsResponse.json();
        rooms.forEach(room => {
            addRoom(hotelId, room);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

async function saveHotelData(hotelId) {
    if (!authToken) {
        alert('Authorization token is missing!');
        return;
    }

    const hotelData = {
        name: document.getElementById('hotel_name').value,
        address: document.getElementById('hotel_address').value,
        description: document.getElementById('hotel_description').value
    };

    const roomBlocks = document.querySelectorAll('.room-block');

    console.log(hotelData)
    try {
        const response = await fetch(`/api/hotels/${hotelId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(hotelData)
        });
        if (!response.ok) throw new Error('Failed to update hotel');

        const hotelImage = document.getElementById('hotel_image').files[0];
        if (hotelImage) {
            const hotelImageData = new FormData();
            hotelImageData.append('file', hotelImage);
            const imageResponse = await fetch(`/api/hotels/${hotelId}/image`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: hotelImageData
            });
            if (!imageResponse.ok) throw new Error('Failed to update hotel image');
        }

        for (let i = 0; i < roomBlocks.length; i++) {
            const roomBlock = roomBlocks[i];
            const roomNumber = roomBlock.querySelector('input[name="room_type[]"]').value;
            const roomImage = roomBlock.querySelector('input[name="room_image[]"]').files[0];

            const roomData = {
                size: roomBlock.querySelector('input[name="room_capacity[]"]').value,
                pricePerDay: roomBlock.querySelector('input[name="room_price[]"]').value
            };

            console.log(roomData);
            console.log(roomNumber);

            const roomResponse = await fetch(`/api/hotels/${hotelId}/rooms/${roomNumber}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(roomData)
            });
            if (!roomResponse.ok) throw new Error('Failed to update room');


            if (roomImage) {
                const roomImageData = new FormData();
                roomImageData.append('file', roomImage);
                const imageResponse = await fetch(`/api/hotels/${hotelId}/rooms/${roomNumber}/image`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: roomImageData
                });
                if (!imageResponse.ok) throw new Error('Failed to update room image');
            }
        }

        alert('Зміни успішно збережено!');
        window.location.href=`hotelOffice.html?id=${hotelId}`;
    } catch (error) {
        console.error('Error:', error);
        alert(`Сталася помилка: ${error.message}`);
    }
}

function previewImage(event, fileInput) {
    const reader = new FileReader();
    reader.onload = function() {
        const imgElement = fileInput.previousElementSibling;
        if (imgElement) {
            imgElement.src = reader.result;
            imgElement.style.display = 'block';
        } else {
            console.error('Image element not found for file input:', fileInput);
        }
    }
    reader.readAsDataURL(event.target.files[0]);
}

function triggerHotelFileInput(imageElement) {
    const fileInput = imageElement.nextElementSibling;
    fileInput.click();
}

function triggerRoomFileInput(imageElement) {
    const fileInput = imageElement.nextElementSibling;
    fileInput.click();
}

function addRoom(hotelId = null, room = { number: '', size: 1, pricePerDay: 0 }) {
    const roomsDiv = document.getElementById('rooms');
    const newRoomBlock = document.createElement('div');
    newRoomBlock.className = 'room-block';

    newRoomBlock.innerHTML = `
        <button type="button" class="remove-room" onclick="removeRoom(this, '${hotelId}', '${room.number}')">✖︎</button>
        <div class="image-container">
            <img class="room-preview" src="" alt="Попередній перегляд зображення" onclick="triggerRoomFileInput(this)"/>
            <input type="file" class="room_image" name="room_image[]" accept="image/*" onchange="previewImage(event, this)" style="display:none;">
        </div>
        <div class="texti">
            <label for="room_type">Номер кімнати:</label>
            <input type="text" id="room_type" name="room_type[]" value="${room.number}" readonly required>
        </div>
        <div class="texti">
            <label for="room_capacity">Кількість осіб:</label>
            <input type="number" id="room_capacity" name="room_capacity[]" min="1" value="${room.size}" required>
        </div>
        <div class="texti">
            <label for="room_price">Ціна за День (UAH):</label>
            <input type="number" id="room_price" name="room_price[]" min="0" value="${room.pricePerDay}" required>
        </div>
    `;

    roomsDiv.appendChild(newRoomBlock);

    if (hotelId && room.number) {
        loadRoomImage(hotelId, room.number, newRoomBlock.querySelector('.room-preview'));
    }
}

function addNewRoom() {
    var roomsDiv = document.getElementById('rooms');
    var newRoomBlock = document.createElement('div');
    newRoomBlock.className = 'room-block';

    newRoomBlock.innerHTML = `
        <button type="button" class="remove-room" onclick="removeNewRoom(this)">✖︎︎</button>
        <div class="image-container">
            <label class="room-image-placeholder" onclick="triggerRoomFileInput(this)">Вибрати файл</label>
            <input type="file" class="room_image" name="room_image[]" accept="image/*" onchange="previewNewImage(event, this.nextElementSibling, this.previousElementSibling)">
            <img class="room-preview" src="" alt="Попередній перегляд зображення"/>
        </div>
        <div class="texti">
            <label for="room_type">Номер кімнати:</label>
            <input type="text" id="room_type" name="room_type[]" required>
        </div>
        <div class="texti">
            <label for="room_capacity">Кількість осіб:</label>
            <input type="number" id="room_capacity" name="room_capacity[]" min="1" required>
        </div>
        <div class="texti">
            <label for="room_price">Ціна за День (UAH):</label>
            <input type="number" id="room_price" name="room_price[]" min="0" required>
        </div>
    `;

    roomsDiv.appendChild(newRoomBlock);
}

function removeNewRoom(button) {
    button.parentElement.remove();
}

async function loadRoomImage(hotelId, roomNumber, imgElement) {
    try {
        const imageResponse = await fetch(`/api/hotels/${hotelId}/rooms/${roomNumber}/image`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            imgElement.src = imageUrl;
            imgElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading room image:', error);
    }
}

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

function previewNewImage(event, imgElement, placeholderElement) {
    var reader = new FileReader();
    reader.onload = function(){
        imgElement.src = reader.result;
        imgElement.style.display = 'block';
        placeholderElement.style.display = 'none';
    }
    reader.readAsDataURL(event.target.files[0]);
}

async function removeRoom(button, hotelId, roomNumber) {
    if (confirm('Ви впевнені, що хочете видалити цю кімнату?')) {
        try {
            const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomNumber}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete room');

            button.parentElement.remove();
        } catch (error) {
            console.error('Error deleting room:', error);
            alert(`Сталася помилка: ${error.message}`);
        }
    }
}