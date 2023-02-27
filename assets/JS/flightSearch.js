$(() => {
    $("#datepicker").datepicker({
        dateFormat: 'yy-mm-dd'
    });
    $("#datepicker-2").datepicker({
        dateFormat: 'yy-mm-dd'
    });
});

const returnDateEL = $('#datepicker-2');
const departDateEl = $('#datepicker');
const fromAirportEl = $('#from-airport');
const toAirportEl = $('#to-airport');
const searchFormEl = $('#search-form');
const travelerAmountEl = $('#traveler-number');
const searchResultsEl = $('.search-results');

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



    for (let i=0; i< data.data.length; i++) {
        let resultsTextEl = $('<div>');
        resultsTextEl.addClass('card columns my-2');
        let carrierEl = $('<p>').addClass('column');
        let flightTimeEl = $('<p>');
        let stopsEl = $('<p>').addClass('column');
        let priceEl = $('<p>').addClass('column');
        stopsEl.text(data.data[i].itineraries[0].segments.length-1 + ' Stop(s)');
        carrierEl.text(data.data[i].itineraries[0].segments[0].carrierCode + data.data[i].itineraries[0].segments[0].number);
        priceEl.text('$' + data.data[i].price.total + ' ' + data.data[i].price.currency);
        resultsTextEl.append(carrierEl, stopsEl, priceEl);
        searchResultsEl.append(resultsTextEl);
    }
 };

// Event Listener for form submission
searchFormEl.on('submit', searchFlightInfo);

// Check for click events on the navbar burger icon
$(".navbar-burger").click(() => {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");

});

