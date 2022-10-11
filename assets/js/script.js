// DEPENDENCIES
var formSearchEl = $(formSearch);
var cityNameEl = $(cityName);
var cityHistoryEl = $(cityHistory);
var currentForecastEl = $(currentForecast);
var fiveDayForecastEl = $(fiveDayForecast);

// FUNCTIONS


// USER INTERACTIONS
    // user enters city in form
        // city is required
    // user clicks on search button in form
        // fetch data from Weather API
            // if there is more than one match, display a dialog from which they must pick one
            // build Weather objects
            // save City in array and local storage
            // render City saved list
            // render Current Forecast section
            // render 5 day Forecast section


async function fetchApiGeoData(city, state = '', country = ''){
    let apiKey = '60d38292445dbe1a20b97c43b4fe3bd2';
    let apiObj = {};

    await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&${state}&${country}&appid=${apiKey}`)
        .then(response => response.json())
        .then(response => (apiObj = response))
        .catch(err => console.error(err));

    return apiObj;
}


async function fetchApiWeatherData(lat, lon){
    let apiKey = '60d38292445dbe1a20b97c43b4fe3bd2';
    let apiObj = {};


    await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`)
    .then(response => response.json())
    .then(response => (apiObj = response))
    .catch(err => console.error(err));

    return apiObj;
}


async function fetchApiForecastData(lat, lon){
    let apiKey = '60d38292445dbe1a20b97c43b4fe3bd2';
    let apiObj = {};

    await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`)
    .then(response => response.json())
    .then(response => (apiObj = response))
    .catch(err => console.error(err));
    
    return apiObj
}


function renderSavedCities(arrSearchHistory){
    $(cityHistory).empty();
    
    for (let i=0; i<arrSearchHistory.length; i++){
        let liEl = $('<li>').addClass('list-group-item p-0 pt-2');
        
        $(liEl).append('<button>')
            .addClass('btn btn-block custom-btn')
            .text(arrSearchHistory[i].city);
        
            // saved city button click handler
        $(liEl).on('click', 
            (event)=>{
                event.stopPropagation();
                (async function(){
                    let city = $(event.target).text();

                    let idx = arrSearchHistory.findIndex((el) => el.city.toUpperCase() === city.toUpperCase());

                    let apiObj = await fetchApiWeatherData(arrSearchHistory[idx].lat, arrSearchHistory[idx].lon);
                    
                    console.log(apiObj);  

                    renderCurrentForecast(apiObj);
                })(); 
            }        
        );
            
        $(cityHistory).append(liEl);
    }
}
    

function renderCurrentForecast(apiObj){
    $(currentForecast).empty();

    // console.log(dt);

    let spanEl = $('<span>').text(' ' + moment(Date(apiObj.dt)).format('(MM/DD/YYYY)'));
    let imgEl = $('<img>').attr('src',`http://openweathermap.org/img/wn/${apiObj.weather[0].icon}@2x.png`).addClass('p-0 pb-3');
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




var formSubmitHandler = function (event){
    event.preventDefault();

    let city = cityNameEl.val();

    let findIndex = arrSearchHistory.findIndex((el) => el.city.toUpperCase() === city.toUpperCase());
    let cityObj = {};

    if (findIndex === -1){
        (async function (){
            let apiObj = await fetchApiGeoData(city);

            if(apiObj.length > 1){
                // renderDialog();
                let x =1;
            } else {
                apiObj = {
                    city: apiObj[0].name,
                    state: apiObj[0].state,
                    country: apiObj[0].country,
                    lat: apiObj[0].lat,
                    lon: apiObj[0].lon
                }
            }
        
            console.log(apiObj); 

            arrSearchHistory.push(apiObj);
            localStorage.setItem('searchHistory', JSON.stringify(arrSearchHistory));
            renderSavedCities(arrSearchHistory);

            apiObj = await fetchApiWeatherData(apiObj.lat, apiObj.lon);

            console.log(apiObj);

            renderCurrentForecast(apiObj);
        })(); 
    }
        // renderCurrentForecast();
        // renderFiveDayForecast();
}



var arrSearchHistory =JSON.parse(localStorage.getItem('searchHistory'));            
if(arrSearchHistory) renderSavedCities(arrSearchHistory) 
else arrSearchHistory = [];

$(formSearch).on('submit', formSubmitHandler) ;          