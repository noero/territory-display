const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const number = JSON.parse(urlParams.get('n'));
if (number === null){
  window.location.replace(window.location.href + "admin");
}
const isCom = parseInt(JSON.parse(urlParams.get('c')));
const isInv = parseInt(JSON.parse(urlParams.get('i')));
let color = '#555555';
let urlStyle = '';
let urlGeoJson
let title = 'Territoire '

if (isCom === 1) {
    urlGeoJson = "./geoJson/Commerces.kml";
    title += 'de commerces n°' + number
} else if (isInv === 1) {
    urlGeoJson = "./geoJson/Campagnes.kml";
    title += "d'invitations n°" + number
} else {
    urlGeoJson = "./geoJson/Territoires.kml";
    title += 'n°' + number
}
$('.navbar-brand').html(title);

let geoJson;
$.ajax({
    'url': urlGeoJson,
    'async': false
  }).done(function(xml) {
    geoJson = toGeoJSON.kml(xml);
});
const coords = geoJson.features[parseInt(number)].geometry.coordinates;

let bounds = coords[0].reduce(function (bounds, coordinate) {
        return bounds.extend(coordinate);
    }, new maplibregl.LngLatBounds(coords[0][0], coords[0][0]));

/*------------- Popup ------------- */

  $('.popup-with-zoom-anim').magnificPopup({
      type: 'inline',

      fixedContentPos: false,
      fixedBgPos: true,

      overflowY: 'auto',

      closeBtnInside: true,
      preloader: false,

      midClick: true,
      removalDelay: 300,
      mainClass: 'my-mfp-zoom-in'
  });

/*------------- Map ------------- */

let map = new maplibregl.Map({
    container: 'map',
    style: "./style-map/street.json",
    center: coords[0][0],
    trackResize: true,
    zoom: 18
});
map.fitBounds(bounds, {
    padding: 20
});
map.addControl(new maplibregl.NavigationControl());
map.addControl(new maplibregl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

map.on('load', function () {
    map.addSource('territoire', {
        'type': 'geojson',
        'data': geoJson.features[parseInt(number)]
    });
    map.addLayer({
        'id': 'territoire',
        'type': 'line',
        'source': 'territoire',
        'layout': {},
        'paint': {
            'line-color': color,
            'line-width': 6,
            'line-opacity': 0.6
        }
    });
    map.on('style.load', function () {
        map.addSource('territoire', {
            'type': 'geojson',
            'data': geoJson.features[parseInt(number)]
        });
        map.addLayer({
            'id': 'territoire',
            'type': 'line',
            'source': 'territoire',
            'layout': {},
            'paint': {
                'line-color': color,
                'line-width': 6,
                'line-opacity': 0.8
            }
        });
    });
    document
        .getElementById('styles')
        .addEventListener('change', function (event) {
            let style = event.target.value;
            switch (style) {
                case 'street':
                    color = '#555555';
                    break;
                case 'satellite':
                    color = '#fff';
                    break;
                case 'here':
                    color = '#D73131';
                    break;
            }
            urlStyle = "./style-map/" + style + ".json";
            if (map.getLayer('territoire')) map.removeLayer('territoire');
            if (map.getSource('territoire')) map.removeSource('territoire');
            map.setStyle(urlStyle);

        });
});

function CSVToJSON(data, delimiter = ';') {
  const titles = data.slice(0, data.indexOf('\n')).split(delimiter);
  return data
    .slice(data.indexOf('\n') + 1)
    .split('\n')
    .map(v => {
      const values = v.split(delimiter);
      return titles.reduce(
        (obj, title, index) => ((obj[title] = values[index]), obj),
        {}
      );
    });
};

$.get( "geoJson/PANPV.csv", function( data ) {
  let json = CSVToJSON(data);
  for (var i = 0; i < json.length; i++){
    var obj = json[i];
    var num;
    if (isCom) {
      num = obj['Commerces'];
    } else if (isInv) {
      num = obj['Campagnes'];
    } else {
      num = obj['Territoires'];
    }
    if (parseInt(num) === number) {
      var addresse = obj["Adresse"];
      var date = obj["Dernière date"].replace(/\s+/g, ' ').trim();;
      if (date != '') {
        addresse += ' - '
      }
      $('.no-npv').html('');
      $('.list-npv').append('<li>'+ addresse + date +'</li>');
    }
  }
});
