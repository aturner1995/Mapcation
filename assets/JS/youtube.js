const videoAreaEl = $('#video-area');
const videoTitleContainerEL = $('#video-title-container');
const videoHeaderEl = $('#video-header');
// API call to Youtube API and then display the search information on the page
var showVideos = function(toCity){

    const youTubeApi = `https://www.googleapis.com/youtube/v3/search?&type=video&videoDefinition=high&part=snippet&q=${toCity}+tour&key=AIzaSyDJdWQxhrMsK9vQQYEqlKgH53uK3xnf744&maxResults=30`;

    videoAreaEl.text('');
    let videoHeaderEl = $('<h2 id="video-header">').text('YouTube Travel Guide: ');
    videoAreaEl.append(videoHeaderEl);
    // API Call
    fetch(youTubeApi)
    .then(function(response){       
        return response.json()})
        .then((data)=>{    
            $("#theVideos").text('');
            let videos = data.items;
            // Loop through each video
            for(video of videos) {
                let theVideo = '';           
                theVideo = `<iframe width=300 src="https://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allowfullscreen></iframe>`
                
                $("#theVideos").append(theVideo);     
            }
        });
        
    }

