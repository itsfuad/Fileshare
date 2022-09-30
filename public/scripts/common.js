console.log("common.js loaded");

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

if ('serviceWorker' in navigator){
    window.addEventListener('load', () => {
        navigator.serviceWorker
        .register('sw-fileshare-1.js?v=5')
        .then(reg => console.log("Service Worker Registered"))
        .catch(err => console.log(`Service Worker: Error ${err}`));
    });
}