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

//-----------------------------------------------------------------------------------------------------------------------------
// When user selects a map from the dropdown, loads all countries/regions
//-----------------------------------------------------------------------------------------------------------------------------
dropDown.addEventListener("click", function(event) {
    if (event.target.matches(".dropdown-item")) {  

        // First, clear list of countries/regions
        buttonGroup.innerHTML = '';

        // Get map doc ID, then loads all countries/regions for it
        const querySnapshot = query(collection(db, "Maps", event.target.dataset.docid, "map_items"), orderBy("item_name"));
        const unsubscribe = onSnapshot(querySnapshot, (snapshot) => {
            snapshot.forEach((doc) => {

                // Create input element
                let inputElement = document.createElement("input");
                inputElement.type = "radio";
                inputElement.classList.add("btn-check");
                inputElement.name = "itemList";
                inputElement.id = doc.id;
                buttonGroup.appendChild(inputElement);

                // Create label element
                let labelElement = document.createElement("label");
                labelElement.classList.add("btn", "btn-outline-primary", "choice");
                labelElement.htmlFor = doc.id;
                labelElement.innerHTML = doc.data().item_name.trim();
                buttonGroup.appendChild(labelElement);

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
        addToList('dropdown-item', doc.data().map_name, doc.id);

        // Save previous value
        prevType = doc.data().map_type;

    });
});

// This function add one item to the dropdown
function addToList(css_class, textContent = '', doc_id = 0) {
    
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
    }
    link.textContent = textContent;
    link.classList.add(css_class);
    if(doc_id != 0)
        link.dataset.docid = doc_id;

    listItem.appendChild(link);
    
}