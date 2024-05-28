async function getAllHotel() {
    const res = await fetch('https://jsonplaceholder.typicode.com/users$limit=10');
    const hotels = await res.json();

    console.log(hotels);
    hotels.forEach(hotel => hotelToHTML(hotel));
}

window.addEventListener('DOMContentLoaded', getAllHotel);

function hotelToHTML ({id, title, thumbnailUrl}) {
    const hotelsList = document.getElementById('hotelsList');

    hotelsList.insertAdjacentHTML('beforeend', `
        
    `);
}d