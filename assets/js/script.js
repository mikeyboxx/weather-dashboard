async function fetchApiGeoData(city){
    let apiKey = '60d38292445dbe1a20b97c43b4fe3bd2';
    let apiObj = {};

    await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`)
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
                    $(foundMsg).text('');
                  
                    let city = $(event.target).text();
                    let idx = arrSearchHistory.findIndex((el) => el.city.toUpperCase() === city.toUpperCase());
                    
                    let apiObj = await fetchApiWeatherData(arrSearchHistory[idx].lat, arrSearchHistory[idx].lon);
                    renderCurrentForecast(apiObj);
                    
                    apiObj = await fetchApiForecastData(arrSearchHistory[idx].lat, arrSearchHistory[idx].lon);
                    renderFiveDayForecast(apiObj);
                    
                    $(cityName).val('');
                })(); 
            }        
        );
        $(cityHistory).append(liEl);
    }
}
    

function renderCurrentForecast(apiObj){
    $(currentForecast).empty();
    $(currentWeatherContainer).css('visibility', 'visible');

    let dt = Date(apiObj.dt).toLocaleString();

    let spanEl = $('<span>').text(' ' + moment(dt,'ddd mm YYYY').format('(MM/DD/YYYY)'));
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

function renderFiveDayForecast(apiObj){
    $(fiveDayWeatherContainer).css('visibility', 'visible');
    $(fiveDayForecast).empty();
    
    // filter only 3pm elements
    let arr = apiObj.list.filter((el)=> el.dt_txt.substr(11,5) === '15:00');
    apiObj.list = arr;

    for (let i = 0; i < arr.length; i++){
        let colEl = $('<div>').addClass('col pl-0');
        let cardEl = $('<div>').addClass('card');
        let cardBodyEl = $('<div>').addClass('card-body d-flex flex-column custom-card-body p-1');

        let h5El = $('<h5>').text(moment(apiObj.list[i].dt_txt, 'YYYY-MM-DD').format('MM/DD/YYYY'));
        $(cardBodyEl).append(h5El);

        let imgEl = $('<img>').attr('src',`http://openweathermap.org/img/wn/${apiObj.list[i].weather[0].icon}@2x.png`);
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

var formSubmitHandler = function (arrSearchHistory, event ){
    // console.log(arrSearchHistory);
    event.preventDefault();
    $(foundMsg).text('');

    let city = $(cityName).val();
    let findIndex = arrSearchHistory.findIndex((el) => el.city.toUpperCase() === city.toUpperCase());

    // if city not found in Search History then 
    if (findIndex === -1){
        (async function (){
            let apiObj = await fetchApiGeoData(city);
            
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

            arrSearchHistory.push(apiObj);
            localStorage.setItem('searchHistory', JSON.stringify(arrSearchHistory));
            renderSavedCities(arrSearchHistory);

            let apiObj2 = await fetchApiWeatherData(apiObj.lat, apiObj.lon);
            renderCurrentForecast(apiObj2);

            apiObj2 = await fetchApiForecastData(apiObj.lat, apiObj.lon);
            renderFiveDayForecast(apiObj2);

            $(cityName).val('');
        })(); 
    }
}


function start(){
    var arrSearchHistory =JSON.parse(localStorage.getItem('searchHistory'));            
    
    if (arrSearchHistory !== null) {
        renderSavedCities(arrSearchHistory)
    } else {
        arrSearchHistory = [];
    }
    
    $(currentWeatherContainer).css('visibility', 'hidden');
    $(fiveDayWeatherContainer).css('visibility', 'hidden');
    
    $(formSearch).on('submit', formSubmitHandler.bind(this, arrSearchHistory)) ;          
}

start();

