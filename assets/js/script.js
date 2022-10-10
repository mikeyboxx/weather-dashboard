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

async function fetchApiData(city, state = '', country = ''){
    let apiKey = '60d38292445dbe1a20b97c43b4fe3bd2';
    let apiObj = {};

    await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&${state}&${country}&appid=${apiKey}`)
            .then(response => response.json())
            .then(response => (apiObj = response))
            .catch(err => console.error(err));

    console.log(apiObj);        
    return apiObj
}


function saveApiData(searchObj){
    let findIndex = arrSearchHistory.findIndex(
        (el) => el.name === searchObj.name &&
                el.state === searchObj.state &&
                el.country === searchObj.country);

    if (findIndex === -1) {
        arrSearchHistory.push(searchObj);
        localStorage.setItem('searchHistory', JSON.stringify(arrSearchHistory));
    }
}


function renderSavedCities(){
    $(cityHistory).empty();
    
    for (let i=0; i<arrSearchHistory.length; i++){
        let liEl = $('<li>').addClass('list-group-item p-0 pt-2');
        
        $(liEl).append('<button>')
            .addClass('btn btn-block custom-btn')
            .text(arrSearchHistory[i].name);

        $(liEl).on('click', 
            (event)=>{
                event.stopPropagation();
                (async function(){
                    fetchApiData($(event.target).text());
                })(); 
            }        
        );
            
        $(cityHistory).append(liEl);
    }
}
    
    

var formSubmitHandler = function (event){
    event.preventDefault();

    let city = cityNameEl.val();

    (async function (){
        let apiObj = await fetchApiData(city);
        // console.log(apiObj);  
        saveApiData(apiObj[0]);
        renderSavedCities();
        // renderCurrentForecast();
        // renderFiveDayForecast();
    })(); 

}



var arrSearchHistory =JSON.parse(localStorage.getItem('searchHistory'));            
if(arrSearchHistory) renderSavedCities();

$(formSearch).on('submit', formSubmitHandler) ;           