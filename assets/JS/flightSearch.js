// HTML ID and Class selectors with Jquery
const returnDateEL = $('#datepicker-2');
const departDateEl = $('#datepicker');
const fromAirportEl = $('#from-airport');
const toAirportEl = $('#to-airport');
const searchFormEl = $('#search-form');
const travelerAmountEl = $('#traveler-number');
const searchResultsEl = $('.search-results');
const touristResultsEl = $('.tourist-search-results');
const restaurantResultsEL = $('.restaurant-results');
const savedSearchesEl = $('.recent-search');
const favLocationsEl = $('.fav-places');

// Search Flights from the users provided form submission
const searchFlightInfo = async (fromCity, toCity, departDate, returnDate, travelerAmount) => {
    // These three parameters are required for flight search. Travel suggestions only require the final destination city.
    // Application will not call flight search API but other features will still be functional.
    if (!fromCity || !toCity || !departDate) {
        console.error("Please provide the From City, To City and the departure date");
        return;
    }
    // API ID's
    const clientId = 'lLPyMvwNle3XBM8mEfVHLOflW3uOnZUY';
    const clientSecret = 'B4t2EjT9aY2jGtfA';
    const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
    let apiUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?departureDate=${departDate}&max=3&currencyCode=CAD`;
    // Changing the api URL based on the user inputs
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
        // POST Call to API to get a token to use for the flight search API call
        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
        });

        const tokenData = await tokenResponse.json();
        const token = tokenData.access_token;
        // API call to get the from city IATA code for flight search
        const fromCityResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${fromCity}&max=10&include=AIRPORTS`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const fromCityData = await fromCityResponse.json();
        const fromIataCode = fromCityData.data[0].iataCode;
        // API call to get the destination IATA code for flight search
        const toCityResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${toCity}&max=10&include=AIRPORTS`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        let toCityData = await toCityResponse.json();
        updateMap(toCityData);
        let toIataCode = toCityData.data[0].iataCode;

        apiUrl += `&originLocationCode=${fromIataCode}&destinationLocationCode=${toIataCode}`;
        // Flight Search API to get final search information for display
        let flightResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        let flightData = await flightResponse.json();
        // If the city search first result provides an incorrect IATA code the function will then search the second city IATA
        // code. If the second provides no results then the flight results are displayed with an error message.
        if (flightData.data.length === 0) {
            toIataCode = toCityData.data[1].iataCode;
            let apiUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?departureDate=${departDate}&max=3&currencyCode=CAD`;
            // Changing the api URL based on the user inputs
            if (returnDate) {
                apiUrl += `&returnDate=${returnDate}`;
            }
            if (travelerAmount === 'Number of travelers') {
                apiUrl += `&adults=1`
            }
            else {
                apiUrl += `&adults=${travelerAmount}`;
            }
            apiUrl += `&originLocationCode=${fromIataCode}&destinationLocationCode=${toIataCode}`;
            // Call the API for the new api url
            const flightDataPromise = new Promise((resolve) => {
              setTimeout(async () => {
                const flightResponseTwo = await fetch(apiUrl, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                const flightData = await flightResponseTwo.json();
                resolve(flightData);
              }, 1000); // waits for 1 seconds before fetching flight data to avoid API errors
            });          
            flightData = await flightDataPromise;
          }         
        displayFlightResults(flightData, fromCity, toCity, travelerAmount);
    } catch (error) {
        console.log(error);
    }
};

// Display Flight results to the page
const displayFlightResults = (data, fromCity, toCity, travelerAmount) => {
    searchResultsEl.text('').append($('<h2>').text(`Flight Results: ${fromCity}-${toCity} (${travelerAmount} Traveler(s))`));
    // If no flight results can be found then that is displayed to the user
    if (data.data.length === 0) {
        searchResultsEl.append($('<p>').text('Sorry, no flight results could be found'));
        return;
    }
    // Display the flight results on the page as a card for each with the flight number, price and # of stops
    data.data.forEach((result) => {
        let resultsTextEl = $('<div>');
        resultsTextEl.addClass('card columns my-2');
        let priceEl = $('<p>').addClass('column');
        priceEl.text('$' + result.price.total + ' ' + result.price.currency);
        
        result.itineraries.forEach((flight) => {
          let carrierEl = $('<p>').addClass('column');
          let stopsEl = $('<p>').addClass('column');
          stopsEl.text(flight.segments.length-1 + ' Stops(s)');
          carrierEl.text(flight.segments[0].carrierCode + flight.segments[0].number);
          
          resultsTextEl.append(carrierEl, stopsEl, priceEl);
        });
        
        searchResultsEl.append(resultsTextEl);
      });      
};

// Foursquare API search for the final destination city
const searchTouristInfo = async (city) => {
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
        // If response is ok then the photos and description are retrived from the foursquare API
        if (response.ok) {
            const data = await response.json();
            for (const place of data.results) {
                const photoUrl = `https://api.foursquare.com/v3/places/${place.fsq_id}/photos?sort=POPULAR`;
                const descriptionURL = `https://api.foursquare.com/v3/places/${place.fsq_id}/tips?sort=POPULAR`;
                let placeObject = {
                    id: place.fsq_id,
                    name: place.name,
                    location: place.geocodes.main
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

// Foursquare API call for top restaurant selections in the destination city
const searchRestaurantInfo = async (city) => {
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
        // If response is ok the photo and description for the location is found
        if (response.ok) {
            const data = await response.json();
            for (const place of data.results) {
                const photoUrl = `https://api.foursquare.com/v3/places/${place.fsq_id}/photos?sort=POPULAR`;
                const descriptionURL = `https://api.foursquare.com/v3/places/${place.fsq_id}/tips?sort=POPULAR`;
                let placeObject = {
                    id: place.fsq_id,
                    name: place.name,
                    location: place.geocodes.main
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

// Display the tourist attraction info on a card with the name, image and description for 10 selections
const displayTouristInfo = (places) => {
    touristResultsEl.text('');
    let headerEl = $('<h2>').text('Popular Attractions:');
    touristResultsEl.append(headerEl);
    places.forEach(place => {
        let resultsTextEl = $('<div>').addClass('card my-2 columns');
        let attractionNameEl = $('<h4>').addClass('column');
        let attractionImgEl = $('<img>').addClass('column suggestion-card-image image');
        let descriptionEl = $('<p>');
        let addBtn = $('<button>').text('ADD').addClass('button is-primary ml-2 is-small add-btn');
        attractionImgEl.attr('src', place.picture);
        attractionNameEl.text(place.name).append(addBtn).data('lat', place.location.latitude).data('long', place.location.longitude);
        descriptionEl.text(place.description);
        let textContainerEl = $('<div>').addClass('text-container pl-1');
        textContainerEl.append(attractionNameEl, descriptionEl);
        resultsTextEl.append(attractionImgEl, textContainerEl);
        touristResultsEl.append(resultsTextEl);
    })
};
// Display the restaurant info on a card with the name, image and description for 10 selections
const displayRestaurantInfo = (places) => {
    restaurantResultsEL.text('');
    let headerEl = $('<h2>').text('Popular Restaurants:');
    restaurantResultsEL.append(headerEl);
    places.forEach(place => {
        let resultsTextEl = $('<div>').addClass('card my-2 columns');
        let attractionNameEl = $('<h4>').addClass('column');
        let attractionImgEl = $('<img>').addClass('column suggestion-card-image');
        let descriptionEl = $('<p>').text(place.description);
        let addBtn = $('<button>').text('ADD').addClass('button is-primary ml-2 is-small add-btn');
        attractionImgEl.attr('src', place.picture).addClass('image');
        attractionNameEl.text(place.name).append(addBtn).data('lat', place.location.latitude).data('long', place.location.longitude);
        let textContainerEl = $('<div>').addClass('text-container pl-1');
        textContainerEl.append(attractionNameEl, descriptionEl);
        resultsTextEl.append(attractionImgEl, textContainerEl);
        restaurantResultsEL.append(resultsTextEl);
    })
}
// Add a location from the top attractions and restaurants to local storage
const addLocation = (e) => {
    let recentSearch = JSON.parse(localStorage.getItem('recentSearch')) || [];
    let card = $(e.target).closest('.card');
    let nameEl = card.find('h4');
    let imgEl = card.find('img');

    let name = $(nameEl).text().replace('ADD','');

    if (!(recentSearch[recentSearch.length - 1].savedLocations.some(location => location.name === name))) {
        let savedLocation = {
            name: name,
            image: imgEl.attr('src'),
            lat: nameEl.data('lat'),
            long: nameEl.data('long')
        };
        recentSearch[recentSearch.length - 1].savedLocations.push(savedLocation);
        localStorage.setItem('recentSearch', JSON.stringify(recentSearch));

        // Add marker to the map
        addMarker(recentSearch);

        displayFavLocations();
    }
};


// Display the user saved locations from their search on the page
const displayFavLocations = () => {
    let recentSearch = JSON.parse(localStorage.getItem('recentSearch')) || [];
    favLocationsEl.empty();
    // Display the saved locations for the last item in the recent search object (current search)
    recentSearch[recentSearch.length-1].savedLocations.forEach(place => {
        let locationDisplayEl = $('<button>').text(place.name).addClass('button is-primary m-5 pr-0 fav-btn');
        let deleteBtn = $('<button>').addClass('delete is-large ml-2');
        locationDisplayEl.append(deleteBtn);
        favLocationsEl.append(locationDisplayEl);
    })
    // Delete button handler for the saved locations
    $('body').on('click', 'button.delete', (e) => {
        e.stopPropagation();
        let index = $(e.target).closest('.fav-btn').index();
        console.log(recentSearch)
        recentSearch[recentSearch.length-1].savedLocations.splice(index, 1);
        localStorage.setItem('recentSearch', JSON.stringify(recentSearch));
        displayFavLocations();
    });
}

// Add marker to the map for each of the saved locatons. The name will be attached as a popup.
const addMarker = (recentSearch) => {
    recentSearch[recentSearch.length-1].savedLocations.forEach(place => {
        let marker = L.marker([place.lat, place.long]).addTo(map);
        marker.bindPopup(place.name).openPopup();
    })
}

// Save the recent search in the local storage
const saveRecentSearch = (fromCity, toCity, departDate, returnDate, travelerAmount) => {

    if (travelerAmount === 'Number of travelers') {
        travelerAmount = 1;
    }

    let recentSearch = JSON.parse(localStorage.getItem('recentSearch')) || [];
    // The object that will be saved in local storage
    const searchObj = {
        fromCity: fromCity,
        toCity: toCity,
        departDate: departDate,
        returnDate: returnDate,
        travelerAmount: travelerAmount,
        savedLocations: []
    };

    // Check if the search object is already in recentSearch
    const isDuplicate = recentSearch.some(obj =>
        obj.fromCity === fromCity &&
        obj.toCity === toCity &&
        obj.departDate === departDate &&
        obj.returnDate === returnDate
    );
    // If it is not a duplicate then add the search to the recent search local storage
    if (!isDuplicate) {
        recentSearch.push(searchObj);
        localStorage.setItem('recentSearch', JSON.stringify(recentSearch));
    }
    displayRecentSearch(recentSearch);
}

// Display the recent search list
const displayRecentSearch = () => {
    let recentSearch = JSON.parse(localStorage.getItem('recentSearch')) || [];
    savedSearchesEl.empty();

    for (var i=recentSearch.length-1; i >=0; i--) {
        let cityDisplayEl = $('<button>').text(`${recentSearch[i].toCity} (${recentSearch[i].departDate}/${recentSearch[i].returnDate})`).addClass('button is-primary recent-btn m-5 pr-0').data('location', i);
        let deleteBtn = $('<button>').addClass('delete is-large ml-2');
        cityDisplayEl.append(deleteBtn);
        savedSearchesEl.append(cityDisplayEl);
        // Delete button of recent search items 
        deleteBtn.on('click', (e) => {
            e.stopPropagation();
            let index = $(e.target).closest('.recent-btn').data('location');
            recentSearch.splice(index, 1);
            localStorage.setItem('recentSearch', JSON.stringify(recentSearch));
            displayRecentSearch();
        });
    }    
};

// When user clicks on the recent search button the function gets 
const recentSearchAgain = (e) => {
    let recentSearch = JSON.parse(localStorage.getItem('recentSearch')) || [];
    let index = $(e.target).data('location')
    // Get data from the user click to properly call the API's
    let clickedSearch = recentSearch[index];
    let fromCity = recentSearch[index].fromCity;
    let toCity = recentSearch[index].toCity;
    let departDate = recentSearch[index].departDate;
    let returnDate = recentSearch[index].returnDate;
    let travelerAmount = recentSearch[index].travelerAmount;
    // Moves the search from the current position to the last item in the stored object
    recentSearch.splice(index, 1);

    recentSearch.push(clickedSearch);

    localStorage.setItem('recentSearch', JSON.stringify(recentSearch));

    displayRecentSearch();
    displayFavLocations();
    searchFlightInfo(fromCity, toCity, departDate, returnDate, travelerAmount);
    searchTouristInfo(toCity);
    searchRestaurantInfo(toCity);
    addMarker(recentSearch);
    showVideos(toCity);
}
// When the user selects the Top Searches the data is passed to the user search form
const getParams = () => {
    let toCity = decodeURI(document.location.search.split('=')[1]);
    if (toCity !== 'undefined') {
        toAirportEl.val(toCity);
    }
}

// Sets up the page with recent searches for the user when it is loaded
const init = () => {
    displayRecentSearch();
    getParams();
}
// Get the user provided data from the search form. Call the API's from that data
const searchForm = (e) => {
    e.preventDefault();
    let fromCity = fromAirportEl.val().trim();
    let toCity = toAirportEl.val().trim();
    let departDate = departDateEl.val().trim();
    let returnDate = returnDateEL.val().trim();
    let travelerAmount = travelerAmountEl.val();

    searchFlightInfo(fromCity, toCity, departDate, returnDate, travelerAmount);
    searchTouristInfo(toCity);
    searchRestaurantInfo(toCity);
    saveRecentSearch(fromCity, toCity, departDate, returnDate, travelerAmount);
    displayFavLocations();
    showVideos(toCity);
}
// Update the map view when the user selects a final destination
const updateMap = (toCityData) => {
    map.setView([toCityData.data[0].geoCode.latitude, toCityData.data[0].geoCode.longitude], 13);
}


// Event Listener for form submission
searchFormEl.on('submit', searchForm)
// Event listener for the add location button
$('body').on('click', 'button.add-btn', addLocation);

$('body').on('click', 'button.recent-btn', recentSearchAgain)

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

init();
