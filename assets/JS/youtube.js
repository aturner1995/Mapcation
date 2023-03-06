// const toAirportEl = $('#to-airport');

const videoAreaEl = $('#video-area');
const videoTitleContainerEL = $('#video-title-container');
const videoHeaderEl = $('#video-header');

var showVideos = function(toCity){
    // const toCity = toAirportEl.val().trim();
    // 4 5
    const youTubeApi = `https://www.googleapis.com/youtube/v3/search?&type=video&videoDefinition=high&part=snippet&q=${toCity}+tour&key=AIzaSyDJdWQxhrMsK9vQQYEqlKgH53uK3xnf744&maxResults=30`;
    console.log(toCity);

    videoAreaEl.text('');
    let videoHeaderEl = $('<h2 id="video-header">').text('YouTube Travel Guide: ');
    videoAreaEl.append(videoHeaderEl);
    
    fetch(youTubeApi)
    .then(function(response){       
        return response.json()})
        .then((data)=>{
            console.log(data);       
            $("#theVideos").text('');
            let videos = data.items;
            for(video of videos) {
                let theVideo = '';           
                theVideo = `<iframe width=300 src="https://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allowfullscreen></iframe>`
                
                $("#theVideos").append(theVideo);

                console.log(data[9]);
     
            }
        });
        
    }

