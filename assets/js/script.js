// fetch geo location data based on city entered
async function fetchApiGeoData(city){
    let apiKey = '60d38292445dbe1a20b97c43b4fe3bd2';
    let apiObj = {};

    await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`,
        {
        cache: 'reload'
        })
        .then(response => response.json())
        .then(response => (apiObj = response))
        .catch(err => console.error(err));

    return apiObj;
}

// fetch current weather data based on latitude and longitude passed
async function fetchApiWeatherData(lat, lon){
    let apiKey = '60d38292445dbe1a20b97c43b4fe3bd2';
    let apiObj = {};

    await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`)
    .then(response => response.json())
    .then(response => (apiObj = response))
    .catch(err => console.error(err));

    return apiObj;
}

// fetch 5 day forecast weather data based on latitude and longitude passed
async function fetchApiForecastData(lat, lon){
    let apiKey = '60d38292445dbe1a20b97c43b4fe3bd2';
    let apiObj = {};

    await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`)
    .then(response => response.json())
    .then(response => (apiObj = response))
    .catch(err => console.error(err));
    
    return apiObj
}

// render Saved Cities button list
function renderSavedCities(arrSearchHistory){
    $(cityHistory).empty();  // clear out contents of list
    
    for (let i=0; i<arrSearchHistory.length; i++){
        let btnEl = $('<button>').addClass('btn btn-block custom-btn').text(arrSearchHistory[i].city);
        let liEl = $('<li>').addClass('list-group-item p-0 pt-2');
        $(liEl).append(btnEl);
        
        // add event handler for Search history buttons
        $(liEl).on('click', (event)=>{
            event.stopPropagation();
            (async function(){
                $(foundMsg).text('');  // clear out city not found msg
                let city = $(event.target).text();
                
                // get the index of the search history array element that matched the input city
                let idx = arrSearchHistory.findIndex((el) => el.city.toUpperCase() === city.toUpperCase());
                
                // fetch current weather data for saved city
                let apiObj = await fetchApiWeatherData(arrSearchHistory[idx].lat, arrSearchHistory[idx].lon);
                renderCurrentForecast(apiObj);  
                
                // fetch 5 day forecast weather data for saved city
                apiObj = await fetchApiForecastData(arrSearchHistory[idx].lat, arrSearchHistory[idx].lon);
                renderFiveDayForecast(apiObj);
                
                $(cityName).val('');  // reset the input form field
            })(); 
        });
        $(cityHistory).append(liEl);  // append generated list item with button to the list
    }
}
    
// render the current forecast section
function renderCurrentForecast(apiObj){
    $(currentForecast).empty();  // clear out the HTML content
    $(currentWeatherContainer).css('visibility', 'visible');  // make container visible

    let dt = Date(apiObj.dt).toLocaleString();  // convert date to ISO string

    let spanEl = $('<span>').text(' ' + moment(dt,'ddd mm YYYY').format('(MM/DD/YYYY)'));  // format the date
    let imgEl = $('<img>').attr('src',`https://openweathermap.org/img/wn/${apiObj.weather[0].icon}@2x.png`).addClass('p-0 pb-3');
    $(spanEl).append(imgEl);
    
    let h3El = $('<h3>').text(apiObj.name).addClass('m-0 p-0')
    $(h3El).append(spanEl);
    $(currentForecast).append(h3El);

    let pEl = $('<p>').text('Temp: ');
    spanEl = $('<span>').text(apiObj.main.temp + '°F');
    $(pEl).append(spanEl);
    $(currentForecast).append(pEl);

    pEl = $('<p>').text('Wind: ');
    spanEl = $('<span>').text(apiObj.wind.speed + ' MPH');
    $(pEl).append(spanEl);
    $(currentForecast).append(pEl);

    pEl = $('<p>').text('Humidity: ');
    spanEl = $('<span>').text(apiObj.main.humidity + '%');
    $(pEl).append(spanEl);
    $(currentForecast).append(pEl);
}

// render the 5-day forecast section
function renderFiveDayForecast(apiObj){
    $(fiveDayForecast).empty();   // clear out the HTML content
    $(fiveDayWeatherContainer).css('visibility', 'visible');  // make container visible
    
    let arr = apiObj.list.filter((el)=> el.dt_txt.substr(11,5) === '15:00');   // filter only 3pm elements
    apiObj.list = arr;  // replace list array with filtered array

    // for every day in the forecast generate a column, card, and card body
    for (let i = 0; i < arr.length; i++){
        let colEl = $('<div>').addClass('col pl-0');
        let cardEl = $('<div>').addClass('card');
        let cardBodyEl = $('<div>').addClass('card-body d-flex flex-column custom-card-body p-1');

        let h5El = $('<h5>').text(moment(apiObj.list[i].dt_txt, 'YYYY-MM-DD').format('MM/DD/YYYY')); // format timestamp
        $(cardBodyEl).append(h5El);

        let imgEl = $('<img>').attr('src',`https://openweathermap.org/img/wn/${apiObj.list[i].weather[0].icon}@2x.png`);
        $(cardBodyEl).append(imgEl);

        let pEl = $('<p>').text('Temp: ' + Math.ceil(apiObj.list[i].main.temp) + '°F');
        $(cardBodyEl).append(pEl);

        pEl = $('<p>').text('Wind: ' + apiObj.list[i].wind.speed + ' MPH');
        $(cardBodyEl).append(pEl);

        pEl = $('<p>').text('Humidity: ' + apiObj.list[i].main.humidity + '%');
        $(cardBodyEl).append(pEl);

        $(cardEl).append(cardBodyEl);
        $(colEl).append(cardEl);
        $(fiveDayForecast).append(colEl);
    }
}

// Search button handler that checks to see if city exists. If so, then get forecast and save
var formSubmitHandler = function (arrSearchHistory, event ){
    event.preventDefault();
    $(foundMsg).text('');   // clear out the not found msg
    let cityInput = $(cityName).val();  // capture the input city fields

    // find the index of the inputted city in the Search History array
    let findIndex = arrSearchHistory.findIndex((el) => el.city.toUpperCase() === cityInput.toUpperCase());

    // if city not found in Search History then get Geo data, store in object, and push to Search history array
    if (findIndex === -1){
        (async function (){
            let apiObj = await fetchApiGeoData(cityInput);  // fetch Geo data for a city
            // if city not found, return
            if (apiObj.length===0) {
                $(foundMsg).text('City not found!');   
                return;
            }
            // slim down the Geo object and always take the first matched element in case of duplicate cities
            apiObj = {
                city: apiObj[0].name,
                state: apiObj[0].state,
                country: apiObj[0].country,
                lat: apiObj[0].lat,
                lon: apiObj[0].lon
            }
            // save Search history
            arrSearchHistory.push(apiObj);  
            localStorage.setItem('searchHistory', JSON.stringify(arrSearchHistory));
            renderSavedCities(arrSearchHistory);
            
            // fetch current weather data for new city entered
            let apiObj2 = await fetchApiWeatherData(apiObj.lat, apiObj.lon);
            renderCurrentForecast(apiObj2);
            
            // fetch 5 day forecast weather data for new city enetered
            apiObj2 = await fetchApiForecastData(apiObj.lat, apiObj.lon);
            renderFiveDayForecast(apiObj2);

            $(cityName).val('');  // reset the form input field
        })(); 
    }
}

// function that does all the work. Search history array, which holds state, is bound to the formSubmitHandler function
function start(){
    // check of Search history array is in local storage. If not initialize to empty array
    var arrSearchHistory =JSON.parse(localStorage.getItem('searchHistory'));            
    if (arrSearchHistory !== null) {
        renderSavedCities(arrSearchHistory)
    } else {
        arrSearchHistory = [];
    }
    // hide the weather forecast sections
    $(currentWeatherContainer).css('visibility', 'hidden');
    $(fiveDayWeatherContainer).css('visibility', 'hidden');
    
    // bind the Seacrh History array as 1st param to handler 
    $(formSearch).on('submit', formSubmitHandler.bind(this, arrSearchHistory)) ;       
}


start();