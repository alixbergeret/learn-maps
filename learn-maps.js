/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
let map;
let CurrentChoice = '';
let CurrentID = '';
let CurrentScore = 0;

// Other variables
var buttonGroup = document.getElementById("btn-group");
var dropDown = document.getElementById("MapList");

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

  // Listen for click and look up country
  map.addListener("click", (e) => {
    
    // DEBUG - print coordinates of click
    console.log(e.latLng.toJSON());

    // Use geocoder to get location name from coordinates
    geocoder
    .geocode({ location: e.latLng })
    .then((response) => {

      // Get country name from location
      let country = response.results[response.results.length-1].formatted_address;
      console.log(country);

      // Check if current choice is correct
      if(country == CurrentChoice) {

        // If correct, show toast message
        const toastLiveExample = document.getElementById('liveToast');
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
        toastBootstrap.show();

        // Disable current selection
        document.getElementById(CurrentID).disabled = true;

        // Increase and display score
        CurrentScore++;
        let ProgressBar = document.getElementById("ScoreProgress");
        ProgressBar.innerHTML = CurrentScore + '/' + ProgressBar.dataset.max;

      } else {
        console.log("NOPE");
      }
    })
    .catch((e) => window.alert("Geocoder failed due to: " + e));
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