import { store } from '../index';

export function googleMapInit() {
  const { coordinates } = store.currentLocation;
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
    googleMapInit();
  }

  function googleMapInit() {
    const { lat, lng } = coordinates;
    const map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat,
        lng,
      },
      zoom: 10,
    });

    const marker = new google.maps.Marker({
      position: {
        lat,
        lng,
      },
      map: map,
    });
  }
}

export function addCoordinates() {
  const { lat, lng } = store.currentLocation.coordinates;
  const coordinatesBlock = document.querySelector('.map-section .coordinates');
  const latArray = lat.toFixed(2).split('.');
  const lngArray = lng.toFixed(2).split('.');
  const latDeg = latArray[0];
  const latMin = latArray[1];
  const lngDeg = lngArray[0];
  const lngMin = lngArray[1];
  coordinatesBlock.innerHTML = '';
  coordinatesBlock.insertAdjacentHTML(
    'beforeend',
    `<p>${store.translate.latitude}: ${latDeg}°${latMin}'</p>
          <p>${store.translate.longitude}: ${lngDeg}°${lngMin}'</p>
         `
  );
}
