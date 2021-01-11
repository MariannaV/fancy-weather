import { store } from '../index';

export function createWeatherTodayBlock() {
  clearInterval(createDate);
  const { weather, degree, feelsLike, wind, humidity, icon } = store.dataWeatherToday; //store.dataWeatherToday
  const weatherTodayBlock = document.querySelector('.about-weather .weather-today-block');
  weatherTodayBlock.innerHTML = '';
  weatherTodayBlock.insertAdjacentHTML(
    'beforeend',
    `
    <div class="degree-value">${degree}°</div>
    <div class="additional-information">
       <img src="http://openweathermap.org/img/wn/${icon}@2x.png"/>
      <p>${weather}</p>
      <p>${store.translate.weather.feelsLike}: ${feelsLike}°</p>
      <p>${store.translate.weather.wind}: ${wind} m/s</p>
      <p>${store.translate.weather.humidity}: ${humidity}%</p>
    </div>
    `
  );
  setInterval(createDate, 1000);
}

export function createWeatherOfSomeDays() {
  const { dataWeatherOfSomeDays, translate } = store;
  const dataOfWeatherForCity = dataWeatherOfSomeDays.get(store.currentLocation.city);
  const forecastBlock = document.querySelector('.about-weather .forecast-of-some-days');
  forecastBlock.innerHTML = '';
  dataOfWeatherForCity.forEach((dataOfWeatherDay) => {
    forecastBlock.insertAdjacentHTML(
      'beforeend',
      `
    <div class="weather-of-day">
        <p class="title">${translate.daysOfWeek[dataOfWeatherDay.dayOfWeek].full}</p>
        <p>${dataOfWeatherDay.degree}°</p>
        <img src="http://openweathermap.org/img/wn/${dataOfWeatherDay.icon}@2x.png"/>
    </div>
    `
    );
  });
}

function createDate() {
  const { translate } = store;
  const { todayDate, timeNow, dayOfMonth, month } = store.currentTimeAndDay;
  const dateBlock = document.querySelector('.header-block .date');
  dateBlock.innerHTML = '';
  dateBlock.insertAdjacentHTML(
    'beforeend',
    `
    <p>${todayDate.short},</p>
    <p>${dayOfMonth} ${translate.months[month]}</p>
    <p>${timeNow}</p>
    `
  );
}
