/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
let map;
let CurrentChoice = '';
let CurrentID = '';
let CurrentMapType = '';

let CurrentScore = 0;
let AllScores = [];
let incorrectGuesses = 0;
let AllIncorrectGuesses = [];

// Other variables
//var buttonGroup = document.getElementById("btn-group");
var selectList = document.getElementById("selectList");
var dropDown = document.getElementById("MapList");
var btnReset = document.getElementById("btnReset");
var ProgressBar = document.getElementById("ScoreProgress");
var ProgressBarLow = document.getElementById("ScoreProgressLow");
var mapDiv = document.getElementById("map");
var marker = null;

// These are needed in the firestore.js file
export var markers = [];
export var currentColour = '4285F4';

//-----------------------------------------------------------------------------------------------------------------------------
// Set map up
//-----------------------------------------------------------------------------------------------------------------------------
async function initMap() {
  
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const geocoder = new google.maps.Geocoder();

  // The map
  const position = { lat: 47.227173375972434, lng: 2.399537955057669 };
  map = new Map(document.getElementById("map"), {
    zoom: 5,
    center: position,
    mapId: "82f817486ca073a",
    disableDefaultUI: true,
    zoomControl: true
  });

  //---------------------------------------------------------------------------------------------------------------------------
  // Listen for click on map, and look up country
  map.addListener("click", (e) => {
    
    // DEBUG - print coordinates of click
    console.log(e.latLng.toJSON());

    // Check if user has selected a choice
    if(CurrentChoice != '') {

      // Use geocoder to get location name from coordinates of map click
      geocoder
      .geocode({ location: e.latLng })
      .then((response) => {
        console.log(response);

        // Get country/region name and place ID from location

        // First, special cases
        if(response.results[0].formatted_address.includes('Vatican City')) {
          var country_or_region = 'Holy See';
          var place_id = 'ChIJJTk-DGZgLxMRPGxQNTiMSQA';
        } else  if(response.results[2].formatted_address.includes('Newfoundland and Labrador')) {
          var country_or_region = 'Newfoundland and Labrador';
          var place_id = 'ChIJv46AZBbNbkwRhObiTXazvsU';
        } else {
          
          // Are we looking for a country or a region?
          if(CurrentMapType == 'Countries') {
            var location_type = 'country';
          } else {
            var location_type = 'administrative_area_level_1';
          }

          // Loop through address components
          var index = 0;
          response.results.every(element => {

            // Have we found the right address component, i.e. country or region name?
            if(element.types[0] == location_type) {
              return false;   // Break
            } else {
              index++;        // Increase index and continue
              return true;
            }
          });

          // Get country or region name and place ID
          var country_or_region = response.results[index].formatted_address;
          var place_id = response.results[index].place_id;
          
          // Get rid of ", ISA"
          country_or_region = country_or_region.split(',');
          country_or_region = country_or_region[0];
        
        }

        // Check if current choice is correct
        if(country_or_region == CurrentChoice) {

          // Set current choice to blank
          CurrentChoice = '';

          // Display map border for 1 second?
          mapDiv.style.border = "thick solid #4285F4";
          setTimeout(function(){ mapDiv.style.border = "" }, 1000);

          // Disable current selection in list
          document.getElementById(CurrentID).disabled = true;
          document.getElementById(CurrentID).style.color = 'black';
          document.getElementById(CurrentID).style.backgroundColor = 'rgb(162, 225, 167)';

          // Increase and display score
          CurrentScore++;
          AllScores[dropDown.dataset.current_map_id] = CurrentScore;
          displayScore();

          // Get coordinates of country/region from Google Places, then create marker
          let apiKey = 'AIzaSyC572-BukrE9PySgtA3ykrO7iydTb4S4Ko';
          fetch('https://places.googleapis.com/v1/places/' + place_id + '?fields=location&key=' + apiKey)
            .then(response => response.json())
            .then(response => {

              // Create marker and add to array
              const countryTag = document.createElement("div");
              countryTag.className = "country-tag";
              countryTag.style.backgroundColor = '#' + currentColour;
              countryTag.style.setProperty('--background', '#' + currentColour);
              countryTag.textContent = country_or_region;            
              marker = new AdvancedMarkerElement({
                map: map,
                position: { lat: response.location.latitude, lng: response.location.longitude },
                title: country_or_region,
                content: countryTag,
              });

              // Add marker to array
              if (typeof markers[dropDown.dataset.current_map_id] == "undefined") {
                markers[dropDown.dataset.current_map_id] = new Array ();
              }
              markers[dropDown.dataset.current_map_id][CurrentID] = marker;

          });
            
        // Wrong guess
        } else {
          
          // Increase incorrect guesses and display on screen
          incorrectGuesses++;
          AllIncorrectGuesses[dropDown.dataset.current_map_id] = incorrectGuesses;
          document.getElementById("incorrectEm").innerHTML = incorrectGuesses;

        }
      })
      .catch((e) => console.log("Geocoder failed due to: " + e));
    }
  });
}
initMap();
//-----------------------------------------------------------------------------------------------------------------------------

// User selects country/region in the list
selectList.addEventListener("click", function(event) {
  if (event.target.matches(".choice")) { 
    CurrentChoice = event.target.innerHTML;
    CurrentID = event.target.getAttribute('id');
    CurrentMapType = event.target.dataset.type;
  }
});
//-----------------------------------------------------------------------------------------------------------------------------
// Function called by firestore.js when a new map is selected from the list
export function newMapSelected(map_colour, map_zoom, map_lat, map_lng, current_map_id, snapshot_size) {
  currentColour = map_colour;

  // Centers map depending on map choice
  map.setZoom(Number(map_zoom));
  map.setCenter({lat: Number(map_lat), lng: Number(map_lng)});
  
  // Save number of countries/regions of current map in progress bar
  ProgressBar.dataset.max = snapshot_size;

  // Load score and incorrect guesses for this map if they exist, and display them
  if (typeof AllScores[current_map_id] != "undefined") {
    CurrentScore = AllScores[current_map_id];
  } else {
    CurrentScore = 0;
  }
  if (typeof AllIncorrectGuesses[current_map_id] != "undefined") {
    incorrectGuesses = AllIncorrectGuesses[current_map_id];
  } else {
    incorrectGuesses = 0;
  }  
  displayScore(); 

}
//-----------------------------------------------------------------------------------------------------------------------------
// "Start over" button pressed
btnReset.addEventListener("click", function(event) {
  
  // Reset score and progress bar
  AllScores[dropDown.dataset.current_map_id] = 0;
  CurrentScore = 0;

  // Resert incorrect guesses
  AllIncorrectGuesses[dropDown.dataset.current_map_id] = 0;
  incorrectGuesses = 0;

  // Display score and incorrect guesses
  displayScore(); 

  // Remove markers from map by setting their "map" atttribute to "undefined"
  for (var index in markers[dropDown.dataset.current_map_id]) {
    markers[dropDown.dataset.current_map_id][index].map = undefined;
  }

  // Remove markers from array itself
  delete markers[dropDown.dataset.current_map_id];

  // Reset list of countries
  for (const child of selectList.children) {
    child.disabled = false;
    child.style.color = 'rgb(33, 37, 41)';
    child.style.backgroundColor = 'rgb(255, 255, 255)';
  }  

});
//-----------------------------------------------------------------------------------------------------------------------------
function displayScore()
{
  // Display score value
  if(CurrentScore > ProgressBar.dataset.max / 2) {
    ProgressBar.innerHTML = CurrentScore + '/' + ProgressBar.dataset.max;
    ProgressBarLow.innerHTML = '';
    ProgressBarLow.classList.remove("ms-2");
  } else {
    ProgressBar.innerHTML = '';
    ProgressBarLow.innerHTML = CurrentScore + '/' + ProgressBar.dataset.max;
    ProgressBarLow.classList.add("ms-2");
  }

  // Set progress bar
  let percentage = CurrentScore / ProgressBar.dataset.max * 100;
  ProgressBar.style.width = percentage + '%';  

  // Display incorrect guesses
  document.getElementById("incorrectEm").innerHTML = incorrectGuesses;
}