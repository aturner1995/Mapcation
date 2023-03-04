// const toAirportEl = $('#to-airport');

const videoAreaEl = $('#video-area');
const videoTitleContainerEL = $('#video-title-container');
const videoContainerEl = $('#video-container');
const videoHeaderEl = $('#video-header');

var showVideos = function(){
    const cityName = toAirportEl.val().trim();
    // 4 5
    const youTubeApi = `https://www.googleapis.com/youtube/v3/search?&type=video&videoDefinition=high&part=snippet&q=${cityName}+tour&key=AIzaSyDJdWQxhrMsK9vQQYEqlKgH53uK3xnf744&maxResults=30`;
    console.log(cityName);

    videoAreaEl.text('');
    let videoHeaderEl = $('<h2 id="video-header">').text('YouTube Travel Guide: ');
    videoAreaEl.append(videoHeaderEl);
    // let nextPageToken = "";

    fetch(youTubeApi)
    .then(function(response){       
        return response.json()})
        .then((data)=>{
            console.log(data);       
            let videos = data.items;
            for(video of videos) {
                let theVideo = '';           
                theVideo = `<iframe width=300 src="http://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allowfullscreen></iframe>`
                $("#theVideos").append(theVideo)
     
            }
        });
        
    }

