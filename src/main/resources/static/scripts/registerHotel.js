const authToken = getAuthToken();

document.getElementById('hotel-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Collect room data
    const roomBlocks = document.querySelectorAll('.room-block');

    // Prepare the hotel data structure
    const hotelData = {
        name: document.getElementById('hotel_name').value,
        address: document.getElementById('hotel_address').value,
        description: document.getElementById('hotel_description').value,
        rooms: []
    };

    try {
        // Send hotel data
        let response = await fetch('/api/hotels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(hotelData)
        });

        if (!response.ok) {
            throw new Error(`Failed to create hotel: ${response.statusText}`);
        }

        const hotel = await response.json();
        const hotelId = hotel.id;

        // Upload hotel image
        const hotelImage = document.getElementById('hotel_image').files[0];
        const hotelImageData = new FormData();
        hotelImageData.append('file', hotelImage);

        response = await fetch(`/api/hotels/${hotelId}/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: hotelImageData
        });

        if (!response.ok) {
            throw new Error(`Failed to upload hotel image: ${response.statusText}`);
        }

        for (let i = 0; i < roomBlocks.length; i++) {
            const roomBlock = roomBlocks[i];
            const roomData = {
                number: roomBlock.querySelector('input[name="room_type[]"]').value,
                size: roomBlock.querySelector('input[name="room_capacity[]"]').value,
                pricePerDay: roomBlock.querySelector('input[name="room_price[]"]').value
            };

            response = await fetch(`/api/hotels/${hotelId}/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(roomData)
            });

            if (!response.ok) {
                throw new Error(`Failed to create room: ${response.statusText}`);
            }

            const room = await response.json();
            const roomNumber = room.number;

            const roomImage = roomBlock.querySelector('input[name="room_image[]"]').files[0];
            if (roomImage) {
                const roomImageData = new FormData();
                roomImageData.append('file', roomImage);

                response = await fetch(`/api/hotels/${hotelId}/rooms/${roomNumber}/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: roomImageData
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload room image: ${response.statusText}`);
                }
            }
        }

        alert('Готель успішно зареєстровано!');
        window.location.href = `/hotelOffice.html?id=${hotelId}`;
    } catch (error) {
        console.error(error);
        alert(`Сталася помилка: ${error.message}`);
    }
});

function previewImage(event, imgElement, placeholderElement) {
    var reader = new FileReader();
    reader.onload = function(){
        imgElement.src = reader.result;
        imgElement.style.display = 'block';
        placeholderElement.style.display = 'none';
    }
    reader.readAsDataURL(event.target.files[0]);
}

function triggerHotelFileInput(labelElement) {
    labelElement.nextElementSibling.click();
}

function triggerRoomFileInput(labelElement) {
    labelElement.nextElementSibling.click();
}



function addRoom() {
    var roomsDiv = document.getElementById('rooms');
    var newRoomBlock = document.createElement('div');
    newRoomBlock.className = 'room-block';

    newRoomBlock.innerHTML = `
        <button type="button" class="remove-room" onclick="removeRoom(this)">✖︎︎</button>
        <div class="image-container">
            <label class="room-image-placeholder" onclick="triggerRoomFileInput(this)">Вибрати файл</label>
            <input type="file" class="room_image" name="room_image[]" accept="image/*" onchange="previewImage(event, this.nextElementSibling, this.previousElementSibling)">
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

function removeRoom(button) {
    var roomBlock = button.parentElement;
    roomBlock.remove();
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