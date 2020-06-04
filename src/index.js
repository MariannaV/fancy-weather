import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './css/index.scss';
import {
  API_weather,
  API_geolocation,
  API_images,
  LS_API, API_speechRecogniniton
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
  createWeatherTodayBlock();
  createWeatherOfSomeDays();
  googleMapInit();
  createSearchForm();
  addCoordinates();
}

async function renderWithLanguage() {
  store.currentLocation = await API_geolocation.getLocationByCity({ city: store.currentLocation.city });
}

async function renderWithTemperature() {
  await API_weather.getWeather({ city: store.currentLocation.city });
  createWeatherTodayBlock();
  createWeatherOfSomeDays();
}

window.onload = async () => {
  document.querySelector('[name=currentLanguage]').value = store.currentLanguage;
  createDegreesButtons();
  changeBackgroundImage().then(changeBackgroundImage);
  createSearchForm();
  listenSearchForm();

  selectHandler();
  backgroundImageToggleButtonHandler();
  const { city } = await API_geolocation.getCurrentLocation();
  store.currentLocation = await API_geolocation.getLocationByCity({ city });
};

export const store = new Proxy({
  currentLanguage: 'en',
  get translate() {
    return translates[this.currentLanguage];
  },
  currentTemperatureUnits: 'celsius',
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
  const loader = document.querySelector('.toggle-background-image');
  const animationClass = 'with-animation';
  loader.classList.add(animationClass);
  element.style.setProperty('--prevImg', getComputedStyle(element).getPropertyValue('--currentImg').replace(/\\/g, ''));
  await API_images.getImageUrl();
  if (store.receivedImage) element.style.setProperty('--currentImg', `url(${store.receivedImage})`);
  loader.classList.remove(animationClass);
}

function backgroundImageToggleButtonHandler() {
  const backgroundImageToggleButton = document.querySelector('.toggle-background-image');
  backgroundImageToggleButton.addEventListener('click', changeBackgroundImage);
}


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
  const voiceSearchButton = () => document.querySelector('.voice-search');

  voiceSearchButton()?.removeEventListener('click', recognizeSpeechHandler);

  searchForm.innerHTML = '';
  searchForm.insertAdjacentHTML('beforeend',
    `
  <div class="search-wrapper">
    <input class="search-input" name="place" placeholder="${translate.searchFormData.searchInputPlaceholder}" autocomplete="off" autofocus="" required>
    <button type="button" class="voice-search"></button>
  </div>
  <button class="search-button" type="submit">${translate.searchFormData.buttonText}</button>
  <div class="search-error-block" ${errorId ? `data-test-id=${errorId}` : ''}>${errorId ? translate.searchFormData.errors[errorId] : ''}</div>
  `
  );


  voiceSearchButton().addEventListener('click', recognizeSpeechHandler);

  async function recognizeSpeechHandler() {
    searchForm.querySelector('.voice-search').classList.add('active');
    searchForm.querySelector('[name=place]').value = await API_speechRecogniniton.recognizeSpeech();
    searchForm.requestSubmit();
  }
}

function listenSearchForm() {
  const searchForm = document.getElementById('searchForm');
  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const searchInput = event.target.elements.place;
      store.currentLocation = await API_geolocation.getLocationByCity({ city: searchInput.value.trim() });
      removeErrorMessageBlock();
    } catch (error) {
      createErrorMessageBlock(error);
    }
  });
};


function createDegreesButtons() {
  const { currentTemperatureUnits } = store;
  const wrapper = document.querySelector('.toggle-temperature');
  const fieldName = 'temperature'
  wrapper.insertAdjacentHTML('beforeend',
    `
    <input type='radio' name=${fieldName} id='fahrenheit' data-degree='fahrenheit' ${currentTemperatureUnits === 'fahrenheit' ? 'checked' : ''}  />
    <label class='toggle-temperature-button' for='fahrenheit'>°F</label>
    <input type='radio' name=${fieldName} id='celsius' data-degree='celsius' ${currentTemperatureUnits === 'celsius' ? 'checked' : ''} />
    <label class='toggle-temperature-button' for='celsius'>°C</label>
   `);

  wrapper.querySelectorAll(`input[name=${fieldName}]`).forEach(input => {
    input.addEventListener('change', (event) => {
      store.currentTemperatureUnits = event.target.dataset.degree;
    })
  })

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

  function onKeyDownClose(event) {
    if (event.key === 'Escape') {
      errorMessageContainer.classList.remove('active');
      closePopup.removeEventListener('click', onClosePopup);
      document.body.removeEventListener('keydown', onKeyDownClose);
    }
  }

  function onClosePopup() {
    errorMessageContainer.classList.remove('active');
    closePopup.removeEventListener('click', onClosePopup);
    document.body.removeEventListener('keydown', onKeyDownClose);
  }
}



async function getMedia(constraints) {
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    showErrorMessage(error);
  }
}

