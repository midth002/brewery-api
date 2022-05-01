var brewData = $(".brewData")
var searchCity = $(".input")
var searchButton = $("#city-button")
var weatherData = $(".weatherData")
var weatherContainer = $(".weatherContainer")
var forecastData = $('.forecastData')
var locationButton = $("#location-button")

var checkboxes = $('input[type=checkbox')

var apiKey = "385e58697effddc1169cee4d7d6e5489"
var perPage = "50"

var favoriteArray ;
var storedFavorites
var duplicateFavorite = false;

var favoriteLabel = $("<label class='checkbox'>")
var favoriteInput = $("<input type='checkbox' class='favorite'>")

function init() {
    getLocalStorage();
    removeCard(); 
    var searchParam = document.location.search
    queryArray = searchParam.split('=')
        if (queryArray.includes('?q')) {
            checkCityParam();
        } else  if (queryArray.includes('?lat')){
            checkLocationParam();
        } else {
            return;
        }
}
 
function initByLocation() {
    var param = document.location.search.split('=')
    var query = param[1].split('&lon')
    var queryLat = query[0]
    var queryLon = param[2]
    breweryApiByDistance(queryLat, queryLon)
    weatherOneCall(queryLat, queryLon, "Your Location")

}

function initForCity() {
    var searchParamArr = document.location.search.split('?q=')
    var initialSearch = searchParamArr[1];
    getBreweryApi(initialSearch);
    getWeatherByCity(initialSearch)
}

function initByCityType() {
    var searchParamArr = document.location.search.split('?q=')
    var byTypeQuery = searchParamArr[1].split('&by_type=')
    filterApi(byTypeQuery[0], byTypeQuery[1])
}

function checkCityParam() {
    var queryArray = document.location.search.split('=')
    var secondQuery = queryArray[1].split('&')
    
    if (queryArray[2] == "all") {
        getBreweryApi(secondQuery[0])
        getWeatherByCity(secondQuery[0]);
    } else {
        filterApi(secondQuery[0], queryArray[2])
        getWeatherByCity(secondQuery[0]);
    }
    
}

function checkLocationParam() {
    var queryArray = document.location.search.split('=')
    
    var latQuery = queryArray[1].split('&lon')
    var lonQuery = queryArray[2].split('&by_type')

    if (queryArray[3] == "all") {
        breweryApiByDistance(latQuery[0], lonQuery[0])
        weatherOneCall(latQuery[0], lonQuery[0], "Your Location")
    } else {
        filterDistApi(latQuery, lonQuery[0], queryArray[3])
        weatherOneCall(latQuery[0], lonQuery[0], "Your Location")
    }

}
  

function removeParam() {
    var queryString = "./results.html?"
    location.assign(queryString);
}


function getBreweryApi(city) {

    var brewUrl = "https://api.openbrewerydb.org/breweries?per_page=" + perPage + "&by_city=" + city
    fetch(brewUrl)
        .then(function (response) {
            return response.json();
        })  
        .then(function (data) { 
            checkNumOfResults(data.length)
            createBrewCard(data)
        })
    
}

// new Function
function checkNumOfResults(results) {
    if (results == 1) {
        $('#brew-data-number-results').text(results + " Result")
    } else if (results > 1) {
        $('#brew-data-number-results').text(results + " Results")
    } else {
        $('#brew-data-number-results').text("No Results")
    }
}

function filterApi(city, type) {

    var brewUrl = "https://api.openbrewerydb.org/breweries?per_page=" + perPage + "&by_city=" + city + "&by_type=" + type
    fetch(brewUrl)
        .then(function (response) {
            return response.json();
        })  
        .then(function (data) { 
            checkNumOfResults(data.length)
            createBrewCard(data)
        })
    
}
 
function getUserLocation() {
    if ("geolocation" in navigator){ //check geolocation available 
        //try to get user current location using getCurrentPosition() method
        navigator.geolocation.getCurrentPosition(function(position){ 
            var brewType = $('#brewTypeOption').children("option:selected").val()
            if (brewType === "" || brewType === "all") {
                breweryApiByDistance(position.coords.latitude, position.coords.longitude)
                weatherOneCall(position.coords.latitude, position.coords.longitude, "Your Location")
            } else {
                filterDistApi(position.coords.latitude, position.coords.longitude, brewType)
            }
                
            });
    }else {
        console.log("Browser doesn't support geolocation!");
    }
}

function breweryApiByDistance(lat, lon) {
   var distUrl = "https://api.openbrewerydb.org/breweries?by_dist=" + lat + "," + lon + "&per_page=" + perPage 

   fetch(distUrl)
   .then(function (response) {
       return response.json();
   })  
   .then(function (data) { 
       checkNumOfResults(data.length)
       createBrewCard(data)
   })
}

function filterDistApi(lat, lon, type) {
    var distTypeUrl = "https://api.openbrewerydb.org/breweries?by_dist=" + lat + "," + lon + "&per_page=" + perPage + "&by_type=" + type 

    fetch(distTypeUrl)
    .then(function (response) {
        return response.json();
    })  
    .then(function (data) { 
        checkNumOfResults(data.length)
        createBrewCard(data)
    })
}

function createBrewCard(data) {
    for (i=0; i < data.length; i++) {
                
        var brewDiv = $('<div>').addClass("brewCard");
        var headingDiv = $('<div>').addClass("brewHeading")
        var brewName = $("<h3>");
        var favoriteLabel = $("<label class='checkbox'>")
        var favoriteInput = $("<input type='checkbox' class='favorite'>")
       
        var ul = $('<ul>');
        var li1 = $('<li>');
        var li2 = $('<li class="brew-street">');
        var li3 = $('<li class="brew-city">');
        var li5 = $('<li class="brew-list-link">'); 
        var brewLink = $('<a class="brew-link">');
        brewLink.attr("href" , data[i].website_url)
        brewLink.text("Visit Website");

        brewName.text(data[i].name);
        favoriteLabel.text("Favorites ")
        li1.text("Brewery Type: " + data[i].brewery_type);
        li2.text("Street Address: " + data[i].street);
        li3.text(data[i].city + " " + data[i].state);
        
        
        brewName.attr("style", "font-size: 2rem", "font-weight: bolder");
        headingDiv.addClass('has-background-grey');
        brewDiv.attr("style", "border: 5px dotted gold; margin: 10px; width: 100%; padding: 10px;");
        //ul.children().attr("style", "position: center")

        favoriteLabel.append(favoriteInput);
        li5.append(brewLink);
        ul.append(li1, li2, li3, li5);
        headingDiv.append(brewName, favoriteLabel)
        brewDiv.append(headingDiv, ul);
        brewData.append(brewDiv);

    }
    checkFavorite();
 
}


function checkFavorite() {
    $('input.favorite').on('change', function(){
        console.log("Change Event happened")
        var thisBrewHeading = $(this).parents('.brewHeading')
        var thisBrewCard = $(this).parents('.brewCard')
            var thisBrewName = thisBrewHeading.children('h3').text()
            var thisUl = thisBrewCard.children('ul')
            var thisCityName = thisUl.children('.brew-city').text()
            var thisStreet = thisUl.children('.brew-street').text()
            var thisUrlListItem = thisUl.children('.brew-list-link')
            var thisUrl = thisUrlListItem.children().attr('href')
         
        if($(this).is(':checked') && checkDuplicate(thisBrewName) === false) {
            console.log("Not a duplicate")
            setLocalStorage(thisBrewName, thisStreet, thisCityName, thisUrl)
        } else if ($(this).is(':checked') && checkDuplicate(thisBrewName) === true) {
            console.log("duplicate")
           
        } else { 
            removeFromLocalStorage(thisBrewName)  
        }
      
       
    }); 
}

function checkDuplicate(thisBrewName) {
    duplicateFavorite = false;
    for (i=0; i<favoriteArray.length; i++) {
        console.log(duplicateFavorite)
       if (thisBrewName === favoriteArray[i].name) {
           console.log("If statement")
           duplicateFavorite = true;  
           return duplicateFavorite;
       }      
    }
    return duplicateFavorite;
}

function getWeatherByCity(name) {
    
    var latLonUrl =  "https://api.openweathermap.org/geo/1.0/direct?q="+ name +"&limit=1&appid=" + apiKey

    fetch(latLonUrl) 
        .then(function (response) {
            return response.json();
        })

        .then(function (data) { 
             var lat1 = data[0].lat.toString()
             var lon1 = data[0].lon.toString()

             weatherOneCall(lat1, lon1, name)

        })
}

function weatherOneCall(lat, lon, name) { 
        var weatherUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=imperial"

        fetch(weatherUrl) 
           .then(function (response) {
               return response.json();
           })
            .then(function (data) {
                var sunset = data.current.sunset

                 // Current weather element created
                 var currentDiv = $('<div>').addClass("weatherCard");
                 var weatherTitle = $('<h4>')
                 var iconSpan = $('<span>')
                 var currentWeatherIcon = $('<i>')
                 var currentUl = $('<ul>')
                 var tempLi = $("<li>")
                 var windLi = $("<li>")
                 var humLi = $("<li>")
                 var uvLi = $("<li>")
                 var sunsetLi = $("<li>")

                // Add text to weather elements
                 weatherTitle.text("Currently in " + name + "  ")
                 tempLi.text("Temp: " + data.current.temp.toFixed() + "°F")
                 windLi.text("Wind: " + data.current.wind_speed.toFixed() + " MPH")
                 humLi.text("Humidity: " + data.current.humidity + "%")
                 uvLi.text("UV Index: " + data.current.uvi)
                 sunsetLi.text("Sunset: " + convertUnixTime(sunset))
                 currentWeatherIcon.html("<img src='https://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png' alt='Icon depicting current weather.'>");
                 
                currentWeatherIcon.attr("style", "margin-top: 12px;")
                 currentDiv.attr("style", "background-color: white;")
                 iconSpan.attr("style", "margin-left: 5px;")

                // Append elements to the weathercontainer
                iconSpan.append(currentWeatherIcon);
                weatherTitle.append(iconSpan)
                currentUl.append(tempLi, windLi, humLi, uvLi, sunsetLi)
                currentDiv.append(weatherTitle, currentUl)
                weatherData.append(currentDiv)
                weatherContainer.append(weatherData)
               
                
               // 7 day forecast loop
               displayForecast(data)
            })
}

// New Function
function displayForecast(data) {
    removeOldForecast();
    for (i=1; i<8; i++) {

        var unix = data.daily[i].dt
        var forecastDate = dateFormatter(unix);
        var day = moment(forecastDate, "M/D/YYYY").format("ddd")

        var forecastCard = $('<div>')
        var forecastHeading = $('<div>')
        var forecastHeader = $('<h4>')
        var weatherIcon = $('<span>')
        weatherIcon.html("<img src='https://openweathermap.org/img/w/" + data.daily[i].weather[0].icon + ".png' alt='Icon depicting weather.'>"); 

        var tempEl = $('<p>')
        var spanMinTemp = $('<span>')
        forecastHeader.text(day)
        tempEl.text(data.daily[i].temp.max.toFixed() + "°  ")
        spanMinTemp.text(data.daily[i].temp.min.toFixed() + "°")

        forecastHeader.attr("style", "height:10%; line-height:0; margin-top: 15px; margin-right: 5px; font-size: 20px")
        
        forecastCard.attr("style", "display: inline-block; overflow: hidden; margin: 0 10px; justify-content:center width: 20%")
        spanMinTemp.attr("style", "color:grey")
        tempEl.attr("style", "font-weight:bold; font-size: 12px; text-align: center")

        tempEl.append(spanMinTemp)
        forecastHeading.append(forecastHeader, weatherIcon);
        forecastCard.append(forecastHeading, tempEl);
        forecastData.append(forecastCard);

    }
    weatherContainer.attr("style", "display:flex; justify-content: center")

}

function convertUnixTime(unixTime) {
    var time = new Date(unixTime)
    var timeString = time.toLocaleTimeString("en-US")
    return timeString;
}

function dateFormatter(unixTime) {
    var date = new Date(unixTime * 1000)
    var dateString = date.toLocaleDateString("en-US")
    return dateString;
}

// New Function
function removeCard() {
    $(".brewCard").remove();
    $(".weatherCard").remove();
}

searchButton.on("click", function(e) {
    e.preventDefault();
    var searchValue = searchCity.val().trim()
    if(!searchValue) {
        return;
    } else {
    removeCard();
    getWeatherByCity(searchCity.val().trim());
    var brewType = $('#brewTypeOption').children("option:selected").val()
    if (brewType === "" || brewType === "all") {
        getBreweryApi(searchCity.val().trim());
    } else {
        filterApi(searchCity.val().trim(), brewType)
    } }
})

locationButton.on("click" , function(e) { 
    e.preventDefault();
    removeCard();
    getUserLocation();
    
})

// New objects
function setLocalStorage(brewName, brewStreet, brewCity, brewUrl) {
   // console.log(favoriteArray)
    favoriteArray.push({
        name: brewName,
        street: brewStreet,
        city: brewCity,
        Url: brewUrl
    })
    localStorage.setItem("favorites", JSON.stringify(favoriteArray))
    
}

function getLocalStorage() {
    storedFavorites = JSON.parse(localStorage.getItem("favorites")); 
    favoriteArray = storedFavorites || [];
}

function removeFromLocalStorage(storedName) {
    for (i=0; i < favoriteArray.length; i++) {
        if (favoriteArray[i].breweryName == storedName) {
            favoriteArray.splice(i, 1)
            localStorage.setItem("favorites", JSON.stringify(favoriteArray))
        }
    }
}

function removeOldForecast() {
    forecastData.children().remove()
}

// New function
function renderFavorites() {
    storedFavorites = JSON.parse(localStorage.getItem("favorites"));
    if (storedFavorites.length > 0) {
    for (i=0; i<storedFavorites.length; i++) {
        displayFavorites(storedFavorites[i].name, storedFavorites[i].street, storedFavorites[i].city, 
            storedFavorites[i].Url)
    }
    }   
}

// New function
function displayFavorites(name, street, city, url) {
    var favDiv = $('<div>')
    var favUl = $('<ul>')
    var favName = $('<p>')
    var favUrl = $('<a>')
    var favLocation = $('<p>')

    favUrl.attr("href", url)
    favUrl.text(name)
    favName.append(favUrl)
    favLocation.text(street + ", " + city)
    
    favName.attr("style", "font-weight:bold;")

    favName.append(favUrl)
    favUl.append(favName, favLocation)
    favDiv.append(favUl)
    $('#favorite-box').append(favDiv)

}

// New function
function removeFavorites() {
    $('#favorite-box').children().remove()
}

// New Listener
$("#favorite-btn").click(function(event) {
    event.preventDefault();
    $(".modal").addClass("is-active"); 
    removeFavorites()
    renderFavorites()
  });
   
// New Listener
  $(".modal-close").click(function() {
     $(".modal").removeClass("is-active");
  });

init();