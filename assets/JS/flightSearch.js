const returnDateEL = $('#datepicker-2');
const departDateEl = $('#datepicker');
const fromAirportEl = $('#from-airport');
const toAirportEl = $('#to-airport');
const searchFormEl = $('#search-form');
const travelerAmountEl = $('#traveler-number');
const searchResultsEl = $('.search-results');
const touristResultsEl = $('.tourist-search-results');

// Search Flights from the users provided form submission
const searchFlightInfo = (e) => {
    e.preventDefault();
    let fromCity = fromAirportEl.val().trim();
    let toCity = toAirportEl.val().trim();
    let departDate = departDateEl.val().trim();
    let returnDate = returnDateEL.val().trim();
    let travelerAmount = travelerAmountEl.val();
    // If the from city, to city and the departure date do not have values the API is not called
    if (!fromCity || !toCity || !departDate) {
        console.error("Please provide the From City, To City and the departure date");
        return;
    }

    const clientId = 'lLPyMvwNle3XBM8mEfVHLOflW3uOnZUY';
    const clientSecret = 'B4t2EjT9aY2jGtfA';
    const url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
    // Create the correct api url from the users search data
    let apiUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${fromCity}&destinationLocationCode=${toCity}&departureDate=${departDate}&max=3&currencyCode=CAD`;
    if (returnDate) {
        apiUrl = apiUrl + `&returnDate=${returnDate}`;
    }
    if (travelerAmount === 'Number of travelers') {
        apiUrl = apiUrl + `&adults=1`
    }
    else {
        apiUrl = apiUrl + `&adults=${travelerAmount}`;
    }
    console.log(apiUrl);
    // API call. This API requires a POST call to access API token before the GET call can be made.
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let token = data.access_token;
            fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        displayFlightResults(data);
                        console.log(data);
                    });
                }
            });
        })
        .catch(error => console.log(error));
};

const displayFlightResults = (data) => {
    searchResultsEl.text('').append($('<h2>').text('Flight Results:'));

    data.data.forEach((result) => {
        let resultsTextEl = $('<div>');
        resultsTextEl.addClass('card columns my-2');
        let carrierEl = $('<p>').addClass('column');
        let flightTimeEl = $('<p>');
        let stopsEl = $('<p>').addClass('column');
        let priceEl = $('<p>').addClass('column');
        stopsEl.text(result.itineraries[0].segments.length-1 + ' Stop(s)');
        carrierEl.text(result.itineraries[0].segments[0].carrierCode + result.itineraries[0].segments[0].number);
        priceEl.text('$' + result.price.total + ' ' + result.price.currency);
        resultsTextEl.append(carrierEl, stopsEl, priceEl);
        searchResultsEl.append(resultsTextEl);
    });
};


const searchTouristInfo = (e) => {
    e.preventDefault();
    let city = toAirportEl.val().trim();
    const apiKey = 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM=';
    let apiUrl = `https://api.foursquare.com/v3/places/search?query=top%20picks&near=${city}&sort=POPULARITY&limit=10`;
    let places =[];

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM='
          }
    }).then(response => {
        if (response.ok) {
            response.json().then(data => {
                data.results.forEach(place => {
                    const photoUrl = `https://api.foursquare.com/v3/places/${place.fsq_id}/photos?sortNEWEST`;
                    const descriptionURL = `https://api.foursquare.com/v3/places/${place.fsq_id}/tips?sort=POPULAR`;
                    let placeObject = {
                        id: place.fsq_id,
                        name: place.name
                    };
                    fetch(photoUrl, {
                        method: 'GET',
                        headers: {
                        accept: 'application/json',
                        Authorization: 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM='
                        }
                    }).then(response => response.json().then(photoData => {
                        placeObject.picture = `${photoData[0].prefix}200x200${photoData[0].suffix}`
                    }))
                    fetch(descriptionURL, {
                        method: 'GET',
                        headers: {
                            accept: 'application/json',
                            Authorization: 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM='
                        }
                    }).then(response => response.json().then(descriptionData => {
                        placeObject.description = descriptionData[0].text;
                        places.push(placeObject);
                        if (places.length === data.results.length) {
                            displayTouristInfo(places);
                        }
                    }))
                })
            })
        }
    })
    .catch(error => console.log(error));
};

const displayTouristInfo = (places) => {
    console.log(places);
    touristResultsEl.text('');
    places.forEach(place => {
        let resultsTextEl = $('<div>').addClass('card columns');
        let attractionNameEl = $('<h4>');
        let attractionImgEl = $('<img>');
        let descriptionEl = $('<p>');
        attractionImgEl.attr('src', place.picture).addClass('column');
        attractionNameEl.text(place.name).addClass('column');
        descriptionEl.text(place.description);
        attractionNameEl.append(descriptionEl);
        resultsTextEl.append(attractionNameEl,attractionImgEl);
        touristResultsEl.append(resultsTextEl);


    })
}

// Event Listener for form submission
searchFormEl.on('submit', e => {
    searchFlightInfo(e);
    searchTouristInfo(e);
});

// Check for click events on the navbar burger icon
$(".navbar-burger").click(() => {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");

});

// JQuery datepicker with custom format and restrictions for dates that can be selected
$(() => {
    $("#datepicker").datepicker({
        dateFormat: 'yy-mm-dd',
        minDate: 0,
        maxDate: '+6M'
    });
    $("#datepicker-2").datepicker({
        dateFormat: 'yy-mm-dd',
        minDate: 0,
        maxDate: '+7M'
    });
});
