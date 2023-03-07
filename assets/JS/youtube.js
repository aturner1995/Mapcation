const videoAreaEl = $('#video-area');
const videoTitleContainerEL = $('#video-title-container');
const videoHeaderEl = $('#video-header');
// API call to Youtube API and then display the search information on the page
var showVideos = function(toCity){
     // the youtube api, to get 30 videos of the destination city.
    const youTubeApi = `https://www.googleapis.com/youtube/v3/search?&type=video&videoDefinition=high&part=snippet&q=${toCity}+tour&key=AIzaSyDJdWQxhrMsK9vQQYEqlKgH53uK3xnf744&maxResults=30`;
    // clear the whole video container in case there are any previous results
    videoAreaEl.text('');
    // create the header for the videos section
    let videoHeaderEl = $('<h2 id="video-header">').text('YouTube Travel Guide: ');
    videoAreaEl.append(videoHeaderEl);
    // API Call
    fetch(youTubeApi)
    .then(function(response){       
        return response.json()})
        .then((data)=>{   
            $("#theVideos").text('');
            let videos = data.items;
            // Loop through each video and add them to the video container
            for(video of videos) {
                let theVideo = '';           
                theVideo = `<iframe width=300 src="https://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allowfullscreen></iframe>`
                
                $("#theVideos").append(theVideo);     
            }
        });
        
    }

