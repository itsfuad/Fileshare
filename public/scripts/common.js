console.log("common.js loaded");

const clickSound = new Audio('/audio/click.mp3');

if (!navigator.onLine){
    console.log('offline'); 
    document.querySelector('.offline').textContent = 'You are offline!';
    document.querySelector('.offline').classList.add('active');
    document.querySelector('.offline').style.background = 'orangered';
}

window.addEventListener('offline', function(e) { 
    console.log('offline'); 
    document.querySelector('.offline').textContent = 'You are offline!';
    document.querySelector('.offline').classList.add('active');
    document.querySelector('.offline').style.background = 'orangered';
});

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

window.addEventListener('online', function() {
    console.log('Back to online');
    document.querySelector('.offline').textContent = 'Back to online!';
    document.querySelector('.offline').style.background = 'limegreen';
    setTimeout(() => {
        document.querySelector('.offline').classList.remove('active');
    }, 1500);
});

document.querySelectorAll('.clickable').forEach(elem => {
    elem.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play();
    });
});

if ('serviceWorker' in navigator){
    window.addEventListener('load', () => {
        //if service worker is already registered, it will be ignored
        if (navigator.serviceWorker.controller){
            console.log('%cService Worker already registered', 'color: orange');
            return;
        }
        navigator.serviceWorker
        .register('sw-fileshare-1.js?v=5')
        .then(reg => console.log("%cService Worker Registered", 'color: limegreen'))
        .catch(err => console.log(`Service Worker: Error ${err}`));
    });
}