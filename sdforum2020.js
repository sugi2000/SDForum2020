let videos = {};
let items = {};
let player = {};
let opened = {};
let viewed = {};
let ready = false;
let originURL = location.protocol + '//' + location.hostname + (location.port != "" ? ":" + location.port : "");
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
function onYouTubeIframeAPIReady() {
    console.log("onYouTubeIframeAPIReady");
    fetch(videoJson)
        .then(response => response.json())
        .then(data => {
            videos = data.depertment;
            items = data.faculty;
            let showLaboVideo = (faculty) => {
                videos[faculty].forEach((v) => {
                    console.log("V YOUTUBE:", v.youtube);
                    if (v.youtube == "") { return; }
                    let tpl = document.getElementById('card-template').querySelector('ui').cloneNode(true);
                    tpl.querySelector('.labo-video').id = v.youtube;
                    tpl.querySelector('.labo-video').style.backgroundImage = "url(https://img.youtube.com/vi/" + v.youtube + "/sddefault.jpg)";
                    tpl.querySelector('.labo-video').addEventListener('click', (e) => {
                        e.stopPropagation();
                        console.log('Click:', e.currentTarget.id);
                        if (!viewed.hasOwnProperty(e.currentTarget.id)) {
                            let originURL = location.protocol + '//' + location.hostname + (location.port != "" ? ":" + location.port : "");
                            viewed[e.currentTarget.id] = new YT.Player(e.currentTarget.id, {
                                videoId: e.currentTarget.id,
                                width: "600px",
                                playerVars: {
                                    rel: 0,
                                    'enablejsapi': 1,
                                    'origin': originURL
                                },
                                events: {
                                    'onReady': (e) => {
                                        e.target.playVideo();
                                    }
                                }
                            });
                        }

                    });
                    tpl.querySelector('.labo-name').innerText = v.name;
                    tpl.querySelector('.labo-position').innerText = v.position;
                    tpl.querySelector('.labo-title').innerText = v.title;
                    tpl.querySelector('.labo-keyword').innerText = v.keyword;
                    tpl.querySelector('.labo-face').src = v.picture;
                    document.querySelector('section.' + faculty + ' ul.labos').appendChild(tpl);
                });
            }
            let showVideo = (faculty, ignoreLaboVideo = false, callback = function(){ }) => {
                document.querySelectorAll('.menuitem').forEach((ele) => { ele.classList.add('kurukuru') });
                let originURL = location.protocol + '//' + location.hostname + (location.port != "" ? ":" + location.port : "");
                player[faculty] = new YT.Player('player_' + faculty, {
                    videoId: items[faculty],
                    width: "600px",
                    playerVars: {
                        rel: 0,
                        'enablejsapi': 1,
                        'origin': originURL
                    }, events: {
                        'onReady': () => {
                            document.querySelectorAll('.menuitem').forEach((ele) => { ele.classList.remove('kurukuru') });
                            if (!ignoreLaboVideo && !opened.hasOwnProperty(faculty) && videos.hasOwnProperty(faculty)) {
                                showLaboVideo(faculty);
                                opened[faculty] = true;
                            }
                            callback();
                        }
                    }
                });
            }
            document.querySelector('.video').addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelector('#mode').checked = !document.querySelector('#mode').checked;
                if (document.querySelector('#mode').checked) {
                    Object.keys(player).forEach((p) => {
                        player[p].pauseVideo();
                    });
                }
                Object.keys(items).forEach((p) => {
                    if (document.querySelector('.videoselector.' + p).checked) {
                        if (document.querySelector('#mode').checked) {
                            player[p].pauseVideo();
                        } else {
                            player[p].playVideo();
                        }
                    }
                });
            }, false);
            document.querySelectorAll('.menuitem').forEach((ele) => {
                ele.addEventListener('click', function (e) {
                    e.stopPropagation();
                    history.pushState('', '', "#" + faculty);
                    let faculty = this.getAttribute('x-item');
                    console.log(faculty);
                    if (!opened.hasOwnProperty(faculty) && videos.hasOwnProperty(faculty)) {
                        showLaboVideo(faculty);
                        opened[faculty] = true;
                    }
                    document.querySelector('.' + faculty + '[type=radio]').checked = true;
                    Object.keys(items).forEach(p => {
                        if (player.hasOwnProperty(p)) {
                            console.log("pause " + p);
                            console.log(player[p]);
                            player[p].pauseVideo();
                        }
                    });
                    
                });
            }, false);
            let defFaculty = (location.hash == "") ? "sd" : location.hash.replace(/^\#/, '');
            document.querySelector('.' + defFaculty + '[type=radio]').checked = true;
            showVideo(defFaculty, false, () => {
                Object.keys(items).forEach((faculty) => {
                    if (defFaculty != faculty) {
                        showVideo(faculty, true);
                    }
                });
            });

            ready = true;
        });
}
