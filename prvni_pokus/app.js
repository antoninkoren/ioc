const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('nav ul li');

menuToggle.addEventListener('click',()=> sidebar.classList.toggle('open'));
navItems.forEach(item=>{
    item.addEventListener('click', ()=>{
        const viewId = item.dataset.view;
        views.forEach(v=>v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        sidebar.classList.remove('open');
        if(viewId==='history') loadHistory();
    });
});

// --- QR Scanner ---
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let scanOutput = document.getElementById('scanOutput');
let scanning = false;
let scanData = [];

document.getElementById('startScan').addEventListener('click', ()=>{
    if(scanning) return;
    scanning = true;
    startCamera();
});

function startCamera(){
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream=>{
        video.srcObject = stream;
        requestAnimationFrame(scanFrame);
    })
    .catch(err=>{
        scanOutput.textContent = "Nelze spustit kameru: "+err;
    });
}

function scanFrame(){
    if(!scanning) return;
    if(video.readyState===video.HAVE_ENOUGH_DATA){
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video,0,0,canvas.width,canvas.height);
        const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        const code = jsQR(imageData.data,imageData.width,imageData.height);
        if(code){
            const timestamp = new Date().toLocaleTimeString();
            scanOutput.textContent = `Naskenováno: ${code.data}`;
            scanData.push({data:code.data,time:timestamp});
            saveScanData();
        }
    }
    requestAnimationFrame(scanFrame);
}

// --- Historie ---
function saveScanData(){
    localStorage.setItem('scanHistory',JSON.stringify(scanData));
}

function loadHistory(){
    const list = document.getElementById('historyList');
    list.innerHTML='';
    const data = JSON.parse(localStorage.getItem('scanHistory')||'[]');
    data.forEach(item=>{
        const li = document.createElement('li');
        li.textContent=`${item.time} – ${item.data}`;
        list.appendChild(li);
    });
}