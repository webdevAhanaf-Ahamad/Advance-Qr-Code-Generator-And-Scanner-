function showToast(message, type = "success"){
  let container= document.getElementById('toast-container');
  let toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast)
  setTimeout(() => {
    toast.classList.add('toastOut')
    setTimeout(() => {
      toast.remove()
    }, 600);
  }, 3000);
}
window.onload = function(){
  if(!localStorage.getItem("uuid")){
    showToast("অনুগ্রহ করে রেজিস্ট্রেশন করুন", "error")
    showSignup();
  } else {
    
    document.getElementById('authSect').classList.add('hidden');
    document.getElementById('qrSect').classList.remove('hidden');
  }
}
function showLogin(){
  document.getElementById('signUpAuth').classList.add('hidden');
  document.getElementById('loginAuth').classList.remove('hidden');
}
function showSignup(){
  document.getElementById('loginAuth').classList.add('hidden');
  document.getElementById('signUpAuth').classList.remove('hidden');
}
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const urlDb = "https://script.google.com/macros/s/AKfycbwGoO7BlleLsmELZRjFMQ1ibITUBAVWKZc6We6sSPdMHH3GpwDxIttLTX7_JLDNb10GDg/exec"

signupForm.addEventListener("submit", function(e){
  e.preventDefault()
  const s_name = document.getElementById('s_name').value;
  const s_num = document.getElementById('s_num').value;
  const s_email = document.getElementById('s_email').value;
  const s_pass = document.getElementById('s_pass').value;
  const s_btn = document.getElementById('s_btn');
  const originalText = s_btn.innerHTML;
  s_btn.disabled = true;
  s_btn.innerHTML = `<span><div class="spinner"></div> অপেক্ষা করুন...</span>`
  const userData = {
    action: "signup",
    name: s_name,
    email: s_email,
    number: s_num,
    password: s_pass,
  }
  fetch(urlDb, {
    method: "POST",
    body: JSON.stringify(userData),
  })
  .then(res => res.json())
  .then(response =>{
    if(response.result === "success"){
      showToast(response.message)
      showLogin();
    } else{
      showToast("ব্যর্থ : " + response.message, "error")
    }
  })
  .finally(()=>{
    s_btn.disabled = false;
    s_btn.innerHTML = originalText;
  })
})
loginForm.addEventListener("submit", function(e){
  e.preventDefault()
  const l_email = document.getElementById('l_email').value;
  const l_pass = document.getElementById('l_pass').value;
  const l_btn = document.getElementById('l_btn');
  const originalText2 = l_btn.innerHTML;
  l_btn.disabled = true;
  l_btn.innerHTML = `<div class="spinner"></div> অপেক্ষা করুন...`
  const loginData = {
    action: "login",
    email: l_email,
    password: l_pass,
  }
  localStorage.setItem("useE", l_email)
  fetch(urlDb, {
    method: "POST",
    body: JSON.stringify(loginData),
  })
  .then(res => res.json())
  .then(response =>{
    if(response.result === "success"){
      showToast(response.message)
      localStorage.setItem("uuid", "AKfycbwGoO7BlleLsmELZRjFMQ1ibITUBAVWKZc6We6sSPdMHH3GpwDxIttLTX7_JLDNb10GDg")
      setTimeout(() => {
        window.location.reload()
      }, 1000);
    } else{
      showToast("ব্যর্থ : " + response.message, "error")
      localStorage.clear()
    }
  })
  .catch((error) => {
    showToast("সার্ভার এর সমস্যা অথবা নেটওয়ার্ক ক্রটি", "error")
    localStorage.clear()
  })
  .finally(()=>{
    l_btn.disabled = false;
    l_btn.innerHTML = originalText2;
  })
})

const qrText = document.getElementById('qrText');
const qrColor = document.getElementById('qrColor');
const qrSize = document.getElementById('qrSize');
const genBtn = document.getElementById('genBtn');
const downloadBtn = document.getElementById('downloadBtn');
const qrContainer = document.getElementById('qrcode');

let qrcode = null;


genBtn.addEventListener('click', () => {
  const text = qrText.value.trim();
  
  if (!text) {
    showToast("দয়া করে কিছু টেক্সট বা লিঙ্ক দিন!", "error");
    return;
  }


  genBtn.disabled = true;
  genBtn.innerHTML = `<div class="spinner"></div> তৈরি হচ্ছে...`;


  qrContainer.innerHTML = "";
  

  setTimeout(() => {
    qrcode = new QRCode(qrContainer, {
      text: text,
      width: parseInt(qrSize.value),
      height: parseInt(qrSize.value),
      colorDark: qrColor.value,
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    genBtn.disabled = false;
    genBtn.innerHTML = "জেনারেট করুন";
    downloadBtn.classList.remove('hidden'); 
    showToast("কিউআর কোড তৈরি হয়েছে!");
  }, 500);
});


downloadBtn.addEventListener('click', () => {
  
  const canvas = qrContainer.querySelector('canvas');
  const img = qrContainer.querySelector('img');

  if (canvas) {
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_Code_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      
      URL.revokeObjectURL(url);
    }, 'image/png');
  } else if (img && img.src) {

    const link = document.createElement('a');
    link.href = img.src;
    link.download = `QR_Code_${Date.now()}.png`;
    link.click();
  } else {
    showToast("ডাউনলোড করতে সমস্যা হচ্ছে!", "error");
  }
});
 
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', ()=>{
  localStorage.clear();
  showToast("সফলভাবে  লগআউট!")
  window.location.reload(true);
})
let codeReader = null;

async function showScanner() {
  const qrScanSection = document.getElementById('qrCodeScan');
  qrScanSection.classList.remove('hidden');

  // ZXing Reader Initialize
  codeReader = new ZXing.BrowserQRCodeReader();
  const videoElement = document.getElementById('video');

  try {
    // ক্যামেরা পারমিশন ও ভিডিও স্ট্রিম শুরু
    const result = await codeReader.decodeFromVideoDevice(undefined, videoElement, (result, err) => {
      if (result) {
        console.log("Decoded Text:", result.text);
        alert("ফলাফল: " + result.text);
        
        // যদি URL হয় তবে ওপেন হবে
        if(result.text.startsWith('http')){
            window.open(result.text, '_blank');
        }
        
        hideScanner(); // স্ক্যান হয়ে গেলে বন্ধ হবে
      }
    });
  } catch (err) {
    console.error(err);
    showToast("ক্যামেরা ওপেন করতে সমস্যা হচ্ছে!", "error");
  }
}

function hideScanner() {
  if (codeReader) {
    codeReader.reset(); // ক্যামেরা বন্ধ করার জন্য এটি জরুরি
  }
  document.getElementById('qrCodeScan').classList.add('hidden');
}