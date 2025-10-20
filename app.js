// -------------------------------------------
// 🐾 PawsFinder - No Upload Version (Image URL only)
// -------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD5MSI2XRI9Ktw8EYSv3GpzzyBOjhfOoQk",
  authDomain: "pawsfinder-fd488.firebaseapp.com",
  databaseURL: "https://pawsfinder-fd488-default-rtdb.firebaseio.com",
  projectId: "pawsfinder-fd488",
  storageBucket: "pawsfinder-fd488.appspot.com",
  messagingSenderId: "407997181229",
  appId: "1:407997181229:web:d2f3cc3517d2504842b7a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM Elements
const loadingScreen = document.getElementById("loading-screen");
const authContainer = document.getElementById("auth-container");
const otpContainer = document.getElementById("otp-container");
const dashboard = document.getElementById("dashboard");
const addDogModal = document.getElementById("add-dog-modal");
const dogList = document.getElementById("dog-list");

// Show Login
setTimeout(() => {
  loadingScreen.classList.add("hidden");
  authContainer.classList.remove("hidden");
}, 1000);

// Login & Signup
document.getElementById("login-btn").onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      authContainer.classList.add("hidden");
      dashboard.classList.remove("hidden");
      loadDogs();
    })
    .catch(err => alert(err.message));
};

document.getElementById("signup-btn").onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Signup successful! Please log in."))
    .catch(err => alert(err.message));
};

// Fake OTP
document.getElementById("otp-btn").onclick = () => {
  const phone = document.getElementById("phone").value.trim();
  if (!phone) return alert("Enter phone number");
  alert("OTP sent successfully (Use 12345)");
  authContainer.classList.add("hidden");
  otpContainer.classList.remove("hidden");
};

document.getElementById("verify-btn").onclick = () => {
  const code = document.getElementById("otp-code").value.trim();
  if (code === "12345") {
    alert("OTP verified successfully!");
    otpContainer.classList.add("hidden");
    dashboard.classList.remove("hidden");
    loadDogs();
  } else alert("Incorrect OTP");
};

// Logout
document.getElementById("logout-btn").onclick = () => {
  signOut(auth).then(() => {
    dashboard.classList.add("hidden");
    authContainer.classList.remove("hidden");
  });
};

// Add Dog Modal
document.getElementById("add-dog-btn").onclick = () => addDogModal.classList.add("active");
document.getElementById("close-modal").onclick = () => addDogModal.classList.remove("active");

// Use My Location
document.getElementById("use-location").onclick = () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    document.getElementById("dog-location").value =
      `${pos.coords.latitude}, ${pos.coords.longitude}`;
  });
};

// Save Dog
document.getElementById("save-dog-btn").onclick = async () => {
  try {
    const imageUrl = document.getElementById("dog-url").value.trim() || 
      "https://guidedogs.com.au/wp-content/uploads/2022/07/Guide-Dogs-Australia-Logo.png";
    const color = document.getElementById("dog-color").value.trim();
    const age = document.getElementById("dog-age").value.trim();
    const size = document.getElementById("dog-size").value.trim();
    const location = document.getElementById("dog-location").value.trim();
    const status = document.getElementById("dog-status").value;

    if (!imageUrl || !color || !age || !size || !location) {
      alert("Please fill all fields.");
      return;
    }

    const newDogRef = push(ref(db, "dogs"));
    await set(newDogRef, {
      imageUrl,
      color,
      age,
      size,
      location,
      status,
      createdAt: new Date().toISOString()
    });

    alert("Dog details saved!");
    addDogModal.classList.remove("active");
    loadDogs();
  } catch (err) {
    alert("Error saving dog: " + err.message);
  }
};

// CRUD Operations
function loadDogs() {
  onValue(ref(db, "dogs"), (snapshot) => {
    dogList.innerHTML = "";
    snapshot.forEach((child) => {
      const id = child.key;
      const dog = child.val();
      const div = document.createElement("div");
      div.className = "dog-card";
      div.innerHTML = `
        <img src="${dog.imageUrl}" alt="Dog Image">
        <h3>${dog.color} | ${dog.size}</h3>
        <p>Age: ${dog.age}</p>
        <p>Location: ${dog.location}</p>
        <p>Status: ${dog.status}</p>
        <div class="dog-actions">
          <button class="edit-btn" data-id="${id}">Edit</button>
          <button class="delete-btn" data-id="${id}">Delete</button>
        </div>`;
      dogList.appendChild(div);
    });

    document.querySelectorAll(".edit-btn").forEach(btn =>
      btn.addEventListener("click", e => editDog(e.target.dataset.id))
    );
    document.querySelectorAll(".delete-btn").forEach(btn =>
      btn.addEventListener("click", e => deleteDog(e.target.dataset.id))
    );
  });
}

function editDog(id) {
  const newColor = prompt("New color:");
  const newAge = prompt("New age:");
  if (!newColor || !newAge) return;
  update(ref(db, "dogs/" + id), { color: newColor, age: newAge });
}

function deleteDog(id) {
  if (confirm("Delete this dog?")) {
    remove(ref(db, "dogs/" + id));
  }
}
