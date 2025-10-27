const emailEl = document.getElementById("email");
const firstNameEl = document.querySelector(".first-name");
const lastNameEl = document.querySelector(".last-name");
const profileNameEl = document.querySelector(".profile-name");
const phoneNumEl = document.getElementById("phone-num");
const dobEl = document.getElementById("dob");
const accountNumEl = document.getElementById("acc-num");
const cardNumEl = document.getElementById("card-num");
const statusEl = document.getElementById("status");
const saveProfileBtnEl = document.getElementById("saveProfileBtn");
const textError = document.getElementById("text-error");
const uploadPicture = document.getElementById("upload-picture");
const picEl = document.getElementById("pic");
const logoutBtn = document.getElementById("logout");

let base64Image = "";
let currentProfileImage = "";
const userUID = localStorage.getItem("uid");

console.log(userUID);

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3abYaBPoY1MBuZ0Ob9jfFOkGcwS7s2Zs",
  authDomain: "wbee-bank.firebaseapp.com",
  projectId: "wbee-bank",
  storageBucket: "wbee-bank.firebasestorage.app",
  messagingSenderId: "562089693991",
  appId: "1:562089693991:web:b031edb912f5420e5fcf02",
};

// pin Error
const pinError = document.getElementById("pin-error-text");
const pinInp = document.getElementById("pinInp");

pinInp.addEventListener("input", () => {
  // console.log(typeof pinInp);
  if (pinInp.value.length <= 3 || pinInp.value.length >= 5) {
    return (pinError.textContent = "Pin should only include 4 digits!");
  } else {
    pinError.textContent = "";
  }
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const DB = getFirestore(app);
const usersColRef = collection(DB, "USERS");
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log(user);
    const docRef = doc(usersColRef, user.uid);
    const docSnapShot = await getDoc(docRef);
    const profileData = docSnapShot.data();
    console.log(profileData);
    // adding profile
    lastNameEl.value = `${profileData.lastName}`;
    firstNameEl.value = `${profileData.firstName}`;
    phoneNumEl.value = `${profileData.phoneNumber}`;
    dobEl.value = `${profileData.DateofBirth}`;
    profileNameEl.textContent = `${profileData.firstName}`;
    emailEl.value = `${profileData.email}`;
    cardNumEl.value = `${profileData.cardNumber}`;
    accountNumEl.value = `${profileData.accountNumber}`;
    // uploadPicture.file = profileData.profilePicture ;
    currentProfileImage = profileData.profilePicture || "";
    if (currentProfileImage) {
      picEl.src = currentProfileImage;
    }

    // console.log(saveProfilepic);

    // picEl.setAttribute("src", `${profileData.profilePicture}`);
    // picEl.src = `${profileData.profilePicture}`;
    // console.log(`${profileData.profilePicture}`);

    if (user.emailVerified == true) {
      statusEl.textContent = "Verified";
    } else {
      statusEl.textContent = "Not Verified";
      statusEl.className = "text-red-500";
    }
  } else {
    alert("Session Expired, Redirecting....");
    window.location.href = "./signin.html";
  }
});
// Upload Picture
// localDiv.addEventListener("change", (e) => {
//   clicker = URL.createObjectURL(e.target.files[0]);
//   imgPreview.setAttribute("src", clicker);
//   console.log(clicker);
// });
// let profilePic;
// uploadPicture.addEventListener("change", (e) => {
//   profilePic = URL.createObjectURL(e.target.files[0]);
//   if (!profilePic) return;
//   const reader = new FileReader();
//   reader.onload = (read) => {
//     picEl.src = read.target.result;
//     picEl.dataset.base64 = read.target.result;
//   };
//   reader.readAsDataURL(profilePic);
//   console.log(profilePic);
// });
// console.log(profilePic);

uploadPicture.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (ev) => {
    base64Image = ev.target.result; // store base64
    picEl.src = base64Image; // preview image
    console.log("Base64 image ready:", base64Image.slice(0, 30) + "...");
  };

  reader.readAsDataURL(file); // converts to base64
});

saveProfileBtnEl.addEventListener("click", async () => {
  const newProfileData = {
    // firstName: firstNameEl.value,
    firstName: firstNameEl.value,
    lastName: lastNameEl.value,
    email: emailEl.value,
    phoneNumber: phoneNumEl.value,
    DateofBirth: dobEl.value,
    profilePicture: base64Image || currentProfileImage,
    cardNumber: cardNumEl.value,
    accountNumber: accountNumEl.value,
    pin: pinInp.value,
  };
  // console.log(profilePic);
  console.log(base64Image);

  // console.log("Updating...");

  if (firstNameEl.value == "" || lastNameEl.value == "") {
    alert("Name Fields must not be empty");

    return;
  } else {
    try {
      textError.textContent = "";

      saveProfileBtnEl.classList.add("cursor-progress");
      saveProfileBtnEl.textContent = "Updating Changes...";
      const docRef = doc(usersColRef, userUID);
      await updateDoc(docRef, newProfileData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.log(error);
      if (error) {
        console.log(error.code);
        const errorCode = error.code;
        if (errorCode === "invalid-argument") {
          textError.textContent =
            "Error! Profile picture should not be bigger that 1mb";
        } else {
          textError.textContent = "Error, Failed to save changes";
          return;
        }
      }
    } finally {
      saveProfileBtnEl.textContent = "Save Changes";
      saveProfileBtnEl.classList.remove("cursor-progress");
    }
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("uid");
  alert("Session Expired, Redirecting....");
  window.location.href = "./signin.html";
});
