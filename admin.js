// admin.js

import { auth, database } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    ref,
    set
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

// =======================
// Elements
// =======================

const loginSection = document.getElementById("loginSection");
const controlSection = document.getElementById("controlSection");

const email = document.getElementById("email");
const password = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const streamUrl = document.getElementById("streamUrl");
const streamTitle = document.getElementById("streamTitle");
const streamDescription = document.getElementById("streamDescription");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");


// =======================
// Login
// =======================

loginBtn.addEventListener("click", async () => {

    const userEmail = email.value.trim();
    const userPassword = password.value;

    if (!userEmail || !userPassword) {
        alert("Email এবং Password দিন");
        return;
    }

    try {

        await signInWithEmailAndPassword(
            auth,
            userEmail,
            userPassword
        );

    } catch (error) {

        alert(error.message);

    }

});


// =======================
// Login State
// =======================

onAuthStateChanged(auth, (user) => {

    if (user) {

        loginSection.style.display = "none";
        controlSection.style.display = "block";

    } else {

        loginSection.style.display = "block";
        controlSection.style.display = "none";

    }

});


// =======================
// Start Live
// =======================

startBtn.addEventListener("click", async () => {

    const url = streamUrl.value.trim();
    const title = streamTitle.value.trim();
    const description = streamDescription.value.trim();

    if (!url) {

        alert("Stream URL লিখুন");
        return;

    }

    try {

await set(ref(database, "stream"), {

    url,
    title,
    description,
    isLive: true,
    updatedAt: Date.now()

});

alert("Live Stream Started");

} catch (error) {

    alert(error.message);

}

});
// =======================
// Stop Live
// =======================

stopBtn.addEventListener("click", async () => {

    try {

        await set(ref(database, "stream"), {

            url: "",
            title: "",
            description: "",
            isLive: false,
            updatedAt: Date.now()

        });

        alert("Live Stream Stopped");

    } catch (error) {

        alert(error.message);

    }

});
// =======================
// Logout
// =======================

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

    } catch (error) {

        alert(error.message);

    }

});
