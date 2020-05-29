import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './css/index.scss';

async function render(currentLocation) {
  createLocationBlock(currentLocation);
  await API_weather.getWeather(currentLocation);
  createWeatherTodayBlock(store.dataWeatherToday); //если данные брать из стора: то не нужены параметры
  createWeatherOfSomeDays();
  googleMapInit(currentLocation);
  // googleMapAPI.toggleLocation(currentLocation);
  addCoordinates();
  // changeBackgroundImage(API_images.receivedImage)
}

function renderWithLanguage() {
  addCoordinates();
  // createWeatherTodayBlock()
  // createWeatherOfSomeDays()
  // googleMapAPI.toggleChange()
}

window.onload = async () => {
  listenSearchForm();
  backgroundImageToggleButtonHandler();
  const { city } = await API_geolocation.getCurrentLocation();
  store.currentLocation = await API_geolocation.getLocationByCity({ city });
  // render(currentLocation);
};

const store = new Proxy({
  currentLanguage: 'ru',
  get translate() {
    return translates[this.currentLanguage];
  },
  currentTemperatureUnits: 'celsius', //'fahrenheit'
  currentLocation: { city: null, country: null, lat: null, lng: null },
  currentCity: null,
  dataWeatherOfSomeDays: new Map(),
  dataWeatherToday: {},
  currentTimeAndDay: {},
  receivedImage: ''

}, {
  set: function(target, name, value) {
    target[name] = value;

    switch (name) {
      case 'currentLocation': {
        render(value);
        break;
      }
      case 'currentLanguage': {
        console.log('need to change language');
        // render(value);
        renderWithLanguage(value);
        break;
      }

      case 'currentTemperatureUnits': {
        console.log('need to change temperature');
        // renderWithTemperature(value)
        break;
      }
    }

    return true;
  }
});

const googleMapAPI = {
  get map() {
    // if (nonExist) then init
    //  return map
  },
  toggleLocation(params) {
    // this.map.toggle(params)
  }
};

//TODO: must to call only first time, then we need to toggle cords and marker in google.maps
function googleMapInit({ coordinates }) {
  const mapId = 'googleMapScript';
  const isMapExist = document.getElementById(mapId);
  if (!isMapExist) {
    const googleToken = 'AIzaSyAtMzLExZ-4fG_3BBaeIgPStExfwLxwerw';
    const language = store.currentLanguage;
    const googleMapScript = document.createElement('script');
    //TODO: need to generate params
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${googleToken}&callback=${googleMapInit.name}&language=${language}`;
    googleMapScript.defer = true;
    googleMapScript.id = mapId;
    globalThis[googleMapInit.name] = googleMapInit;
    document.head.appendChild(googleMapScript);
  } else {
    googleMapInit()
    // map.toggle(coords)
  }

  function googleMapInit() {
    const { lat, lng } = coordinates;
    //need call this map
    const map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat,
        lng
      },
      zoom: 10
    });

    const marker = new google.maps.Marker({
      position: {
        lat,
        lng
      }, map: map
    });
  };
}


function addCoordinates({ coordinates }) {
  const { lat, lng } = coordinates;
  const coordinatesBlock = document.querySelector('.map-section .coordinates');
  coordinatesBlock.innerHTML = '';
  coordinatesBlock.insertAdjacentHTML(
    'beforeend',
    `<p>${store.translate.latitude}: ${lat.toFixed(2)}°</p>
          <p>${store.translate.longitude}: ${lng.toFixed(2)}°</p>
         `
  );
}

export const API_geolocation = {
  get apikey() {
    return 'a4afdd31e79510';
  },
  // currentLocation: {},
  async getCurrentLocation() {
    try {
      const response = await fetch(`https://ipinfo.io/json?token=${this.apikey}`);
      if (!response.ok) {
        throw Error('Something went wrong');
      }
      const result = await response.json();

      const locationCoordinatesArray = result.loc.split(',');
      return {
        ...result,
        coordinates: {
          lat: Number(locationCoordinatesArray[0]),
          lng: Number(locationCoordinatesArray[1])
        }
      };
    } catch (error) {
      alert(`error : ${error}`);
    }
  },
  async getLocationByCity({ city }) {
    const token = '3c0960e747d4430daf05b9de5716302a';
    const language = store.currentLanguage;
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${token}&language=${language}&pretty=1&no_annotations=1&limit=1&min_confidence=1&no_dedupe=1`);
      // https://api.opencagedata.com/geocode/v1/json?q=moscw&key=dfcea8096a95496ba653f501109c66bf&pretty=1&no_annotations=1&language=ru
      if (!response.ok) {
        throw Error('Something went wrong');
      }
      const { results } = await response.json();
      if (!results.length) {
        throw Error('No match');
      }

      const bestMatch = results[0];
      //building, road, village, neighbourhood, city, county, postcode, terminated_postcode, state_district, state, region, island, body_of_water, country, continent, ficticious, unknown
      return {
        city: bestMatch.components[bestMatch.components._type] ?? bestMatch.components.town,
        country: bestMatch.components.country,
        coordinates: bestMatch.geometry
      };
    } catch (error) {
      alert(error.message === 'bad query' ? 'ERROR' : error);
      throw new Error(error);
    }
  }
};

function createLocationBlock(locationData) {
  const { city, country } = locationData;
  // console.log(2, API_geolocation.currentLocation);
  const location = document.querySelector('.header-block .location');
  location.innerHTML = '';
  location.insertAdjacentHTML('beforeend',
    `
    <p>${city},</p>
    <p>${country}</p>
    `
  );
}


const API_weather = {
  get apikey() {
    return '69608718e01c4ff1e36fa29958bb43b6';
  },
  async getWeather(params) {
    const { currentLanguage, translate } = store;
    const { city, coordinates } = params;

    try {
      store.currentCity = city;
      const amountOfForecastDays = 4;
      const hasAllDataAlready = store.dataWeatherOfSomeDays.get(city)?.length >= amountOfForecastDays;
      if (hasAllDataAlready) return;
      const units = {
        'celsius': 'metric',
        'fahrenheit': 'imperial'
      };
      //TODO: use first API
      //correct time, (new Date(result.current.dt).toLocaleString("en-US", {timeZone: result.timezone, weekday: 'long' })
      const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lng}&lang=${currentLanguage}&exclude=${'hourly,minutely'}&appid=${this.apikey}&units=${units.celsius}`);
    if (!response.ok) {
        throw Error('Something went wrong');
      }
      const result = await response.json();
       const resultforToday = result.current;
      store.dataWeatherToday = {
        degree: Math.round(resultforToday.temp),
        feelsLike: Math.round(resultforToday.feels_like),
        weather: resultforToday.weather[0].description,
        humidity: resultforToday.humidity,
        wind: resultforToday.wind_speed,
        icon: resultforToday.weather[0].icon
      };
      store.currentTimeAndDay = {
        get todayDate() {
          const day = (new Date().toLocaleString('en-US', {
            timeZone: result.timezone,
            weekday: 'long'
          })).toLocaleLowerCase();
          return store.translate.daysOfWeek[day];
           },
        get timeNow() {
          return new Date().toLocaleTimeString('en-US', {
            timeZone: result.timezone,
            hour12: false
          });
        }
        // timeZone: result.timezone
      };
      if (!store.dataWeatherOfSomeDays.has(city)) store.dataWeatherOfSomeDays.set(city, []);

      for (let i = 1; i < amountOfForecastDays && i < result.daily.length; i += 1) {
        const resultItem = result.daily[i];
        store.dataWeatherOfSomeDays.get(city).push({
          weather: resultItem.weather[0].description,
          degree: Math.round(((resultItem.temp.min + resultItem.temp.max) / 2)),
          dayOfWeek: new Date(resultItem.dt * 1000).toLocaleString('en-US', {
            timeZone: result.timezone,
            weekday: 'long',
          }),
          icon: resultItem.weather[0].icon,
        });
      }
    } catch (error) {
      if (error.message === 'city not found') {
        const searchInput = document.querySelector('#searchForm .search-input');
        searchInput.value = '';
        searchInput.setAttribute('placeholder', 'Type correct data');
      } else {
        alert(`error : ${error}`);
      }
    }
  }

};

function createDate() {
  const { todayDate, timeNow } = store.currentTimeAndDay;

  // let timeNow = `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}, ${date.toLocaleTimeString('en-US', { hour12: false })}`;

  const dateBlock = document.querySelector('.header-block .date');
  dateBlock.innerHTML = '';
  dateBlock.insertAdjacentHTML('beforeend',
    `
    <p>${todayDate}</p>
    <p>${timeNow}</p>
    `
  );

}

const API_map = {
  get apikey() {
    return 'pk.eyJ1IjoibWFyaWFubmF2IiwiYSI6ImNrYWJnM2prMTE2M3Myem10Ym1nNWxveHAifQ.E7kEmcUZEKnrYE-ts0u7xw';
  }
};


function calcFahrenheitDegrees(celsiusDegree) {
  console.log('cels', celsiusDegree);
  const fahrenheitDegreesNull = 32;
  const number = 1.8;
  let fahrenheitDegrees = 0;
  fahrenheitDegrees = celsiusDegree * number + fahrenheitDegreesNull;
  console.log('far', fahrenheitDegrees);
  return fahrenheitDegrees;
}


const API_images = {
  get apikey() {
    return '_cXf5V9ZeOttjJE2clN9URiApDrCRiB8g2frf30AS-M';
  },
  receivedImage: '', //!
  async getImageUrl() {

    try {
      const response = await fetch(`https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=nature&client_id=${this.apikey}`);
      if (!response.ok) {
        throw Error('Something went wrong');
      }
      const result = await response.json();
      //store.receivedImage =
      this.receivedImage = result.urls.raw;
      console.log('url', result, this.receivedImage);
    } catch (error) {
      alert(`error : ${error}`);
    }
  }
};


async function changeBackgroundImage() {
  await API_images.getImageUrl();
  const url = API_images.receivedImage;
  document.body.setAttribute('style', `background-image:  linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)), url(' ${url}');`);
  console.log('url2', url);
}

function backgroundImageToggleButtonHandler() {
  const backgroundImageToggleButton = document.querySelector('.toggle-background-image');
  backgroundImageToggleButton.addEventListener('click', changeBackgroundImage);
}


function changeDegreesValue() {
  const tempetatureBlock = document.querySelector('.degree-value');
  const temperatureValue = tempetatureBlock.innerText;
  tempetatureBlock.innerHTML = '';
  tempetatureBlock.innerText = `${calcFahrenheitDegrees(temperatureValue)}`;
}

function degreesHandler() {
  const temperatureToggleBlock = document.querySelector('.control-block .toggle-temperature');
  temperatureToggleBlock.addEventListener('click', changeDegreesValue);
}

degreesHandler();

function createWeatherTodayBlock(dataWeatherToday) {
  clearInterval(createDate);
  const { weather, degree, feelsLike, wind, humidity, icon } = dataWeatherToday;  //store.dataWeatherToday
  console.log('xx',dataWeatherToday);
  const weatherTodayBlock = document.querySelector('.about-weather .weather-today-block');
  weatherTodayBlock.innerHTML = '';
  weatherTodayBlock.insertAdjacentHTML('beforeend',
    `
    <div class="degree-value">${degree}</div>
    <div class="additional-information">
       <img src="http://openweathermap.org/img/wn/${icon}@2x.png"/>
      <p>${weather}</p>
      <p>feels like: ${feelsLike}°</p>
      <p>wind: ${wind} m/s</p>
      <p>humidity: ${humidity}%</p>
    </div>
    `);
  setInterval(createDate, 1000);
}

function createWeatherOfSomeDays() {
  const { dataWeatherOfSomeDays,  translate } = store;
  const dataOfWeatherForCity = dataWeatherOfSomeDays.get(store.currentLocation.city);
  const { degree, weather, dayOfWeek, icon } = dataOfWeatherForCity;
  const forecastBlock = document.querySelector('.about-weather .forecast-of-some-days');
  forecastBlock.innerHTML = '';
  dataOfWeatherForCity.forEach(dataOfWeatherDay => {
    forecastBlock.insertAdjacentHTML('beforeend',
      `
    <div class="weather-of-day">
        <p>${dataOfWeatherDay.dayOfWeek}</p>
        <p>${dataOfWeatherDay.degree}°</p>
        <img src="http://openweathermap.org/img/wn/${dataOfWeatherDay.icon}@2x.png"/>
    </div>
    `
    );
  });
};


function listenSearchForm() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = searchForm.querySelector('.search-input');
  searchForm.addEventListener('submit', async (button) => {
    button.preventDefault();
    store.currentLocation = await API_geolocation.getLocationByCity({ city: searchInput.value.trim() });
  });
};