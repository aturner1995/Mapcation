

const toAirportEl = $('#to-airport');
const toCity = toAirportEl.val().trim();
const videoSearchEl = $('.video-search-results');
// ! just for testing purpose, delete line 7 when pushing to main
citySearched = 'boston';
var featureAreaEl = $('.feature-area');
var citySearchedListEl = $('.citySearchedList');

// ! save user input to local storage if they are not stored already; needs 
// let searchedCityList = JSON.parse(localStorage.getItem('cities')) || [];
// if(!searchedCityList.includes(citySearched)) {
//     searchedCityList.push(citySearched);
//     localStorage.setItem('cities', JSON.stringify(searchedCityList));    
//     var savedCities = JSON.parse(localStorage.getItem('cities')) || [];
//     console.log(savedCities);                
// }; 


var youTubeApi = `https://www.googleapis.com/youtube/v3/search?&type=video&videoDefinition=high&q=${toCity}+travel&key=AIzaSyA27MKlhWDOB4wzTsYuPIELdowswQ5byqs&part=snippet`;



fetch(youTubeApi)
.then(function(response){
    if(response.ok){
        response.json().then((function cityList(data){
            // console.log(data);
           
        }   
        ))
    }
}
).then(function(){})

let showCities = function(){
    let savedCities = JSON.parse(localStorage.getItem('cities')) || [];  
    console.log(savedCities);
    for(i=0; i<savedCities.length; i++){
    // var citySearchedListEl = document.createElement('div');
    // citySearchedListEl.setAttribute('class', 'citySearchedList');  
    console.log(savedCities[i]);
    // citySearchedListEl.textContent = ;     
    featureAreaEl.append('<p class="citySearchedList"> dsdsds </p>');
}
}

showCities();