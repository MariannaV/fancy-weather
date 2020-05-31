import { store } from '../index';


export function createWeatherTodayBlock() {
  clearInterval(createDate);
  const { weather, degree, feelsLike, wind, humidity, icon } = store.dataWeatherToday;  //store.dataWeatherToday
  console.log('xx',store.translate);
  const weatherTodayBlock = document.querySelector('.about-weather .weather-today-block');
  weatherTodayBlock.innerHTML = '';
  weatherTodayBlock.insertAdjacentHTML('beforeend',
    `
    <div class="degree-value">${degree}°</div>
    <div class="additional-information">
       <img src="http://openweathermap.org/img/wn/${icon}@2x.png"/>
      <p>${weather}</p>
      <p>${store.translate.weather.feelsLike}: ${feelsLike}°</p>
      <p>${store.translate.weather.wind}: ${wind} m/s</p>
      <p>${store.translate.weather.humidity}: ${humidity}%</p>
    </div>
    `);
  setInterval(createDate, 1000);
};

export function createWeatherOfSomeDays() {
  const { dataWeatherOfSomeDays,  translate } = store;
  // const {daysOfWeek} = store.currentTimeAndDay;
  const dataOfWeatherForCity = dataWeatherOfSomeDays.get(store.currentLocation.city);
  // const { degree, weather, dayOfWeek, icon } = dataOfWeatherForCity;
  const forecastBlock = document.querySelector('.about-weather .forecast-of-some-days');
  forecastBlock.innerHTML = '';
  console.log('123', dataOfWeatherForCity, translate)
  dataOfWeatherForCity.forEach(dataOfWeatherDay => {
    forecastBlock.insertAdjacentHTML('beforeend',
      `
    <div class="weather-of-day">
        <p>${translate.daysOfWeek[dataOfWeatherDay.dayOfWeek].full}</p>
        <p>${dataOfWeatherDay.degree}°</p>
        <img src="http://openweathermap.org/img/wn/${dataOfWeatherDay.icon}@2x.png"/>
    </div>
    `
    );
  });
  //  <p>${dataOfWeatherDay.translate.dayOfWeek}</p>
};

function createDate() {
  const {translate} = store;
  const { todayDate, timeNow, dayOfMonth, month } = store.currentTimeAndDay;
  // let timeNow = `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}, ${date.toLocaleTimeString('en-US', { hour12: false })}`;

  const dateBlock = document.querySelector('.header-block .date');
  dateBlock.innerHTML = '';
  dateBlock.insertAdjacentHTML('beforeend',
    `
    <p>${todayDate.short},</p>
    <p>${dayOfMonth} ${translate.months[month]}</p>
    <p>${timeNow}</p>
    `
  );

}