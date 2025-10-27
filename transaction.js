const transactionDisplayEl = document.getElementById("transactionDisplay");
let accountHolderNameEl = document.getElementById("accountHolderName");
const picEl = document.getElementById("profile-pic");

const userUID = localStorage.getItem("uid");
// console.log(userUID);
if (!userUID) {
  alert("Session Expired! Redirecting....");
  window.location.href = "./signin.html";
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log(user);

    let docRef = doc(usersColRef, user.uid);
    let docSnapShot = await getDoc(docRef);
    let profileData = docSnapShot.data();
    console.log(profileData);

    accountHolderNameEl.textContent = `${profileData.firstName} ${profileData.lastName}`;
    picEl.src = profileData.profilePicture;
  } else {
    alert("Session Expired! Redirecting....");
    window.location.href = "./signin.html";
  }
});

const gettransactionsHistory = async () => {
  try {
    const docRef = collection(DB, "USERS", userUID, "TRANSACTIONS");
    const q = query(docRef, orderBy("createdAt", "desc"));
    const docSnapShot = await getDocs(q);
    const transactionDetails = [];
    docSnapShot.forEach((el) => {
      // const data = el.data();
      transactionDetails.push(el.data());
      // console.log(transactionDetails);
    });

    transactionDetails.forEach((value, index) => {
      transactionDisplayEl.innerHTML += `
                <tr class= "even:bg-gray-50 hover:bg-gray-100">
                  <td class="px-3 py-2">${value.Description}</td>
                  <td class="px-3">${value.Type}</td>
                  <td class="px-3">${value.Date}</td>
                  <td class="px-3">$ ${value.Amount}</td>
                  <td class="px-3  ${getStatusColor(value.Status)} ">${
        value.Status
      }</td>
                </tr>
                
      `;
    });
  } catch (error) {
    console.log(error);
  }
};
function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "successful":
      return "text-green-500 ";
    case "failed":
      return "text-red-400 ";
    case "pending":
      return "text-yellow-400 ";
    default:
      return "text-gray-300";
  }
}
gettransactionsHistory();
