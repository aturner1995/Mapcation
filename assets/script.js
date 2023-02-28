$(document).ready(function() {

    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
  
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
  
    });

    $('#map').append(map)
    var map = L.map('map');
    map.setView([51.505, -0.09], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
     }).addTo(map);

     navigator.geolocation.watchPosition(success, error);

     var marker, circle, zoomed;
     function success(position){
       var lat = position.coords.latitude;
       var lng = position.coords.longitude;
       var accuracy= position.coords.accuracy;

       if(marker){
        map.removeLayer(marker);
        map.removeLayer(circle);
       }

      marker= L.marker([lat, lng]).addto(map);
      circle=L.circle([lat, lng], {radius: accuracy}).addto(map);
      if(!zoomed){
      zoomed= map.fitBound(circle.getBound());
      }
      map.setView([lat, lng]);
   }
//    function error(err){
//         if(err.code===1){
//             alert("please allow location")
//         }else{
//             alert("can not get current location");
//         }
//    }
});