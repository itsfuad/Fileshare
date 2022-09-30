console.log('loaded js');

const studentID = document.getElementById('sId');
const err = document.querySelector('.err');

const regex = /22-([\d]{5})-3/g;

function errCheck(id){
    if (id == ""){
        err.textContent = "*Id is empty!*";
        err.classList.add('shake');
        setTimeout(()=>{
            err.classList.remove('shake');
        }, 1000);
        return false;
    }
    if(!navigator.onLine){
        console.log("No internet");
        err.textContent = "*No internet*";
        err.classList.add('shake');
        setTimeout(()=>{
            err.classList.remove('shake');
        }, 1000);
        return false;
    }
    if (regex.test(id)){
        console.log("Access Granted");
        err.textContent = "";
        err.classList.remove('shake');
        return true;
    }else{
        err.textContent = "*Invalid Or Unauthorised!*";
        err.classList.add('shake');
        setTimeout(()=>{
            err.classList.remove('shake');
        }, 1000);
        return false;
    }
}

function validate(){
    //console.log(studentID.value);
    return errCheck(studentID.value);
}