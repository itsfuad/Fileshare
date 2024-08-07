console.log('app.js loaded');

const uploadBtn = document.getElementById('upload');
const fileSelector = document.getElementById('file');
const progressDisplay = document.getElementById('percent');
const progressContainer = document.querySelector('.progress');
const output = document.querySelector('.out');
const container1 = document.getElementById('container1');
const container2 = document.getElementById('container2');
const title = document.getElementById('title');
const fileDropZone = document.getElementById('drop_zone');
const downloadBtn = document.getElementById('download');
const err = document.querySelector('.err');

uploadBtn.addEventListener('click', async (evt) => {
    evt.preventDefault();
    if (fileSelector.files.length > 0){

        const fileSizeLimit = 100 * 1024 * 1024; //100MB

        if (fileSelector.files[0].size > fileSizeLimit){
            console.log("File must be within 100 mb");
            popupMessage('File must be within 100 mb');
            err.textContent = "";
            err.classList.remove('shake');

            err.textContent = "*File must be within 100 mb*";
            err.classList.add('shake');
            setTimeout(()=>{
                err.classList.remove('shake');
            }, 1000);
            return;
        }else if(!navigator.onLine){
            console.log("No internet");
            popupMessage('No internet');
            err.textContent = "";
            err.classList.remove('shake');

            err.textContent = "*No internet*";
            err.classList.add('shake');
            setTimeout(()=>{
                err.classList.remove('shake');
            }, 1000);
            return;
        }else{
            err.textContent = "";
            err.classList.remove('shake');
        }

        title.textContent = "Uploading...";
        
        const file = fileSelector.files[0];
        const formData = new FormData();
    
        hideElem(container1);
        showElem(container2);
        showElem(progressContainer);

        formData.append('file', file);
        //upload image via xhr request
        let xhr = new XMLHttpRequest();
        //send file via xhr post request
        xhr.open('POST', `${location.origin}/api/f`, true);
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {


                let progress = Math.floor((e.loaded / e.total) * 100);
                progressDisplay.textContent = `${progress}%`;
                document.querySelector(':root').style.setProperty('--percent', `${progress}%`);
            
            }
        };

        xhr.onload = function(e) {
            if (this.status == 200) {                
                const res = JSON.parse(e.target.response);
                const file = res.file;
                //do stuff
                generateQRcode(`${location.origin}/d/${file}`);
                document.getElementById('copyLink').dataset.link = `${location.origin}/d/${file}`;
                document.getElementById('fileIdNum').textContent = file;
                hideElem(progressContainer);
                showElem(output);
                title.textContent = "File uploaded";
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
    while (document.getElementById("qrcode").firstChild){
        document.getElementById("qrcode").removeChild(document.getElementById("qrcode").firstChild);
    }
    let qrcode = new QRCode(document.getElementById("qrcode"), {
        text: data,
        width: 200,
        height: 200,
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

downloadBtn.addEventListener('click', () => {
    const fileId = document.getElementById('recieveFileId').value;
    if (fileId == ''){
        popupMessage('Enter a file id');
        return;
    }

    //no problem with file id
    //open new window with '/d/:id'
    window.open(`${location.origin}/d/${fileId}`, '_blank');
});

function resetForm(){

    let filemeta = document.querySelector('.filemeta');
    filemeta.querySelector('.filename .name').textContent = "";
    filemeta.querySelector('.filesize .size').textContent = "";
    filemeta.style.display = 'none';
    filemeta.classList.add('hidden');
    fileDropZone.style.outline = '2px dashed #f1f1f17d';

    document.querySelector('.chooser').style.display = 'flex';
    setTimeout(() => {
        document.querySelector('.chooser').classList.remove('hidden');
    }, 100);

    title.innerHTML = `File Sharing Portal
    <div style="font-size: 0.8rem;">Files will be deleted after 30 minutes</div>`;
    showElem(container1);
    hideElem(container2);
    hideElem(output);
    showElem(progressContainer);
    container1.reset();
}

function copyText(text){
    if (text != null){
        if (!navigator.clipboard){
            popupMessage(`This browser does't support clipboard access`);
            return;
        }
        navigator.clipboard.writeText(text);
        popupMessage(`Copied to clipboard`);
    }
}

function popupMessage(text){
    
    document.querySelector('.popup-message').textContent = text;
   
    document.querySelector('.popup-message').classList.add('active');
    setTimeout(function () {
       
        document.querySelector('.popup-message').classList.remove('active');
    }, 1000);
}

fileSelector.addEventListener('change', evt => {
    readyToUpload();
});

function readyToUpload(){
    let filename = fileSelector.files[0].name.length > 10 ? fileSelector.files[0].name.substr(0, 10) + "." + fileSelector.files[0].name.split('.').pop() : fileSelector.files[0].name;
    let filesize = fileSelector.files[0].size;
    if (filesize < 1024){
        filesize = filesize + 'b';
    }else if (filesize < 1048576){
        filesize = (filesize/1024).toFixed(1) + 'kb';
    }else{
        filesize = (filesize/1048576).toFixed(1) + 'mb';
    }

    document.querySelector('.chooser').style.display = 'none';
    document.querySelector('.chooser').classList.add('hidden');
    
    if (fileSelector.files.length > 0){

        fileDropZone.style.outline = '0px';
    }else{
        fileDropZone.style.outline = '2px dashed #f1f1f17d';
    }

    let filemeta = document.querySelector('.filemeta');
    filemeta.querySelector('.filename .name').textContent = filename;
    filemeta.querySelector('.filesize .size').textContent = filesize;
    filemeta.style.display = 'block';
    setTimeout(() => {
        filemeta.classList.remove('hidden');
    }, 40);
}

let insideTarget;

fileDropZone.addEventListener("dragover", evt => {
    insideTarget = true;
});

fileDropZone.addEventListener("dragleave" , evt => {
    insideTarget = false;
});


let timeoutObj;

window.addEventListener('dragover', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    fileDropZone.classList.add('active');
    fileDropZone.style.outline = '2px dashed #f1f1f17d';
    fileDropZone.style.background = '#00000052';

    if (insideTarget){

        fileDropZone.style.outline = '2px dashed #4598ff';
        if (timeoutObj) {
            clearTimeout(timeoutObj);
        }
    }else{
        fileDropZone.style.outline = '2px dashed #f1f1f17d';
        document.querySelector('.chooser').classList.remove('focus');
        if (timeoutObj) {
            clearTimeout(timeoutObj);
        }
    }
    timeoutObj = setTimeout(() => {
        fileDropZone.classList.remove('active');
        fileDropZone.style.background = 'transparent';
        if (fileSelector.files.length > 0){
            fileDropZone.style.outline = '0px';
        }else{
            fileDropZone.style.outline = '2px dashed #f1f1f17d';
            document.querySelector('.chooser').classList.remove('focus');
        }
    }, 100);
});


window.addEventListener('drop', (evt) => {
    evt.preventDefault();
    fileDropZone.classList.remove('active');
    if (insideTarget){
        if (evt.dataTransfer.files.length > 0){

            fileSelector.files = evt.dataTransfer.files;
            readyToUpload();
        }
    }
});

window.addEventListener('paste', (e) => {
    if (e.clipboardData) {

        if (e.clipboardData.files.length > 0){
            fileSelector.files = e.clipboardData.files;
            readyToUpload();
        }
    }
});