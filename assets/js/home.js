
var searchCity = $(".input")
var searchButton = $(".button-search-city")
var locationButton = $(".button-location")

function searchFormSubmitCity() {
    
    var searchCityVal = searchCity.val();

    if (!searchCityVal) {
        return;
    } 
    var queryString = "./results.html?q=" + searchCityVal + "&by_type=all"
    location.assign(queryString)
}

function searchCityAndType(type) {
    
    var searchCityVal = searchCity.val();
    if (!searchCityVal) {
        return;
    } 
    var queryString = "./results.html?q=" + searchCityVal + "&by_type=" + type
    location.assign(queryString)
}

function searchByLocation(lat, lon) {
    var queryString = "./results.html?lat=" + lat + "&lon=" + lon + "&by_type=all"
    location.assign(queryString);
}

   
function getUserLocation() {
    if ("geolocation" in navigator){ //check geolocation available 
        //try to get user current location using getCurrentPosition() method
        navigator.geolocation.getCurrentPosition(function(position){ 

            var userLat = position.coords.latitude
            var userLon = position.coords.longitude
            searchByLocation(userLat, userLon)
            });

    }else{
        console.log("Browser doesn't support geolocation!");
    }
}




searchButton.on("click", function(event) {
    event.preventDefault()
    // searchFormSubmitCity();
    var brewType = $('#brewTypeOption').children("option:selected").val()

    if (brewType) {
        searchCityAndType(brewType)
    } else {
        searchFormSubmitCity()
    }
    
    })

locationButton.on("click", function(event) {
    event.preventDefault();
    getUserLocation();
})