const pageContent = document.getElementById("pagecontent");
const profileIconEl = document.querySelectorAll(".profile-icon");
const closeIconEl = document.getElementById("close-icon");
const miniProfileDrop = document.getElementById("miniprofiledrop");
const accountNumberEl = document.getElementById("account-num");
const cardNumberEl = document.getElementById("card-num");
const verifiedStatus = document.getElementById("verified-status");
const transactionDisplayEl = document.getElementById("transactionDisplay");
const nameDisplay = document.getElementById("acc-confirm-name");
const transferAccName = document.getElementById("transferAcc");

const picEl = document.querySelectorAll(".profile-pic");

let profileData;
let accountHolderNameEl = document.querySelectorAll(".accountHolderName");

profileIconEl.forEach((el) => {
  el.addEventListener("click", () => {
    miniProfileDrop.classList.remove("hidden");
    pageContent.classList.add("blur-[2px]", "brightness-50");
  });
});

// Firebase start

// Import the functions you need from the SDKs you need
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
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const DB = getFirestore(app);
const usersColRef = collection(DB, "USERS");

let userUID;
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userUID = user.uid;
    localStorage.setItem("uid", userUID);
    // console.log(user);
    const userdocRef = doc(usersColRef, user.uid);
    const docSnapShot = await getDoc(userdocRef);
    profileData = docSnapShot.data();
    console.log(profileData);
    accountHolderNameEl.forEach((el) => {
      el.textContent = `${profileData.firstName} ${profileData.lastName}`;
    });

    accountNumberEl.textContent = `${profileData.accountNumber}`;
    cardNumberEl.textContent = `${profileData.cardNumber}`;
    let currentProfileImage = profileData.profilePicture || "";

    if (currentProfileImage) {
      picEl.forEach((pic) => {
        pic.src = currentProfileImage;
      });
    }
    if (user.emailVerified) {
      // console.log("Verified");
      verifiedStatus.textContent = "Verified";
    } else {
      // console.log("Not Verified");
      verifiedStatus.textContent = "Not Verified";
    }
  }
});
const UserUID = localStorage.getItem("uid");
// const test = "AHDDD".slice(0, 18);
// console.log(test);

// Handle Account name generate
let userData;
const sendBtn = document.getElementById("transferBtn");

transferAccName.addEventListener("input", async () => {
  const accNum = transferAccName.value.trim();

  if (accNum.length === 10) {
    nameDisplay.textContent = "Fethching account name...";
    nameDisplay.classList.add("animate-pulse");
  }
  try {
    const q = query(usersColRef, where("accountNumber", "==", accNum));
    const querySnapShot = await getDocs(q);

    if (!querySnapShot.empty) {
      userData = querySnapShot.docs[0].data();
      console.log(userData);
      nameDisplay.classList.remove("animate-pulse");
      nameDisplay.textContent = `✅ ${userData.firstName} ${userData.lastName}`;
      sendBtn.disabled = false;
      if (sendBtn.disabled == false) {
        sendBtn.classList.remove(
          "bg-gray-500",
          "hover:bg-gray-500",
          "cursor-not-allowed"
        );
        return;
      }
    } else {
      nameDisplay.classList.remove("animate-pulse");
      nameDisplay.textContent = "❌ Account not found";
      sendBtn.disabled = true;
      if (sendBtn.disabled == true) {
        sendBtn.classList.add(
          "bg-gray-500",
          "hover:bg-gray-500",
          "cursor-not-allowed"
        );
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }
});
// Handle PIn Confirmation Popup
const pinModal = document.getElementById("pinModal");

document.getElementById("transferBtn").addEventListener("click", async () => {
  const transferAcc = document.getElementById("transferAcc").value;
  const transferAmount = document.getElementById("transferAmount").value;
  const transferDesc = document.getElementById("transferDesc").value;

  if (!transferAcc || !transferAmount)
    return alert("Please fill all required fields.");
  if (transferAcc.length <= 9)
    return (nameDisplay.textContent = "❌ Invalid Account Number");
  try {
    const transactionDetails = {
      Description: `Transfer to ${userData.firstName} ${
        userData.lastName
      } - ${transferDesc.slice(0, 15)}`,
      Type: "Bank Transfer",
      Date: new Date().toLocaleDateString(),
      Amount: transferAmount,
      Status: "Successful", // or "Pending", "Failed"
      createdAt: serverTimestamp(),
      Direction: "outgoing",
    };
    const docRef = collection(DB, "USERS", UserUID, "TRANSACTIONS");
    await addDoc(docRef, transactionDetails);

    pinModal.classList.remove("hidden");
    pinModal.classList.add("flex");

    pageContent.classList.add("blur-[2px]", "brightness-60");
  } catch (error) {
    console.log(error);
  }
});


