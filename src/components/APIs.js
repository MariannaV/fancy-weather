import { showErrorMessage, store } from '../index';


export const API_weather = {
  get apikey() {
    return '69608718e01c4ff1e36fa29958bb43b6';
  },
  async getWeather() {
    const { currentLanguage, translate, currentLocation, currentTemperatureUnits } = store;
    const { city, coordinates } = currentLocation;

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
      const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lng}&lang=${currentLanguage}&exclude=${'hourly,minutely'}&appid=${this.apikey}&units=${units[currentTemperatureUnits]}`);
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
        },
        get dayOfMonth() {
          return (new Date().toDateString('en-US', {
            timeZone: result.timezone
          })).toString().split(' ')[2];
        },
        get month() {
          return (new Date().toDateString('en-US', {
            timeZone: result.timezone
          })).toString().split(' ')[1].toLocaleLowerCase();
        }
      };


      // timeZone: result.timezone

      // if (!store.dataWeatherOfSomeDays.has(city))
      store.dataWeatherOfSomeDays.set(city, []);

      for (let i = 1; i < amountOfForecastDays && i < result.daily.length; i += 1) {
        const resultItem = result.daily[i];
        store.dataWeatherOfSomeDays.get(city).push({
          weather: resultItem.weather[0].description,
          degree: Math.round(((resultItem.temp.min + resultItem.temp.max) / 2)),
          dayOfWeek: new Date(resultItem.dt * 1000).toLocaleString('en-US', {
            timeZone: result.timezone,
            weekday: 'long'
          }).toLocaleLowerCase(),
          icon: resultItem.weather[0].icon
        });
      }
    } catch (error) {
      if (error.message === 'city not found') {
        const searchInput = document.querySelector('#searchForm .search-input');
        searchInput.value = '';
        searchInput.setAttribute('placeholder', 'Type correct data');
      } else {
        showErrorMessage(error);
      }
    }
  }

};

export const API_geolocation = {
  get apikey() {
    return 'a4afdd31e79510';
  },
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
      showErrorMessage(error);
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
        throw { errorField: 'incorrectData' };
      }

      const bestMatch = results[0];
      //building, road, village, neighbourhood, city, county, postcode, terminated_postcode, state_district, state, region, island, body_of_water, country, continent, ficticious, unknown
      return {
        city: bestMatch.components[bestMatch.components._type] ?? bestMatch.components.town,
        country: bestMatch.components.country,
        coordinates: bestMatch.geometry
      };
    } catch (error) {
      if (!('errorField' in error)) {
        showErrorMessage(error.message === 'bad query' ? 'bad query' : error);
      }
      throw error;
    }
  }
};

//
// export const API_map = {
//   get apikey() {
//     return 'pk.eyJ1IjoibWFyaWFubmF2IiwiYSI6ImNrYWJnM2prMTE2M3Myem10Ym1nNWxveHAifQ.E7kEmcUZEKnrYE-ts0u7xw';
//   }
// };

export const API_images = {
  get apikey() {
    return '_cXf5V9ZeOttjJE2clN9URiApDrCRiB8g2frf30AS-M';
  },
  async getImageUrl() {
    try {
      const response = await fetch(`https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=nature&client_id=${this.apikey}`);
      if (!response.ok) {
        throw Error('Something went wrong');
      }
      const result = await response.json();
      store.receivedImage = result.urls.regular.replace(/&w=\d+&/, `&w=${window.innerWidth}&`);
    } catch (error) {
      showErrorMessage(error);
    }
  }
};

export const LS_API = {
  fieldName: 'fancy-weather',
  get data() {
    return JSON.parse(localStorage.getItem(this.fieldName));
  },
  set data({ fieldName, value }) {
    const newLSValue = {
      ...this.data,
      [fieldName]: value
    };
    return localStorage.setItem(this.fieldName, JSON.stringify(newLSValue));
  }
};