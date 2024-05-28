const token = getAuthToken();
let pricePerDay = 0; // Змінна для збереження ціни за день

document.addEventListener('DOMContentLoaded', function() {
    const calendar1 = document.getElementById('calendar-1');
    const calendar2 = document.getElementById('calendar-2');
    const monthYear1 = document.getElementById('month-year-1');
    const monthYear2 = document.getElementById('month-year-2');
    const bookingInfo = document.getElementById('booking-info');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const bookButton = document.getElementById('book-button');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let isSelecting = false;
    let startDate = null;
    let endDate = null;

    const weekdays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    async function renderCalendar(month, year, calendar, monthYearElement, bookings) {
        calendar.innerHTML = '';

        const weekdays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        weekdays.forEach(day => {
            const weekdayElement = document.createElement('div');
            weekdayElement.classList.add('weekday');
            weekdayElement.textContent = day;
            calendar.appendChild(weekdayElement);
        });

        const firstDay = new Date(year, month).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day');
            calendar.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.classList.add('day');
            day.textContent = i;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const date = new Date(dateStr);
            day.dataset.date = dateStr;

            if (date < today || isDateBooked(date, bookings)) {
                day.classList.add('disabled');
            } else {
                day.addEventListener('click', function() {
                    if (!isSelecting) {
                        isSelecting = true;
                        startDate = this.dataset.date;
                        endDate = null;
                        clearSelection();
                        this.classList.add('selected');
                        prevMonthButton.disabled = true;
                        nextMonthButton.disabled = true;
                    } else {
                        const selectedDate = new Date(this.dataset.date);
                        if (selectedDate > new Date(startDate)) {
                            endDate = this.dataset.date;
                            isSelecting = false;
                            selectRange(new Date(startDate), new Date(endDate));
                            showBookingInfo(new Date(startDate), new Date(endDate));
                            prevMonthButton.disabled = false;
                            nextMonthButton.disabled = false;
                        } else {
                            clearSelection();
                            isSelecting = false;
                            startDate = null;
                            endDate = null;
                            prevMonthButton.disabled = false;
                            nextMonthButton.disabled = false;
                        }
                    }
                });

                day.addEventListener('mouseover', function() {
                    if (isSelecting && startDate) {
                        const selectedDate = new Date(this.dataset.date);
                        if (selectedDate > new Date(startDate)) {
                            endDate = this.dataset.date;
                            clearSelection();
                            selectRange(new Date(startDate), new Date(endDate));
                        }
                    }
                });
            }

            calendar.appendChild(day);
        }

        monthYearElement.textContent = `${new Intl.DateTimeFormat('uk-UA', { month: 'long' }).format(new Date(year, month))} ${year}`;
    }

    function isDateBooked(date, bookings) {
        return bookings.some(booking => {
            const settlementDate = new Date(booking.settlementDate);
            const evictionDate = new Date(booking.evictionDate);
            return date >= settlementDate && date <= evictionDate;
        });
    }


    function clearSelection() {
    const days = document.querySelectorAll('.day');
    days.forEach(day => day.classList.remove('selected'));
}

    function selectRange(start, end) {
        const days = document.querySelectorAll('.day');
        days.forEach(day => {
            const date = new Date(day.dataset.date);
            if (date >= start && date <= end) {
                day.classList.add('selected');
            }
        });
    }

    function showBookingInfo(start, end) {
        if (start && end) {
            const totalPrice = calculateTotalPrice(start, end);
            bookingInfo.textContent = `Ви вибрали бронювання з ${start.toLocaleDateString('uk-UA')} до ${end.toLocaleDateString('uk-UA')}. Загальна ціна: ${totalPrice} грн.`;
            bookButton.style.display = 'block';
        }
    }

    function calculateTotalPrice(start, end) {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return days * pricePerDay;
    }

    async function bookRoom(hotelId, roomNumber, start, end) {
        const response = await fetch(`/api/bookings/${hotelId}/${roomNumber}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                settlementDate: start.toISOString().split('T')[0],
                evictionDate: end.toISOString().split('T')[0]
            })
        });

        if (response.ok) {
            alert('Бронювання успішно створено!');
            window.location.href=`userOffice.html`
        } else {
            alert('Сталася помилка при бронюванні.');
        }
    }

    prevMonthButton.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentYear--;
            currentMonth = 11;
        }
        renderCalendars(currentMonth, currentYear);
    });

    nextMonthButton.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentYear++;
            currentMonth = 0;
        }
        renderCalendars(currentMonth, currentYear);
    });

    bookButton.addEventListener('click', function() {
        const { hotelId, roomNumber } = getQueryParams();
        bookRoom(hotelId, roomNumber, new Date(startDate), new Date(endDate));
    });

    async function renderCalendars(month, year) {
        const { hotelId, roomNumber } = getQueryParams();
        const bookings = await fetchBookings(hotelId, roomNumber);

        renderCalendar(month, year, calendar1, monthYear1, bookings);
        if (month === 11) {
            renderCalendar(0, year + 1, calendar2, monthYear2, bookings);
        } else {
            renderCalendar(month + 1, year, calendar2, monthYear2, bookings);
        }
    }


    renderCalendars(currentMonth, currentYear);
});

// Функція для отримання параметрів з URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        hotelId: params.get('id'),
        roomNumber: params.get('number')
    };
}

// Функція для отримання інформації про кімнату
async function fetchRoomInfo(hotelId, roomNumber) {
    try {
        const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomNumber}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching room info:', error);
    }
}

// Функція для отримання зображення кімнати
async function fetchRoomImage(hotelId, roomNumber) {
    try {
        const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomNumber}/image`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.blob();
    } catch (error) {
        console.error('Error fetching room image:', error);
    }
}

// Функція для оновлення інформації на сторінці
async function updateRoomInfo() {
    const { hotelId, roomNumber } = getQueryParams();

    const roomInfo = await fetchRoomInfo(hotelId, roomNumber);
    if (roomInfo) {
        document.getElementById('roomNumber').textContent = roomInfo.number;
        document.getElementById('capacity').textContent = roomInfo.size;
        document.getElementById('price').textContent = roomInfo.pricePerDay;
        pricePerDay = roomInfo.pricePerDay; // Збереження ціни за день
    }

    const roomImageBlob = await fetchRoomImage(hotelId, roomNumber);
    if (roomImageBlob) {
        const imgElement = document.querySelector('.imgRoom');
        imgElement.src = URL.createObjectURL(roomImageBlob);
    }

    // Після оновлення інформації про кімнату, оновлюємо календарі
    renderCalendars(currentMonth, currentYear);
}


document.addEventListener('DOMContentLoaded', updateRoomInfo);

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
async function fetchBookings(hotelId, roomNumber) {
    try {
        const response = await fetch(`/api/bookings/${hotelId}/${roomNumber}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching bookings:', error);
    }
    return [];
}
