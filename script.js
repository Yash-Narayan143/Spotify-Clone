console.log("lets write some javascript");
let songs;
let currfolder;
function convertToMinuteSeconds(totalSeconds) {
    if(isNaN(totalSeconds) || totalSeconds < 0){
        return "00:00";
    }
    // Calculate minutes and seconds
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Pad the minutes and seconds with leading zeros if needed
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    return `${paddedMinutes}:${paddedSeconds}`;
}


async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    let songListHTML = '';
for (const song of songs) {
    songListHTML += `<li><img src="music.svg" alt="">
                         <div class="info">
                             <div>${song}</div>
                             <div>Yash</div>
                         </div>
                         <img src="play button.svg" alt=""></li>`;
}
songul.innerHTML = songListHTML;

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}
let currentsong = new Audio();
const playmusic = (track, pause = false) => {
    if (!currentsong.paused) {
        currentsong.pause();  // Pause the current song
    }
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {   
        currentsong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function displayalbums(){
    let a = await fetch(`http://127.0.0.1:3001/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let cardcontainer1 = document.querySelector(".cardcontainer1")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`http://127.0.0.1:3001/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            if(folder.includes("1")){
                cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="play button.svg" alt="">
                        </div>
                        <div class="circleimage">
                            <img src="/songs/${folder}/cover.jpg" alt="">
                        </div>
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div>`
            }else{
                cardcontainer1.innerHTML = cardcontainer1.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="play button.svg" alt="">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div>`
            }
        }
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click",async item=>{
                songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
                playmusic(songs[0])
            })
          });
    }
}
async function main() {
    await getsongs("songs/ncs")
    playmusic(songs[0],true)
    displayalbums()
    

    play.addEventListener("click",()=>{
        if(currentsong.paused){
            currentsong.play()
            play.src = "pause.svg"
        }else
        {
            currentsong.pause()
            play.src = "play.svg"
        }
    })
    currentsong.addEventListener("timeupdate",()=>{
        const duration = isNaN(currentsong.duration) ? 0 : currentsong.duration;
        document.querySelector(".songtime").innerHTML = `${convertToMinuteSeconds(currentsong.currentTime)} / ${convertToMinuteSeconds(duration)}`;
        
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration)*100 + "%";
    })
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = Math.round(percent) + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });
    
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left-box").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left-box").style.left = "-120%"
    })
    currentsong.addEventListener('ended', () => {
        play.src = "play.svg";
    });
    currentsong.addEventListener('loadedmetadata', () => {
        document.querySelector(".songtime").innerHTML = `00:00 / ${convertToMinuteSeconds(currentsong.duration)}`;
    });
      previous.addEventListener("click",()=>{
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index-1)>=0){
            playmusic(songs[index-1])
        }
      })  
      next.addEventListener("click",()=>{
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index+1)< songs.length){
            playmusic(songs[index+1])
        }
      })
      document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentsong.volume = parseInt(e.target.value)/100
        if(currentsong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
      })

      document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100;
        }
      })
      
}   
main()