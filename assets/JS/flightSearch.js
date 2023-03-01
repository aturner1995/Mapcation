const returnDateEL = $('#datepicker-2');
const departDateEl = $('#datepicker');
const fromAirportEl = $('#from-airport');
const toAirportEl = $('#to-airport');
const searchFormEl = $('#search-form');
const travelerAmountEl = $('#traveler-number');
const searchResultsEl = $('.search-results');
const touristResultsEl = $('.tourist-search-results');
const restaurantResultsEL = $('.restaurant-results');

// Search Flights from the users provided form submission
const searchFlightInfo = async (e) => {
    e.preventDefault();
    const fromCity = fromAirportEl.val().trim();
    const toCity = toAirportEl.val().trim();
    const departDate = departDateEl.val().trim();
    const returnDate = returnDateEL.val().trim();
    const travelerAmount = travelerAmountEl.val();

    if (!fromCity || !toCity || !departDate) {
        console.error("Please provide the From City, To City and the departure date");
        return;
    }

    const clientId = 'lLPyMvwNle3XBM8mEfVHLOflW3uOnZUY';
    const clientSecret = 'B4t2EjT9aY2jGtfA';
    const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
    let apiUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?departureDate=${departDate}&max=3&currencyCode=CAD`;
    
    if (returnDate) {
        apiUrl += `&returnDate=${returnDate}`;
    }
    if (travelerAmount === 'Number of travelers') {
        apiUrl += `&adults=1`
    }
    else {
        apiUrl += `&adults=${travelerAmount}`;
    }

    try {
        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
        });

        const tokenData = await tokenResponse.json();
        const token = tokenData.access_token;

        const fromCityResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${fromCity}&max=10&include=AIRPORTS`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const fromCityData = await fromCityResponse.json();
        const fromIataCode = fromCityData.data[0].iataCode;

        const toCityResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${toCity}&max=10&include=AIRPORTS`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        let toCityData = await toCityResponse.json();
        let toIataCode = toCityData.data[0].iataCode;

        apiUrl += `&originLocationCode=${fromIataCode}&destinationLocationCode=${toIataCode}`;

        let flightResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        let flightData = await flightResponse.json();
        // if (flightData.data.length === 0 ) {
        //     toIataCode = toCityData.data[1].iataCode;
        //     apiUrl += `&originLocationCode=${fromIataCode}&destinationLocationCode=${toIataCode}`;
        //     console.log(apiUrl);
        //     const flightResponseTwo = await fetch(apiUrl, {
        //         method: 'GET',
        //         headers: {
        //             'Authorization': `Bearer ${token}`
        //         }
        //     });
        //     flightData = await flightResponseTwo.json();
        //     console.log(flightData);
        // }

        displayFlightResults(flightData);
    } catch (error) {
        console.log(error);
    }
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


const searchTouristInfo = async (e) => {
    e.preventDefault();
    let city = toAirportEl.val().trim();
    const apiKey = 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM=';
    let apiUrl = `https://api.foursquare.com/v3/places/search?query=top%20picks&near=${city}&sort=POPULARITY&limit=10&exclude_all_chains=true`;
    let places = [];

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM='
            }
        });

        if (response.ok) {
            const data = await response.json();
            for (const place of data.results) {
                const photoUrl = `https://api.foursquare.com/v3/places/${place.fsq_id}/photos?sort=POPULAR`;
                const descriptionURL = `https://api.foursquare.com/v3/places/${place.fsq_id}/tips?sort=POPULAR`;
                let placeObject = {
                    id: place.fsq_id,
                    name: place.name
                };
                const photoResponse = await fetch(photoUrl, {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM='
                    }
                });

                if (photoResponse.ok) {
                    const photoData = await photoResponse.json();
                    placeObject.picture = `${photoData[0].prefix}200x200${photoData[0].suffix}`;
                }

                const descriptionResponse = await fetch(descriptionURL, {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM='
                    }
                });

                if (descriptionResponse.ok) {
                    const descriptionData = await descriptionResponse.json();
                if (descriptionData.length > 0) {
                    placeObject.description = descriptionData[0].text;
                    places.push(placeObject);
                } else {
                    placeObject.description = '';
                    places.push(placeObject);
                }
                }                
            }
            displayTouristInfo(places);
        } else {
            console.log('Error: ', response.status);
        }
    } catch (error) {
        console.log(error);
    }
};


const searchRestaurantInfo = async (e) => {
    e.preventDefault();
    let city = toAirportEl.val().trim();
    const apiKey = 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM=';
    let apiUrl = `https://api.foursquare.com/v3/places/search?query=restaurants&near=${city}&sort=POPULARITY&limit=10&exclude_all_chains=true`;
    let places =[];

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM='
            }
        });
    
        if (response.ok) {
            const data = await response.json();
            for (const place of data.results) {
                const photoUrl = `https://api.foursquare.com/v3/places/${place.fsq_id}/photos?sort=POPULAR`;
                const descriptionURL = `https://api.foursquare.com/v3/places/${place.fsq_id}/tips?sort=POPULAR`;
                let placeObject = {
                    id: place.fsq_id,
                    name: place.name
                };
                const photoResponse = await fetch(photoUrl, {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM='
                    }
                });
    
                if (photoResponse.ok) {
                    const photoData = await photoResponse.json();
                    placeObject.picture = `${photoData[0].prefix}200x200${photoData[0].suffix}`;
                }
    
                const descriptionResponse = await fetch(descriptionURL, {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: 'fsq3arJhFAddvYdLjpsFcyafVbELedluIByUHga/lfOF/XM='
                    }
                });
    
                if (descriptionResponse.ok) {
                    const descriptionData = await descriptionResponse.json();
                if (descriptionData.length > 0) {
                    placeObject.description = descriptionData[0].text;
                    places.push(placeObject);
                } else {
                    placeObject.description = '';
                    places.push(placeObject);
                }
                }                
            }
            displayRestaurantInfo(places);
        } else {
            console.log('Error: ', response.status);
        }
    } catch (error) {
        console.log(error);
    }
};


const displayTouristInfo = (places) => {
    touristResultsEl.text('');
    let headerEl = $('<h2>').text('Popular Attractions:');
    touristResultsEl.append(headerEl);
    places.forEach(place => {
        let resultsTextEl = $('<div>').addClass('card my-2 columns');
        let attractionNameEl = $('<h4>').addClass('column');
        let attractionImgEl = $('<img>').addClass('column suggestion-card-image image');
        let descriptionEl = $('<p>');
        attractionImgEl.attr('src', place.picture);
        attractionNameEl.text(place.name);
        descriptionEl.text(place.description);
        let textContainerEl = $('<div>').addClass('text-container pl-1');
        textContainerEl.append(attractionNameEl, descriptionEl);
        resultsTextEl.append(attractionImgEl, textContainerEl);
        touristResultsEl.append(resultsTextEl);
    })
};

const displayRestaurantInfo = (places) => {
    restaurantResultsEL.text('');
    let headerEl = $('<h2>').text('Popular Restaurants:');
    restaurantResultsEL.append(headerEl);
    places.forEach(place => {
        let resultsTextEl = $('<div>').addClass('card my-2 columns');
        let attractionNameEl = $('<h4>').addClass('column');
        let attractionImgEl = $('<img>').addClass('column suggestion-card-image');
        let descriptionEl = $('<p>');
        attractionImgEl.attr('src', place.picture).addClass('image');
        attractionNameEl.text(place.name);
        descriptionEl.text(place.description);
        let textContainerEl = $('<div>').addClass('text-container pl-1');
        textContainerEl.append(attractionNameEl, descriptionEl);
        resultsTextEl.append(attractionImgEl, textContainerEl);
        restaurantResultsEL.append(resultsTextEl);
    })
}

// Event Listener for form submission
searchFormEl.on('submit', e => {
    searchFlightInfo(e);
    searchTouristInfo(e);
    searchRestaurantInfo(e);
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
