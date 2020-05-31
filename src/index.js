import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './css/index.scss';
import {
  API_weather,
  API_geolocation,
  API_images,
  LS_API
} from './components/APIs';
import {
  createWeatherTodayBlock,
  createWeatherOfSomeDays
} from './components/weather-data';
import { translates } from './components/translates';
import { googleMapInit, addCoordinates } from './components/map';

async function render() {
  createLocationBlock();
  await API_weather.getWeather();
  createWeatherTodayBlock(); //если данные брать из стора: то не нужены параметры
  createWeatherOfSomeDays();
  googleMapInit();
  createSearchForm();
  // googleMapAPI.toggleLocation(currentLocation);
  addCoordinates();
  // changeBackgroundImage(API_images.receivedImage)
}

async function renderWithLanguage() {
  store.currentLocation = await API_geolocation.getLocationByCity({ city: store.currentLocation.city });
  // addCoordinates();
  // API_weather.getWeather()
  // createWeatherTodayBlock()
  // createWeatherOfSomeDays()
  // googleMapAPI.toggleChange()
}

async function renderWithTemperature() {
  await API_weather.getWeather({ city: store.currentLocation.city });
  createWeatherTodayBlock();
  createWeatherOfSomeDays();
}

window.onload = async () => {
  await createSearchForm();
  // changeBackgroundImage().then(changeBackgroundImage);
  listenSearchForm();
  selectHandler();
  backgroundImageToggleButtonHandler();
  const { city } = await API_geolocation.getCurrentLocation();
  store.currentLocation = await API_geolocation.getLocationByCity({ city });
  degreesToggleHandler();
  // createErrorMessageBlock()
};

export const store = new Proxy({
  currentLanguage: 'en',
  get translate() {
    return translates[this.currentLanguage];
  },
  currentTemperatureUnits: 'celsius', //'fahrenheit'
  currentLocation: { city: null, country: null, lat: null, lng: null },
  dataWeatherOfSomeDays: new Map(),
  dataWeatherToday: {},
  currentTimeAndDay: {},
  receivedImage: '',
  ...LS_API.data
}, {
  set: function(target, name, value) {
    target[name] = value;

    switch (name) {
      case 'currentLocation': {
        render();
        break;
      }
      case 'currentLanguage': {
        renderWithLanguage();
        break;
      }

      case 'currentTemperatureUnits': {
        renderWithTemperature();
        break;
      }
    }

    if (['currentLanguage', 'currentTemperatureUnits'].includes(name)) {
      LS_API.data = { fieldName: name, value };
    }

    return true;
  }
});

// const googleMapAPI = {
// get map() {
// if (nonExist) then init
//  return map
// },
// toggleLocation(params) {
// this.map.toggle(params)
//   }
// };

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

const units = {
  'celsius': 'metric',
  'fahrenheit': 'imperial'
};


function createErrorMessageBlock({ errorField }) {
  const { translate } = store;
  const searchForm = document.getElementById('searchForm');
  const errorBlock = searchForm.querySelector('.search-error-block');
  if (!errorBlock) {
    searchForm.insertAdjacentHTML('beforeend',
      `
      <div class="search-error-block"></div>
      `
    );
  }
  if (errorField) errorBlock.dataset.testId = errorField;
  console.log(errorBlock, errorField);
  errorBlock.innerHTML = '';
  errorBlock.insertAdjacentHTML('beforeend',
    `<p>${translate.searchFormData.errors[errorField]}</p>`
  );
};

function removeErrorMessageBlock() {
  const searchForm = document.getElementById('searchForm');
  const errorBlock = searchForm.querySelector('.search-error-block');
  errorBlock.remove();
}


function createLocationBlock() {
  const { city, country } = store.currentLocation;
  const location = document.querySelector('.header-block .location');
  location.innerHTML = '';
  location.insertAdjacentHTML('beforeend',
    `
    <p>${city.toUpperCase()}, </p>
    <p>${country.toUpperCase()}</p>
    `
  );
}

async function changeBackgroundImage() {
  const element = document.body;
  element.style.setProperty('--prevImg', getComputedStyle(element).getPropertyValue('--currentImg').replace(/\\/g, ''));
  await API_images.getImageUrl();
  element.style.setProperty('--currentImg', `url(${store.receivedImage})`);
}

function backgroundImageToggleButtonHandler() {
  const backgroundImageToggleButton = document.querySelector('.toggle-background-image');
  backgroundImageToggleButton.addEventListener('click', changeBackgroundImage);
}


function listenSearchForm() {
  const searchForm = document.getElementById('searchForm');
  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const searchInput = event.target.elements.place;
      store.currentLocation = await API_geolocation.getLocationByCity({ city: searchInput.value.trim() });
      removeErrorMessageBlock()
    } catch (error) {
      createErrorMessageBlock(error);
    }
  });
};


function selectHandler() {
  const select = document.querySelector('select.toggle-block');
  select.addEventListener('change', event => {
    store.currentLanguage = event.target.value;
  });
}


function createSearchForm() {
  const { translate } = store;
  const searchForm = document.getElementById('searchForm');
  const errorBlock = searchForm.querySelector('.search-error-block');
  const errorId = errorBlock?.dataset?.testId;
  searchForm.innerHTML = '';
  searchForm.insertAdjacentHTML('beforeend',
    `
  <div class="search-wrapper">
    <input class="search-input" name="place" placeholder="${translate.searchFormData.searchInputPlaceholder}" autocomplete="off" autofocus="">
  </div>
  <button class="search-button" type="submit">${translate.searchFormData.buttonText}</button>
  <div class="search-error-block" ${errorId ? `data-test-id=${errorId}`: ''}>${errorId ? translate.searchFormData.errors[errorId] : ''}</div>
  `
  );
}

function degreesToggleHandler() {
  const toggleTemperatureBlock = document.querySelector('.toggle-temperature');
  toggleTemperatureBlock.addEventListener('click', event => {
    store.currentTemperatureUnits = event.target.dataset.degree;
    // toggleTemperatureBlock.classList.contains('celsius')
    toggleTemperatureBlock.classList.remove('celsius', 'fahrenheit');
    toggleTemperatureBlock.classList.add(event.target.dataset.degree);
    console.log(event.target, event.currentTarget, store.currentTemperatureUnits);
  });
}


export function showErrorMessage(message) {
  const errorMessageContainer = document.querySelector('.errors-block');
  const errorBlock = errorMessageContainer.querySelector('.popup-text');
  const closePopup = errorMessageContainer.querySelector('.close-popup');

  document.body.addEventListener('keydown', onKeyDownClose);
  closePopup.addEventListener('click', onClosePopup);
  errorMessageContainer.classList.add('active');
  errorBlock.innerHTML = '';
  errorBlock.insertAdjacentHTML('afterbegin', message);
}