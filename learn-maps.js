/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
let map;
let CurrentChoice = '';
let CurrentID = '';
let CurrentScore = 0;
let CurrentMapType = '';
let incorrectGuesses = 0;

// Other variables
var buttonGroup = document.getElementById("btn-group");
var selectList = document.getElementById("selectList");
var dropDown = document.getElementById("MapList");
var btnReset = document.getElementById("btnReset");
var ProgressBar = document.getElementById("ScoreProgress");
var ProgressBarLow = document.getElementById("ScoreProgressLow");
var mapDiv = document.getElementById("map");

var marker = null;
var markers = [];

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
        if(response.results[0].formatted_address.includes('Vatican City')) {
          // Vatican City is really called Holy See
          var country_or_region = 'Holy See';
          var place_id = 'ChIJJTk-DGZgLxMRPGxQNTiMSQA';
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
          if(CurrentScore > ProgressBar.dataset.max / 2) {
            ProgressBar.innerHTML = CurrentScore + '/' + ProgressBar.dataset.max;
            ProgressBarLow.innerHTML = '';
          } else {
            ProgressBarLow.innerHTML = CurrentScore + '/' + ProgressBar.dataset.max;
          }

          // Increase progress bar
          let percentage = CurrentScore / ProgressBar.dataset.max * 100;
          ProgressBar.style.width = percentage + '%';

          // Get coordinates of country/region from Google Places, then create marker
          let apiKey = 'AIzaSyC572-BukrE9PySgtA3ykrO7iydTb4S4Ko';
          fetch('https://places.googleapis.com/v1/places/' + place_id + '?fields=location&key=' + apiKey)
            .then(response => response.json())
            .then(response => {

              // Create marker and add to array
              const countryTag = document.createElement("div");
              countryTag.className = "country-tag";
              countryTag.textContent = country_or_region;            
              marker = new AdvancedMarkerElement({
                map: map,
                position: { lat: response.location.latitude, lng: response.location.longitude },
                title: country_or_region,
                content: countryTag,
              });
              markers.push(marker);
          });
            
        // Wrong guess
        } else {
          
          // Increase incorrect guesses and display on screen
          incorrectGuesses++;
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
// Centers maps depending on map choice
dropDown.addEventListener("click", function(event) {
  map.setZoom(Number(event.target.dataset.zoom));
  map.setCenter({lat: Number(event.target.dataset.lat), lng: Number(event.target.dataset.lng)});
});
//-----------------------------------------------------------------------------------------------------------------------------
// "Start over" button pressed
btnReset.addEventListener("click", function(event) {
  
  // Reset score and progress bar
  CurrentScore = 0;
  ProgressBar.style.width = '0%';
  ProgressBar.innerHTML = '';  
  ScoreProgressLow.innerHTML = CurrentScore + '/' + ProgressBar.dataset.max;  

  // Resert incorrect guesses
  incorrectGuesses = 0;
  document.getElementById("incorrectEm").innerHTML = incorrectGuesses;

  // Remove markers
  markers.forEach(deleteMarkers);
  function deleteMarkers(value, index, array) {
    markers[index].map = null;
  }

  // Reset list of countries
  for (const child of selectList.children) {
    child.disabled = false;
    child.style.color = 'rgb(33, 37, 41)';
    child.style.backgroundColor = 'rgb(255, 255, 255)';
  }  

});
//-----------------------------------------------------------------------------------------------------------------------------