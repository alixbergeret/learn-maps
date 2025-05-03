//-----------------------------------------------------------------------------------------------------------------------------
// Initialize Firestore
//-----------------------------------------------------------------------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { Firestore, 
        getFirestore, 
        onSnapshot, 
        query, 
        collection, 
        orderBy } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js'

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyCpQUWUQEddAKuuUAbhWMK3xDdzzxQ1BDM",
authDomain: "learn-maps-fb101.firebaseapp.com",
projectId: "learn-maps-fb101",
storageBucket: "learn-maps-fb101.firebasestorage.app",
messagingSenderId: "922971501503",
appId: "1:922971501503:web:15fa86344767660846270a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Other variables
var dropDown = document.getElementById("MapList");
var buttonGroup = document.getElementById("btn-group");
var selectList = document.getElementById("selectList");
var ProgressBar = document.getElementById("ScoreProgress");
var ProgressBarLow = document.getElementById("ScoreProgressLow");
var DropdownBtn = document.getElementById("DropdownBtn");
var prevListItem = null;

// Import variables from maps module
import {markers} from './learn-maps.js';

//-----------------------------------------------------------------------------------------------------------------------------
// When user selects a map from the dropdown, loads all countries/regions
//-----------------------------------------------------------------------------------------------------------------------------
dropDown.addEventListener("click", function(event) {
    if (event.target.matches(".dropdown-item")) {  

        // First, clear list of countries/regions
        selectList.innerHTML = '';
        
        // Display current map on list button
        DropdownBtn.innerHTML = event.target.innerHTML;

        // Select current item in the dropdown, and deselect previous one
        event.target.classList.add("active");
        if(prevListItem != null)
            prevListItem.classList.remove("active");
        prevListItem = event.target;

        // Get map doc ID, then loads all countries/regions for it
        dropDown.dataset.current_map_id = event.target.dataset.docid;
        const querySnapshot = query(collection(db, "Maps", event.target.dataset.docid, "map_items"), orderBy("item_name"));
        const unsubscribe = onSnapshot(querySnapshot, (snapshot) => {

            // Display total in progress bar
            ProgressBarLow.innerHTML = '0/' + snapshot.size;
            ProgressBar.dataset.max = snapshot.size;
            ProgressBar.style.width = '0%';

            // Loop through records
            snapshot.forEach((doc) => {

                // Create option item
                let listItem = document.createElement("option");
                listItem.dataset.type = event.target.dataset.type;
                listItem.innerHTML = doc.data().item_name.trim();
                listItem.value = doc.data().item_name.trim();
                listItem.id = doc.id;
                listItem.classList.add("choice");

                // Have we guessed it already? if so, disable and set to green.
                if (typeof markers[event.target.dataset.docid] != "undefined") {
                    if (typeof markers[event.target.dataset.docid][doc.id] != "undefined") {
                        listItem.disabled = true;
                        listItem.style.color = 'black';
                        listItem.style.backgroundColor = 'rgb(162, 225, 167)';
                    }
                }

                // Add item to list
                selectList.appendChild(listItem);
            });
        });
    }
});

//-----------------------------------------------------------------------------------------------------------------------------
// Populate Maps dropdown from Firestore
//-----------------------------------------------------------------------------------------------------------------------------
const q = query(collection(db, "Maps"), orderBy("map_type"), orderBy("map_name"));
const unsubscribe = onSnapshot(q, (snapshot) => {
    
    // For each map in the store
    var prevType = '';
    snapshot.forEach((doc) => {

        // Header?
        if(prevType != doc.data().map_type) {

            // Add divider
            if(prevType != '') {
                addToList('dropdown-divider');
            }

            // Add Header
            addToList('dropdown-header', doc.data().map_type);
        }

        // Create a new list item and add it to the dropdown
        addToList('dropdown-item', 
                   doc.data().map_name, 
                   doc.id, 
                   doc.data().map_lat, 
                   doc.data().map_lng,
                   doc.data().map_zoom,
                   doc.data().map_type);

        // Save previous value
        prevType = doc.data().map_type;

    });
});

// This function add one item to the dropdown
function addToList(css_class, 
                   textContent = '', 
                   doc_id = 0, 
                   map_lat = '', 
                   map_lng = '',
                   map_zoom = 0,
                   map_type = '') {
    
    // Create list item and add to list
    let listItem = document.createElement("li");
    dropDown.appendChild(listItem);

    // Create link or heading, and add to list item
    let link = '';
    if(css_class == 'dropdown-header') {
        link = document.createElement("h6");
    } else if(css_class == 'dropdown-divider') {
        link = document.createElement("hr");        
    } else {
        link = document.createElement("a");
        link.href = '#';
        link.dataset.lat = map_lat;
        link.dataset.lng = map_lng;
        link.dataset.zoom = map_zoom;
        link.dataset.type = map_type;
    }
    link.textContent = textContent;
    link.classList.add(css_class);
    if(doc_id != 0)
        link.dataset.docid = doc_id;

    listItem.appendChild(link);
    
}