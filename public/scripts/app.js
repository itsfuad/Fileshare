console.log('app.js loaded');

const uploadBtn = document.getElementById('upload');
const fileSelector = document.getElementById('file');
const progressDisplay = document.getElementById('percent');
const progressContainer = document.querySelector('.progress');
const output = document.querySelector('.out');
const container1 = document.getElementById('container1');
const container2 = document.getElementById('container2');

const err = document.querySelector('.err');

uploadBtn.addEventListener('click', () => {
    if (fileSelector.files.length > 0){

        if (fileSelector.files[0].size > 15728640){
            console.log("File must be within 15 mb");
            popupMessage('File must be within 15 mb');
            err.textContent = "";
            err.classList.remove('shake');

            err.textContent = "*File must be within 15 mb*";
            err.classList.add('shake');
            setTimeout(()=>{
                err.classList.remove('shake');
            }, 1000);
            return;
        }else{
            console.log("Ready to upload");
            err.textContent = "";
            err.classList.remove('shake');
        }


        console.log('uploading...');

        resetForm();

        const file = fileSelector.files[0];
        const formData = new FormData();

        hideElem(container1);
        showElem(container2);

        formData.append('file', file);
        //upload image via xhr request
        let xhr = new XMLHttpRequest();
        //send file via xhr post request
        xhr.open('POST', `${location.origin}/api/files`, true);
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                //document.getElementById('container1').style.display = 'none';

                //progress
                let progress = Math.floor((e.loaded / e.total) * 100);
                progressDisplay.textContent = `${progress}%`;
                document.querySelector(':root').style.setProperty('--percent', `${progress}%`);
            
            }
        };

        xhr.onload = function(e) {
            if (this.status == 200) {                
                const res = JSON.parse(e.target.response);
                const file = res.file;
                const size = res.metadata.filesize;
                //do stuff
                console.log(`/download/${file}/${size}`);
                generateQRcode(`${location.origin}/download/${file}/${size}`);
                document.getElementById('copyLink').dataset.link = `${location.origin}/download/${file}/${size}`;

                hideElem(progressContainer);
                showElem(output);
            }
            else{
                //error
                console.log('Error');
                popupMessage('Error Occured!');
                resetForm();
            }
        }
        xhr.send(formData);
    }
})

function showElem(elem){
    elem.style.display = 'flex';
    setTimeout(() => {
        elem.classList.add('active');
    }, 100);
}

function hideElem(elem){
    elem.classList.remove('active');
    setTimeout(() => {
        elem.style.display = 'none';
    }, 100);
}

function generateQRcode(data){
    console.log(`Making qr code with: ${data}`);
    while (document.getElementById("qrcode").firstChild){
        document.getElementById("qrcode").removeChild(document.getElementById("qrcode").firstChild);
    }
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

const link = document.getElementById('copyLink');
link.addEventListener('click', () => {
    copyText(link.dataset.link);
});

document.getElementById('reupload').addEventListener("click", () => {
    resetForm();
});

function resetForm(){
    showElem(container1);
    hideElem(container2);
    hideElem(output);
    showElem(progressContainer);
}


function copyText(text){
    if (text != null){
        if (!navigator.clipboard){
            popupMessage(`This browser does't support clipboard access`);
            return;
        }
        navigator.clipboard.writeText(text);
        console.log(text);
        popupMessage(`Copied to clipboard`);
    }
}

function popupMessage(text){
    //$('.popup-message').text(text);
    document.querySelector('.popup-message').textContent = text;
    //$('.popup-message').fadeIn(500);
    document.querySelector('.popup-message').classList.add('active');
    setTimeout(function () {
        //$('.popup-message').fadeOut(500);
        document.querySelector('.popup-message').classList.remove('active');
    }, 1000);
}