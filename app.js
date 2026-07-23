// ======================================
// Live Stream App v3.0
// app.js (Part 1)
// ======================================

import { db, auth } from "./firebase-config.js";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    serverTimestamp,
    collection,
    addDoc,
    query,
    orderBy,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// =====================
// HTML Elements
// =====================

const videoPlayer = document.getElementById("videoPlayer");
const videoOverlay = document.getElementById("videoOverlay");
const adminEmail = document.getElementById("adminEmail");
const displayTitle = document.getElementById("displayTitle");
const displayDesc = document.getElementById("displayDesc");
const streamInfoOverlay = document.getElementById("streamInfoOverlay");

const chatBox = document.getElementById("chatBox");
const commentInput = document.getElementById("commentInput");
const sendCommentBtn = document.getElementById("sendCommentBtn");

const likeBtn = document.getElementById("likeBtn");
const likeCount = document.getElementById("likeCount");

const fullscreenBtn = document.getElementById("fullscreenBtn");
const shareBtn = document.getElementById("shareBtn");

const adminTriggerBtn = document.getElementById("adminTriggerBtn");
const adminModal = document.getElementById("adminModal");

const loginSection = document.getElementById("loginSection");
const controlSection = document.getElementById("controlSection");

const adminPassword = document.getElementById("adminPassword");
const loginBtn = document.getElementById("loginBtn");

const adminUrlInput = document.getElementById("adminUrlInput");
const adminTitleInput = document.getElementById("adminTitleInput");
const adminDescInput = document.getElementById("adminDescInput");

const startStreamBtn = document.getElementById("startStreamBtn");
const closeAdminBtn = document.getElementById("closeAdminBtn");

// =====================
// Live Stream Listener
// =====================

const liveRef = doc(db, "live", "current");

onSnapshot(liveRef, (snapshot) => {

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    if (!data.isLive) {

        videoPlayer.pause();
        videoPlayer.removeAttribute("src");
        videoPlayer.load();

        videoOverlay.style.display = "flex";
        streamInfoOverlay.style.display = "none";

        return;

    }

    displayTitle.textContent = data.title || "";
    displayDesc.textContent = data.description || "";

    streamInfoOverlay.style.display = "block";
    videoOverlay.style.display = "none";

    playVideo(data.url);

});

// =====================
// Video Player
// =====================
let hls = null;

function playVideo(url){

    if(hls){
        hls.destroy();
        hls = null;
    }

    if(url.endsWith(".m3u8")){

        if(Hls.isSupported()){

            hls = new Hls();

            hls.loadSource(url);

            hls.attachMedia(videoPlayer);

        }else{

            videoPlayer.src = url;

        }

    }else{

        videoPlayer.src = url;

    }

videoPlayer.play().catch(console.error);

}
// ======================================
// app.js (Part 2)
// Admin Panel
// ======================================

// Admin Modal Open
adminTriggerBtn.addEventListener("click", () => {
    adminModal.style.display = "block";
});

// Close Modal
closeAdminBtn.addEventListener("click", () => {
    adminModal.style.display = "none";
});

// Close Modal (Outside Click)
window.addEventListener("click", (e) => {
    if (e.target === adminModal) {
        adminModal.style.display = "none";
    }
});
// =====================
// Admin Login
// =====================
loginBtn.addEventListener("click", async () => {

    const email = adminEmail.value.trim();
    const password = adminPassword.value.trim();

    if (!email || !password) {
        alert("Email এবং Password দিন");
        return;
    }

    try {

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("Login UID:", user.uid);

        const adminUserRef = doc(db, "users", user.uid);

        const userDoc = await getDoc(adminUserRef);

        if (!userDoc.exists()) {

            await setDoc(adminUserRef, {
                uid: user.uid,
                email: user.email,
                name: "Admin",
                role: "admin",
                createdAt: serverTimestamp()
            });

            alert("Admin তথ্য তৈরি করা হয়েছে। আবার Login করুন।");
            await signOut(auth);
            return;
        }

        const data = userDoc.data();

        console.log("User Data:", data);

        if (data.role !== "admin") {
            alert("আপনি Admin নন");
            await signOut(auth);
            return;
        }

        loginSection.style.display = "none";
        controlSection.style.display = "block";

        alert("Admin Login সফল হয়েছে");

    } catch (error) {

        console.error(error);
        alert(error.code + "\n" + error.message);

    }

});
// =====================
// Start Stream
// =====================
startStreamBtn.addEventListener("click", async () => {

    const url = adminUrlInput.value.trim();
    const title = adminTitleInput.value.trim();
    const description = adminDescInput.value.trim();

    if (!url) {
        alert("ভিডিও URL দিন");
        return;
    }

    try {
await setDoc(liveRef, {
    url,
    title,
    description,
    isLive: true,
    updatedAt: serverTimestamp()
}, { merge: true });

        alert("লাইভ সফলভাবে শুরু হয়েছে।");
        adminModal.style.display = "none";

    } catch (error) {
        console.error(error);
        alert(error.code + "\n" + error.message);
    }

});
// =====================
// Stop Stream Function
// =====================

async function stopStream() {

    try {

await setDoc(liveRef, {
    url: "",
    title: "",
    description: "",
    isLive: false,
    updatedAt: serverTimestamp()
}, { merge: true });

        alert("লাইভ বন্ধ করা হয়েছে");

    } catch (err) {

        console.error(err);

    }

}

// =====================
// Double Click = Stop
// =====================

startStreamBtn.addEventListener("dblclick", stopStream);
// ======================================
// app.js (Part 3)
// Real-time Chat
// ======================================
// Chat Collection
const chatRef = collection(db, "chat");

// =====================
// Send Comment
// =====================

sendCommentBtn.addEventListener("click", sendComment);

commentInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        sendComment();

    }

});

async function sendComment() {

    const message = commentInput.value.trim();

    if (!message) return;

    try {

        await addDoc(chatRef, {

            name: "Viewer",

            message: message,

            createdAt: serverTimestamp()

        });

        commentInput.value = "";

    } catch (err) {

        console.error(err);

    }

}

// =====================
// Load Chat
// =====================

const chatQuery = query(chatRef, orderBy("createdAt", "asc"));

onSnapshot(chatQuery, (snapshot) => {

    chatBox.innerHTML = "";

    snapshot.forEach((doc) => {

        const data = doc.data();

        const div = document.createElement("div");

        div.className = "chat-message";
const name = document.createElement("b");
name.textContent = data.name + ": ";

div.appendChild(name);
div.appendChild(document.createTextNode(data.message));

        chatBox.appendChild(div);

    });

    chatBox.scrollTop = chatBox.scrollHeight;

});
// ======================================
// app.js (Part 4)
// Real-time Like System
// ======================================

// Like Document
const likeRef = doc(db, "live", "current");

// Like Count Load
onSnapshot(likeRef, (snapshot) => {

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    likeCount.textContent = data.likes || 0;

});

// Like Button

likeBtn.addEventListener("click", async () => {

    try {

        await updateDoc(likeRef, {

            likes: increment(1)

        });

        likeBtn.disabled = true;

        setTimeout(() => {

            likeBtn.disabled = false;

        }, 1500);

    } catch (err) {

        console.error(err);

    }

});
// ======================================
// app.js (Part 5)
// Fullscreen + Share
// ======================================

// Fullscreen
fullscreenBtn.addEventListener("click", async () => {

    try {

        if (!document.fullscreenElement) {

            await videoPlayer.requestFullscreen();

        } else {

            await document.exitFullscreen();

        }

    } catch (err) {

        console.error(err);

    }

});

// Share

shareBtn.addEventListener("click", async () => {

    const shareData = {
        title: displayTitle.textContent || "Live Stream",
        text: displayDesc.textContent || "Watch Live Stream",
        url: window.location.href
    };

    try {

        if (navigator.share) {

            await navigator.share(shareData);

        } else {

            await navigator.clipboard.writeText(window.location.href);

            alert("লিংক কপি হয়েছে");

        }

    } catch (err) {

        console.error(err);

    }

});

// ======================
// Initialization
// ======================

window.addEventListener("load", () => {

    videoOverlay.style.display = "flex";

    streamInfoOverlay.style.display = "none";

});
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        loginSection.style.display = "block";
        controlSection.style.display = "none";
        return;
    }

    try {
console.log("UID:", user.uid);

const userDoc = await getDoc(doc(db, "users", user.uid));

console.log("Exists:", userDoc.exists());
        if (!userDoc.exists() || userDoc.data().role !== "admin") {
            await signOut(auth);
            loginSection.style.display = "block";
            controlSection.style.display = "none";
            return;
        }

        loginSection.style.display = "none";
        controlSection.style.display = "block";

    } catch (error) {

        console.error(error);
        loginSection.style.display = "block";
        controlSection.style.display = "none";

    }

});