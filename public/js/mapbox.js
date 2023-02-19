/* eslint-disable */
export const displayMap = (locations) => {
//adding token mapboxgl object
mapboxgl.accessToken =
  'pk.eyJ1IjoicmFhbXRoZWNvZGVyIiwiYSI6ImNsZTExcDNxMjFmdmQ0Mm52NmN6Yng1ZHoifQ.OvCV8tl9gAdY6nsANWzv3A';


//creating map using mapboxgl.Map() constructor
var map = new mapboxgl.Map({
  container: 'map',//here 'map' is the div's id where we want to show the map
  style: 'mapbox://styles/raamthecoder/cle12t5t1008p01kgqft9hdb1',//style of map -in maobox account create this in 'Desigin in mapboxStudio"
  scrollZoom: false,//disabling scrollazoom for better user experience
  // center: [-118.113491, 34.111745],//not neccessary
  // zoom: 8,//not neccessary
  // interactive: false,//not neccessary
});




//creating the 'bounds' objects that holds all the given locations in the box
const bounds = new mapboxgl.LngLatBounds();


//)adding marker and popup and extending bounds to all the locations
locations.forEach((loc) => {
  //creating  marker for each location
  const el = document.createElement('div');
  el.className = 'marker';//adiing classname


  //adding marker on the map
  new mapboxgl.Marker({
    element: el,//here el is marker element
    anchor: 'bottom',//this make the mark elemts bottom  sit on the location
  })
    .setLngLat(loc.coordinates)//setting each locations cordinates to this marker
    .addTo(map);//and then adding them to the map


  //adding Popup to Locations
  new mapboxgl.Popup({ offset: 30 })//here offsest is height betwen location poin and popup
    .setLngLat(loc.coordinates)//setting each locations cordinates to this popup
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)//createing popup html element
    .addTo(map);//and then adding them to the map


  //Extend map bound to include current location//this makes map box (bounds) with all the locations
  bounds.extend(loc.coordinates);
});


//finally fitting bounds object inside the map with some padding
map.fitBounds(bounds, {//fitting the bound inside the map that will be shown in the webpage ,
  padding: {//adding some padding for better user experience
    left: 100,
    right: 100,
    top: 200,
    bottom: 150,
  },
});
};
