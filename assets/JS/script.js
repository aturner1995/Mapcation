// Check for click events on the navbar burger icon
$(".navbar-burger").click(function () {

    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
});
// Setup the map on the page with the inital view on London
var map = L.map('map');
$('#map').append(map)
map.setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var popup = L.popup();
// Allows user to click on map to provide a marker
function onMapClick(e) {

    L.marker(e.latlng).addTo(map);
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}
map.on('click', onMapClick);


// Pass Search parameters to the travel planning HTML
const mostSearchBtn = $('.search-btn')

const searchBtnHandle = (e) => {
    e.preventDefault();
    toCity = $(e.target).text();

    let queryString = `./travel-planning.html?q=${toCity}`;
    location.assign(queryString);

}
mostSearchBtn.on('click', searchBtnHandle);  

