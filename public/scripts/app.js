console.log('app.js loaded');

const uploadBtn = document.getElementById('upload');
const fileSelector = document.getElementById('file');
const progressDisplay = document.getElementById('percent');

uploadBtn.addEventListener('click', () => {
    if (fileSelector.files.length > 0){
        console.log('uploading...');


        const file = fileSelector.files[0];
        const formData = new FormData();

        formData.append('file', file);
        //upload image via xhr request
        let xhr = new XMLHttpRequest();
        //send file via xhr post request
        xhr.open('POST', `${location.origin}/api/files`, true);
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                //progress
                progress = (e.loaded / e.total) * 100;
                progressDisplay.textContent = `${progress}%`;
                document.querySelector(':root').style.setProperty('--percent', `${progress}%`);
            }
        };

        xhr.onload = function(e) {
            if (this.status == 200) {                
                const file = JSON.parse(e.target.response).file;
                //do stuff
                console.log(`/download/${file}`);
                document.getElementById('container1').style.display = 'none';
                document.getElementById('container1').classList.add('hide');

                document.getElementById('container2').style.display = 'flex';
                document.getElementById('container2').classList.add('show');
                generateQRcode(`${location.origin}${file}`);
            }
            else{
                //error
                console.log('Error');
            }
        }
        xhr.send(formData);
    }
})

function generateQRcode(data){
    console.log(`Making qr code with: ${data}`);
    let qrcode = new QRCode(document.getElementById("qrcode"), {
        text: data,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    return qrcode;
}