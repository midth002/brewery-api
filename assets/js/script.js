var brewData = $(".brewData")
var searchCity = $(".input")
var searchButton = $("#city-button")
var weatherData = $(".weatherData")
var weatherContainer = $(".weatherContainer")
var forecastData = $('.forecastData')
var locationButton = $("#location-button")

var checkboxes = $('input[type=checkbox')

var apiKey = "385e58697effddc1169cee4d7d6e5489"
var perPage = "4"

var favoriteArray ;
var storedFavorites
var duplicateFavorite = false;

var favoriteLabel = $("<label class='checkbox'>")
var favoriteInput = $("<input type='checkbox' class='favorite'>")

var websiteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="blue" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
<path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
</svg>`; 

var directionsIcon = `<svg xmlns="http://www.w3.org/2000/svg"  width="20" height="20"  fill="green" viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path d="M502.61 233.32L278.68 9.39c-12.52-12.52-32.83-12.52-45.36 0L9.39 233.32c-12.52 12.53-12.52 32.83 0 45.36l223.93 223.93c12.52 12.53 32.83 12.53 45.36 0l223.93-223.93c12.52-12.53 12.52-32.83 0-45.36zm-100.98 12.56l-84.21 77.73c-5.12 4.73-13.43 1.1-13.43-5.88V264h-96v64c0 4.42-3.58 8-8 8h-32c-4.42 0-8-3.58-8-8v-80c0-17.67 14.33-32 32-32h112v-53.73c0-6.97 8.3-10.61 13.43-5.88l84.21 77.73c3.43 3.17 3.43 8.59 0 11.76z"/></svg>`

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
                
        var brewDiv = $('<div>').addClass("brewCard column box");
        var headingDiv = $('<div>').addClass("brewHeading")
        var brewName = $("<h3>").addClass("brewName");
        var favoriteLabel = $("<label class='checkbox'>")
        var favoriteInput = $("<input type='checkbox' class='favorite'>")
        var directionsLink = $("<a>")
       
        var ul = $('<ul>');
        var li1 = $('<li>');
        
        var li3 = $('<li class="brew-city">');
        var li5 = $('<li class="brew-list-link">'); 
        var brewLink = $('<a class="brew-link">');
        brewLink.attr("href" , data[i].website_url);
        
        brewLink.append(websiteIcon);
        directionsLink.append(directionsIcon)

        brewName.text(data[i].name);
        favoriteLabel.text("Favorites ")
        li1.text(data[i].brewery_type);
        li3.text(data[i].city + " " + data[i].state);
        
        
        
        //ul.children().attr("style", "position: center")

        favoriteLabel.append(favoriteInput);
        li5.append(brewLink, directionsLink);
        ul.append(li1, li3, li5);
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
              

                 // Current weather element created
                 var currentDiv = $('<div>').addClass("weatherCard");
                 var weatherTitle = $('<h4>')
                 var iconSpan = $('<span>')
                 var currentWeatherIcon = $('<i>')
                
               
                 
                 currentWeatherIcon.html("<img src='https://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png' alt='Icon depicting current weather.'>");
                 
                currentWeatherIcon.attr("style", "margin-top: 12px;")
                 currentDiv.attr("style", "background-color: white;")
                 iconSpan.attr("style", "margin-left: 5px;")

                // Append elements to the weathercontainer
                iconSpan.append(currentWeatherIcon);
                weatherTitle.append(iconSpan)
               
                currentDiv.append(weatherTitle)
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