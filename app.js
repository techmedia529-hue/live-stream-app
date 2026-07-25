import { loadStream } from "./player.js";
import { database } from "./firebase-config.js";

import { 
    ref, 
    onValue 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";


// ===============================
// LIVE STREAM APP
// app.js
// ===============================


// ---------- Elements ----------
const video = document.getElementById("videoPlayer");
const youtubePlayer = document.getElementById("youtubePlayer");

const videoContainer = document.getElementById("videoContainer");

const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const pipBtn = document.getElementById("pipBtn");

const seekBar = document.getElementById("seekBar");

const loadingScreen = document.getElementById("loadingScreen");
const offlineScreen = document.getElementById("offlineScreen");


// ===============================
// Loading Screen
// ===============================

window.addEventListener("load", () => {

    setTimeout(() => {

        if(loadingScreen){
            loadingScreen.style.display = "none";
        }

    },1500);

});


// ===============================
// Firebase Realtime Stream Listener
// ===============================

const streamRef = ref(database,"stream");


onValue(streamRef,(snapshot)=>{

    const stream = snapshot.val();
console.log("Firebase Stream Data:", stream);

    if(!stream){

        if(offlineScreen){
            offlineScreen.style.display="block";
        }

        return;

    }



    // Stream ON

    if(stream.isLive === true && stream.url){
console.log("Playing URL:", stream.url);
        if(offlineScreen){
            offlineScreen.style.display="none";
        }


        loadStream(stream.url);

    }


    // Stream OFF

    else {

        if(offlineScreen){
            offlineScreen.style.display="block";
        }

    }


});



// ===============================
// Play / Pause
// ===============================

playPauseBtn?.addEventListener("click",()=>{


    if(video.paused){

        video.play();

        playPauseBtn.innerHTML =
        '<i class="fa-solid fa-pause"></i>';

    }

    else{

        video.pause();

        playPauseBtn.innerHTML =
        '<i class="fa-solid fa-play"></i>';

    }

});



// ===============================
// Mute
// ===============================

muteBtn?.addEventListener("click",()=>{


    video.muted = !video.muted;


    muteBtn.innerHTML = video.muted

    ? '<i class="fa-solid fa-volume-xmark"></i>'

    : '<i class="fa-solid fa-volume-high"></i>';

});



// ===============================
// Fullscreen
// ===============================

fullscreenBtn?.addEventListener("click",async()=>{


    if(!document.fullscreenElement){

        await videoContainer.requestFullscreen();

    }

    else{

        await document.exitFullscreen();

    }


});



// ===============================
// Picture in Picture
// ===============================

pipBtn?.addEventListener("click",async()=>{


    if(document.pictureInPictureEnabled){

        try{

            await video.requestPictureInPicture();

        }

        catch(error){

            console.log(error);

        }

    }


});



// ===============================
// Seek Bar
// ===============================

video?.addEventListener("timeupdate",()=>{


    if(!video.duration) return;


    seekBar.value =
    (video.currentTime / video.duration) * 100;


});



seekBar?.addEventListener("input",()=>{


    if(!video.duration) return;


    video.currentTime =
    (seekBar.value /100) * video.duration;


});
