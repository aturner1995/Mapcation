// const toAirportEl = $('#to-airport');
var cityName = toAirportEl.val().trim();
var videoContainerEl = $('#video-container');
var videoHeaderEl = $('#video-header');
// ! just for testing purpose, delete line 7 when pushing to main
cityName = 'bosdton';


// ! save user input to local storage if they are not stored already; needs 
// let searchedCityList = JSON.parse(localStorage.getItem('cities')) || [];
// if(!searchedCityList.includes(citySearched)) {
//     searchedCityList.push(citySearched);
//     localStorage.setItem('cities', JSON.stringify(searchedCityList));    
//     var savedCities = JSON.parse(localStorage.getItem('cities')) || [];
//     console.log(savedCities);                
// }; 

// 4 5

var youTubeApi = `https://www.googleapis.com/youtube/v3/search?&type=video&videoDefinition=high&part=snippet&q=${cityName}+tour&key=AIzaSyDJdWQxhrMsK9vQQYEqlKgH53uK3xnf744`;

var showVideos = function(){
    videoContainerEl.text('');
    let videoHeaderEl = $('<h2>').text('YouTube Travel Guide: ');
    videoContainerEl.append(videoHeaderEl);

    fetch(youTubeApi)
    .then(function(response){       
        return response.json()})
        .then((data)=>{
            console.log(data);       
            let videos = data.items;
            for(video of videos) {
                var cityvideo = `<img src='${video.snippet.thumbnails.medium.url}'>`
                videoContainerEl.append(cityvideo);
            }
        });
        
    }

