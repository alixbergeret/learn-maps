/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
let map;
let CurrentChoice = '';
let CurrentID = '';
let CurrentScore = 0;
let incorrectGuesses = 0;

// Other variables
var buttonGroup = document.getElementById("btn-group");
var dropDown = document.getElementById("MapList");
var btnReset = document.getElementById("btnReset");
var ProgressBar = document.getElementById("ScoreProgress");
var marker = null;

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
    disableDefaultUI: true
  });

  //---------------------------------------------------------------------------------------------------------------------------
  // Listen for click and look up country
  map.addListener("click", (e) => {
    
    // DEBUG - print coordinates of click
    console.log(e.latLng.toJSON());

    // Check if user has selected a choice
    if(CurrentChoice != '') {

      // Use geocoder to get location name from coordinates
      geocoder
      .geocode({ location: e.latLng })
      .then((response) => {

        // Get country name and place ID from location
        let country = response.results[response.results.length-1].formatted_address;
        let place_id = response.results[response.results.length-1].place_id;

        // Check if current choice is correct
        if(country == CurrentChoice) {

          // If correct, show toast message
          const toastLiveExample = document.getElementById('liveToast');
          const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
          toastBootstrap.show();

          // Disable current selection in list
          document.getElementById(CurrentID).disabled = true;

          // Increase and display score
          CurrentScore++;
          ProgressBar.innerHTML = CurrentScore + '/' + ProgressBar.dataset.max;

          // Increase progress bar
          let percentage = CurrentScore / ProgressBar.dataset.max * 100;
          ProgressBar.style.width = percentage + '%';

          // Get coordinates of country from Google Places, then create marker
          let apiKey = 'AIzaSyC572-BukrE9PySgtA3ykrO7iydTb4S4Ko';
          fetch('https://places.googleapis.com/v1/places/' + place_id + '?fields=location&key=' + apiKey)
            .then(response => response.json())
            .then(response => {

              // Create marker
              const countryTag = document.createElement("div");
              countryTag.className = "country-tag";
              countryTag.textContent = country;            
              marker = new AdvancedMarkerElement({
                map: map,
                position: { lat: response.location.latitude, lng: response.location.longitude },
                title: country,
                content: countryTag,
              });
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

// Set current country/region
buttonGroup.addEventListener("click", function(event) {
  if (event.target.matches(".choice")) { 
    CurrentChoice = event.target.innerHTML;
    CurrentID = event.target.getAttribute('for');
  }
});

// Centers maps depending on map choice
dropDown.addEventListener("click", function(event) {
  map.setZoom(Number(event.target.dataset.zoom));
  map.setCenter({lat: Number(event.target.dataset.lat), lng: Number(event.target.dataset.lng)});
});

// Start over button pressed
btnReset.addEventListener("click", function(event) {
  ProgressBar.style.width = '0%';
  CurrentScore = 0;
  ProgressBar.innerHTML = CurrentScore + '/' + ProgressBar.dataset.max;  
  marker.map = null;
  incorrectGuesses = 0;
  document.getElementById("incorrectEm").innerHTML = incorrectGuesses;

});