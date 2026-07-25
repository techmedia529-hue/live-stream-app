// ===============================
// Player Variables
// ===============================

let hls = null;

const video = document.getElementById("videoPlayer");
const youtube = document.getElementById("youtubePlayer");

const overlay = document.getElementById("videoOverlay");
const offline = document.getElementById("offlineScreen");


// ===============================
// Debug Video Loading
// ===============================
if(video){

    video.addEventListener("loadeddata", ()=>{

        console.log(
            "Video data loaded",
            video.readyState
        );

    });

}
// ------------------------------
// Loading Overlay
// ------------------------------

function showLoading() {
    if (overlay) overlay.style.display = "flex";
}

function hideLoading() {
    if (overlay) overlay.style.display = "none";
}

// ------------------------------
// Offline Screen
// ------------------------------

function showOffline() {
    if (offline) offline.style.display = "flex";
}

function hideOffline() {
    if (offline) offline.style.display = "none";
}

// ------------------------------
// Stop Current Player
// ------------------------------

function stopPlayer() {

    if (hls) {
        hls.destroy();
        hls = null;
    }

    if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.style.display = "block";
    }

    if (youtube) {
        youtube.src = "";
        youtube.style.display = "none";
    }

}

// ------------------------------
// MP4 Player
// ------------------------------

function playMP4(url) {

    console.log("playMP4:", url);

    stopPlayer();

    video.src = url;

    video.play().catch(err => {
        console.log("Autoplay blocked:", err);
    });

}

// ===============================
// HLS Player
// ===============================

function playHLS(url) {

    console.log("playHLS:", url);


    // Destroy previous HLS
    if (hls) {

        hls.destroy();
        hls = null;

    }



    if (Hls.isSupported()) {


        hls = new Hls({

            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90

        });



        hls.loadSource(url);

        hls.attachMedia(video);



        // ===============================
        // Manifest Loaded
        // ===============================

        hls.on(
            Hls.Events.MANIFEST_PARSED,
            () => {


                console.log(
                    "HLS manifest loaded"
                );


                console.log(
                    "Video readyState:",
                    video.readyState
                );
// Mobile autoplay settings

video.muted = true;
video.autoplay = true;
video.playsInline = true;


setTimeout(() => {

    video.play()

    .then(() => {

        console.log(
            "Video playing"
        );

    })

    .catch(err => {

        console.log(
            "Play failed:",
            err
        );


        setTimeout(() => {

            video.play()

            .then(() => {

                console.log(
                    "Retry play success"
                );

            })

            .catch(error => {

                console.log(
                    "Retry play failed:",
                    error
                );

            });


        }, 3000);


    });


}, 500);


            }
        );


// ===============================
// HLS Error Handler
// ===============================
        hls.on(
            Hls.Events.ERROR,
            (event,data)=>{


                console.log(
                    "HLS ERROR TYPE:",
                    data.type
                );


                console.log(
                    "HLS ERROR DETAILS:",
                    data.details
                );


                console.log(
                    "HLS FATAL:",
                    data.fatal
                );


                console.log(
                    "HLS FULL DATA:",
                    data
                );



                if(!data.fatal){

                    return;

                }




                switch(data.type){



                    case Hls.ErrorTypes.NETWORK_ERROR:


                        console.log(
                            "Retry Network"
                        );


                        if(hls){

                            hls.startLoad();

                        }


                        break;




                    case Hls.ErrorTypes.MEDIA_ERROR:


                        console.log(
                            "Recover Media Error"
                        );


                        if(hls){

                            hls.recoverMediaError();

                        }


                        break;




                    default:


                        console.log(
                            "Fatal HLS Error"
                        );


                        if(hls){

                            hls.destroy();

                            hls = null;

                        }


                        break;


                }



            }
        );



    }




    // ===============================
    // Safari Native HLS
    // ===============================

    else if(
        video.canPlayType(
            "application/vnd.apple.mpegurl"
        )
    ){


        console.log(
            "Using Native HLS"
        );



        video.src = url;


        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;



        video.play()

        .then(()=>{


            console.log(
                "Native HLS playing"
            );


            hideLoading();



        })

        .catch(err=>{


            console.log(
                "Native autoplay blocked:",
                err
            );


            hideLoading();



        });



    }


    else {


        console.log(
            "HLS not supported"
        );


        hideLoading();


    }


}

// ------------------------------
// YouTube Player
// ------------------------------

function playYouTube(embedUrl) {

    console.log("playYouTube:", embedUrl);

    stopPlayer();
if (video) video.style.display = "none";

if (youtube) {
    youtube.style.display = "block";
    youtube.src = embedUrl;
}

    setTimeout(hideLoading, 3000);

}

// ------------------------------
// Auto Detect Stream Type
// ------------------------------

export function loadStream(url) {

    console.log("loadStream:", url);

    showLoading();
    hideOffline();

    if (!url) {
        hideLoading();
        showOffline();
        return;
    }

    if (
        url.includes("youtube.com") ||
        url.includes("youtu.be")
    ) {

        const id = extractYouTubeID(url);

        if (id) {

            playYouTube(
                `https://www.youtube.com/embed/${id}?autoplay=1`
            );

        } else {

            hideLoading();
            showOffline();

        }

    }

    else if (url.includes(".m3u8")) {

        playHLS(url);

    }

    else {

        playMP4(url);

    }

    video.onplaying = () => {
        hideLoading();
    };

}

// ------------------------------
// Extract YouTube ID
// ------------------------------

function extractYouTubeID(url) {

    try {

        if (url.includes("youtu.be")) {

            return url
                .split("/")
                .pop()
                .split("?")[0];

        }

        const parsed = new URL(url);

        if (parsed.pathname.includes("/live/")) {

            return parsed.pathname
                .split("/live/")[1]
                .split("?")[0];

        }

        return parsed.searchParams.get("v");

    }

    catch {

        return "";

    }

}
