import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './css/index.scss';



window.onload = async () => {
  await API_geolocation.getLocation();
  createLocationBlock(API_geolocation.currentLocation);
  await API_weather.getWeather(API_geolocation.currentLocation);
  googleMapInit()
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
  locationWeather: {},
  async getWeather(params) {
    const { city, lang = 'eng' } = params;
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&lang=${lang}g&units=metric&APPID=${this.apikey}`);
      if (!response.ok) {
        throw Error('Something went wrong');
      }
      const result = await response.json();
      this.locationWeather = result;
      console.log(3, result, this.locationWeather);
    } catch (error) {
      alert(`error : ${error}`);
    }
  }

};


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