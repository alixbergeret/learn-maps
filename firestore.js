// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { Firestore, 
        getFirestore, 
        onSnapshot, 
        query, 
        collection, 
        orderBy,
        addDoc } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js'

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

// Get a live data snapshot (i.e. auto-refresh) of our collection
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
        addToList('dropdown-item', doc.data().map_name);

        // Save previous value
        prevType = doc.data().map_type;

    });
});

function addToList(css_class, textContent = '') {
    
    // Get pointer to dropdown
    let dropDown = document.getElementById("MapList");
    
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
    listItem.appendChild(link);
    
}