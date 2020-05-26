import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './css/index.scss';


window.onload = async () => {
  backgroundImageToggleButtonHandler();
  await API_geolocation.getLocation();
  createLocationBlock(API_geolocation.currentLocation);
  await API_weather.getWeather(API_geolocation.currentLocation);
  await createWeatherTodayBlock(API_weather.dataWeather);
  googleMapInit(API_geolocation.coordinates);
  addCoordinates(API_geolocation.coordinates);
  // await API_images.getImageUrl();
  changeBackgroundImage(API_images.receivedImage)
};


function googleMapInit(coordinates) {
  const googleToken = 'AIzaSyAtMzLExZ-4fG_3BBaeIgPStExfwLxwerw';
  const language = 'ru';
  const googleMapScript = document.createElement('script');
  //generate params
  googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${googleToken}&callback=${googleMapInit.name}&language=${language}`;
  googleMapScript.defer = true;

  globalThis[googleMapInit.name] = googleMapInit;

  document.head.appendChild(googleMapScript);

  function googleMapInit() {
    const { lat, lng } = coordinates;
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


function addCoordinates(coordinates){
  const { lat, lng } = coordinates;
  document.querySelector('.map-section .coordinates').insertAdjacentHTML(
    'beforeend',
    `<p>Latitude: ${lat.toFixed(2)}°</p>
          <p>Longitude: ${lng.toFixed(2)}°</p>
         `
  );
}

export const API_geolocation = {
  get apikey() {
    return 'a4afdd31e79510';
  },
  coordinates: {},
  currentLocation: {},
  async getLocation(params = {}) {
    try {
      const response = await fetch(`https://ipinfo.io/json?token=${this.apikey}`);
      if (!response.ok) {
        throw Error('Something went wrong');
      }
      const result = await response.json();
      this.currentLocation = result;
      const locationCoordinatesArray = result.loc.split(',');
      this.coordinates = {
        lat: Number(locationCoordinatesArray[0]),
        lng: Number(locationCoordinatesArray[1])
      }
    } catch (error) {
      alert(`error : ${error}`);
    }
  }


};

function createLocationBlock(locationData) {
  const { city, country } = locationData;
  console.log(2, API_geolocation.currentLocation);
  const location = document.querySelector('.header-block .location');
  location.innerHTML = '';
  location.insertAdjacentHTML('beforeend',
    `
    <p>${city}</p>
    <p>${country}</p>
    `
  );
}


const API_weather = {
  get apikey() {
    return '69608718e01c4ff1e36fa29958bb43b6';
  },

  dataWeather: [],
  async getWeather(params) {
    const { city, lang = 'eng' } = params;
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&lang=${lang}g&units=metric&APPID=${this.apikey}`);
      if (!response.ok) {
        throw Error('Something went wrong');
      }
      const result = await response.json();

      for (let i = 0; i<4 && i < result.list.length; i+=1){
        const resultItem = result.list[i];
        this.dataWeather.push({ degree : Math.round(resultItem.main.temp), feelsLike : Math.round(resultItem.main.feels_like), wind : resultItem.wind.speed, humidity: resultItem.main.humidity});
      }

      console.log(3, result, this.dataWeather, 'list', result.list);
    } catch (error) {
      alert(`error : ${error}`);
    }
  }

};
function createDate() {
  const date = new Date();

  const days = ['Воскресенье', 'Понедельник', 'Вторник',
    'Среда', 'Четверг', 'Пятница', 'Суббота'];

  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  let timeNow = `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}, ${date.toLocaleTimeString('en-US', { hour12: false })}`;

  const dateBlock = document.querySelector('.header-block .date');
  dateBlock.innerHTML = '';
  dateBlock.innerHTML = timeNow;

}

setInterval(createDate, 1000);

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
    return '_cXf5V9ZeOttjJE2clN9URiApDrCRiB8g2frf30AS-M'
  },
  receivedImage: '',
  async getImageUrl() {

    try {
      const response = await fetch(`https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=nature&client_id=${this.apikey}`);
      if (!response.ok) {
        throw Error('Something went wrong');
      }
      const result = await response.json();
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
  document.body.setAttribute("style", `background-image: url(' ${url}');`);
  console.log('url2', url);
}

function backgroundImageToggleButtonHandler() {
  const  backgroundImageToggleButton = document.querySelector('.toggle-background-image');
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

function createWeatherTodayBlock(dataWeather) {
  console.log('DW',dataWeather);
  const dataWeatherToday = dataWeather[0];
  const {degree, feelsLike, wind, humidity} = dataWeatherToday;
  const weatherTodayBlock = document.querySelector('.about-weather .weather-today-block');
  weatherTodayBlock.innerHTML = '';
  weatherTodayBlock.insertAdjacentHTML('beforeend',
    `
    <div class="degree-value">${degree}</div>
    <div class="additional-information">
      <!--<p>overcast</p>-->
      <p>feels like: ${feelsLike}°</p>
      <p>wind: ${wind} m/s</p>
      <p>humidity: ${humidity}%</p>
    </div>
    `)
}