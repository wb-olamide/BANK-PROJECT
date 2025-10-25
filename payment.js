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
const cardBalance = document.getElementById("cardBalance");

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
  updateDoc,
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
    cardBalance.textContent = profileData.cardBalance.toLocaleString();

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
  } else {
    alert("Session Expired! Redirecting....");
    window.location.href = "./signin.html";
  }
});
const UserUID = localStorage.getItem("uid");
// const test = "AHDDD".slice(0, 18);
// console.log(test);

// Pin Modal Cancel
const cancelPinBtn = document.getElementById("cancelPinBtn");
cancelPinBtn.addEventListener("click", () => {
  // window.location.href = "./payment.html";
  pinModal.classList.add("hidden");
  pinModal.classList.remove("flex", "cursor-pointer");
  pageContent.classList.remove("blur-[2px]", "brightness-60");
});

// Handle Account name generate
let recieversData;
let recieverDoc;
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
      recieversData = querySnapShot.docs[0].data();
      recieverDoc = querySnapShot.docs[0].id;
      console.log(recieverDoc);

      nameDisplay.classList.remove("animate-pulse");
      nameDisplay.textContent = `✅ ${recieversData.firstName} ${recieversData.lastName}`;
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

  if (!transferAcc || !transferAmount)
    return alert("Please fill all required fields.");
  if (transferAcc.length <= 9)
    return (nameDisplay.textContent = "❌ Invalid Account Number");
  try {
    pinModal.classList.remove("hidden");
    pinModal.classList.add("flex", "cursor-pointer");
    pageContent.classList.add("blur-[2px]", "brightness-60");
  } catch (error) {
    console.log(error);
  }
});

// Handle Transfer
document.getElementById("pinModal").addEventListener("submit", async (e) => {
  e.preventDefault();
  const transferAcc = document.getElementById("transferAcc");
  const transferAmount = document.getElementById("transferAmount");
  const transferDesc = document.getElementById("transferDesc");
  const pinInput = document.getElementById("pinInput");

  if (pinInput.value == 1111) {
    try {
      console.log(profileData);
      const senderTransactionDetails = {
        Description: `Transfer to ${recieversData.firstName} ${
          recieversData.lastName
        } - ${transferDesc.value.slice(0, 15)}`,
        Type: "Bank Transfer",
        Date: new Date().toLocaleDateString(),
        Amount: transferAmount.value,
        Status: "Successful", // try "Pending", "Failed"
        createdAt: serverTimestamp(),
        Direction: "outgoing",
      };
      const recieverTransactionDetails = {
        Description: `Transfer from ${profileData.firstName} ${
          profileData.lastName
        } - ${transferDesc.value.slice(0, 15)}`,
        Type: "Bank Transfer",
        Date: new Date().toLocaleDateString(),
        Amount: transferAmount.value,
        Status: "Successful", //try "Pending", "Failed"
        createdAt: serverTimestamp(),
        Direction: "Incoming",
      };
      pinModal.classList.add("hidden");
      pinModal.classList.remove("flex");
      pageContent.classList.remove("blur-[2px]", "brightness-60");
      // sender's reference
      const senderTransDocRef = collection(
        DB,
        "USERS",
        userUID,
        "TRANSACTIONS"
      );
      await addDoc(senderTransDocRef, senderTransactionDetails);
      // reciever's reference
      const recieverTransDocRef = collection(
        DB,
        "USERS",
        recieverDoc,
        "TRANSACTIONS"
      );
      await addDoc(recieverTransDocRef, recieverTransactionDetails);

      // Balance Update
      let senderBalance =
        Number(profileData.balance) - Number(transferAmount.value);
      console.log("senderBalance:", senderBalance);

      let senderOutcome =
        Number(profileData.totalOutcome) + Number(transferAmount.value);
      console.log("senderOutcome:", senderOutcome);

      let recieversBalance =
        Number(recieversData.balance) + Number(transferAmount.value);
      console.log("recieversBalance:", recieversBalance);

      let recieverIncome =
        Number(recieversData.totalIncome) + Number(transferAmount.value);
      console.log("recieverIncome:", recieverIncome);

      alert("✅ Transfer Successful!");
      transferAcc.value = "";
      transferAmount.value = "";
      transferDesc.value = "";
      nameDisplay.textContent = "";
      document.getElementById("pinInput").value = "";

      // Update Sender's Balance
      const senderBalDocRef = doc(usersColRef, userUID);
      await updateDoc(senderBalDocRef, {
        balance: senderBalance,
        totalOutcome: senderOutcome,
      });

      // Update Reciever's balance
      const recieversBalDocRef = doc(usersColRef, recieverDoc);
      await updateDoc(recieversBalDocRef, {
        balance: recieversBalance,
        totalIncome: recieverIncome,
      });

      console.log(recieversData);
    } catch (error) {
      console.log(error);
    }
  } else {
    // return (nameDisplay.textContent = "❌ Incorrect Pin!");
    return alert("Incorrect Pin");
  }
});

// Section Change

const transferTabEl = document.getElementById("transferTab");
const airtimeTabEl = document.getElementById("airtimeTab");
const dataTabEl = document.getElementById("dataTab");
const transferSecEl = document.getElementById("transferSection");
const airtimeSecEl = document.getElementById("airtimeSection");
const dataSecEl = document.getElementById("dataSection");
const cardFundSecEl = document.getElementById("cardSection");

// airtimeTabEl.addEventListener("click", () => {
//   airtimeSecEl.classList.remove("hidden");
//   airtimeTabEl.classList.add("border-b-2", "border-blue-600");
//   transferSecEl.classList.add("hidden");
//   transferTabEl.classList.remove("border-b-2", "border-blue-600");
//   dataSecEl.classList.add("hidden");
//   dataTabEl.classList.remove("border-b-2", "border-blue-600");
// });
// transferTabEl.addEventListener("click", () => {
//   airtimeSecEl.classList.add("hidden");
//   airtimeTabEl.classList.remove("border-b-2", "border-blue-600");
//   transferSecEl.classList.remove("hidden");
//   transferTabEl.classList.add("border-b-2", "border-blue-600");
//   dataSecEl.classList.add("hidden");
//   dataTabEl.classList.remove("border-b-2", "border-blue-600");
// });
// dataTabEl.addEventListener("click", () => {
//   airtimeSecEl.classList.add("hidden");
//   airtimeTabEl.classList.remove("border-b-2", "border-blue-600");
//   transferSecEl.classList.add("hidden");
//   transferTabEl.classList.remove("border-b-2", "border-blue-600");
//   dataSecEl.classList.remove("hidden");
//   dataTabEl.classList.add("border-b-2", "border-blue-600");
// });

// Tab Switching Logic
const tabs = {
  transferTab: document.getElementById("transferTab"),
  airtimeTab: document.getElementById("airtimeTab"),
  dataTab: document.getElementById("dataTab"),
  cardTab: document.getElementById("cardTab"),
};

const sections = {
  transferSection: document.getElementById("transferSection"),
  airtimeSection: document.getElementById("airtimeSection"),
  dataSection: document.getElementById("dataSection"),
  cardSection: document.getElementById("cardSection"),
};

Object.keys(tabs).forEach((tabId) => {
  tabs[tabId].addEventListener("click", () => {
    // Hide all sections
    Object.values(sections).forEach((s) => s.classList.add("hidden"));

    // Reset all tabs
    Object.values(tabs).forEach((t) => {
      t.classList.remove("text-primary", "border-primary", "border-b-2");
      t.classList.add("text-gray-500");
    });

    // Show active
    const sectionId = tabId.replace("Tab", "Section");
    sections[sectionId].classList.remove("hidden");

    tabs[tabId].classList.add("text-primary", "border-primary", "border-b-2");
  });
});

// Airtime Proceed Menu
document.getElementById("airtimeBtn").addEventListener("click", async () => {
  const airtimeNumber = document.getElementById("airtimeNumber");
  const airtimeAmount = document.getElementById("airtimeAmount");

  if (!airtimeNumber.value || !airtimeAmount.value)
    return alert("Please fill all required fields.");
  if (airtimeNumber.value.length <= 10 || airtimeNumber.value.length >= 12)
    return alert("❌ Invalid Mobile Number");
  try {
    pinModal.classList.remove("hidden");
    pinModal.classList.add("flex", "cursor-pointer");
    pageContent.classList.add("blur-[2px]", "brightness-60");
  } catch (error) {
    console.log(error);
  }
});
// Handle Airtime
document.getElementById("pinModal").addEventListener("submit", async (e) => {
  e.preventDefault();
  const airtimeNumber = document.getElementById("airtimeNumber");
  const airtimeAmount = document.getElementById("airtimeAmount");
  // const transferDesc = document.getElementById("transferDesc");
  const pinInput = document.getElementById("pinInput");

  if (pinInput.value == 1111) {
    try {
      console.log(profileData);
      const senderTransactionDetails = {
        Description: `Airtime Purchase to ${airtimeNumber.value} `,
        Type: "Airtime Transfer",
        Date: new Date().toLocaleDateString(),
        Amount: airtimeAmount.value,
        Status: "Successful", // try "Pending", "Failed"
        createdAt: serverTimestamp(),
        Direction: "outgoing",
      };
      // const recieverTransactionDetails = {
      //   Description: `Transfer from ${profileData.firstName} ${
      //     profileData.lastName
      //   } - ${transferDesc.value.slice(0, 15)}`,
      //   Type: "Bank Transfer",
      //   Date: new Date().toLocaleDateString(),
      //   Amount: transferAmount.value,
      //   Status: "Successful", //try "Pending", "Failed"
      //   createdAt: serverTimestamp(),
      //   Direction: "Incoming",
      // };
      pinModal.classList.add("hidden");
      pinModal.classList.remove("flex");
      pageContent.classList.remove("blur-[2px]", "brightness-60");
      // sender's reference
      const senderTransDocRef = collection(
        DB,
        "USERS",
        userUID,
        "TRANSACTIONS"
      );
      await addDoc(senderTransDocRef, senderTransactionDetails);
      // reciever's reference
      // const recieverTransDocRef = collection(
      //   DB,
      //   "USERS",
      //   recieverDoc,
      //   "TRANSACTIONS"
      // );
      // await addDoc(recieverTransDocRef, recieverTransactionDetails);

      // Balance Update
      let senderBalance =
        Number(profileData.balance) - Number(airtimeAmount.value);
      console.log("senderBalance:", senderBalance);

      let senderOutcome =
        Number(profileData.totalOutcome) + Number(airtimeAmount.value);
      console.log("senderOutcome:", senderOutcome);

      // let recieversBalance =
      //   Number(recieversData.balance) + Number(transferAmount.value);
      // console.log("recieversBalance:", recieversBalance);

      // let recieverIncome =
      //   Number(recieversData.totalIncome) + Number(transferAmount.value);
      // console.log("recieverIncome:", recieverIncome);

      alert("✅ Airtime Purchase Successful!");
      airtimeNumber.value = "";
      airtimeAmount.value = "";
      document.getElementById("pinInput").value = "";

      // Update Sender's Balance
      const senderBalDocRef = doc(usersColRef, userUID);
      await updateDoc(senderBalDocRef, {
        balance: senderBalance,
        totalOutcome: senderOutcome,
      });

      // Update Reciever's balance
      // const recieversBalDocRef = doc(usersColRef, recieverDoc);
      // await updateDoc(recieversBalDocRef, {
      //   balance: recieversBalance,
      //   totalIncome: recieverIncome,
      // });

      // console.log(recieversData);
    } catch (error) {
      console.log(error);
    }
  } else {
    return alert("Incorrect Pin");
  }
});

// Card Proceed Menu
document.getElementById("cardBtn").addEventListener("click", async () => {
  const cardAmount = document.getElementById("cardAmount");

  if (!cardAmount.value) return alert("Please fill all required fields.");
  try {
    pinModal.classList.remove("hidden");
    pinModal.classList.add("flex", "cursor-pointer");
    pageContent.classList.add("blur-[2px]", "brightness-60");
  } catch (error) {
    console.log(error);
  }
});
// Handle Airtime
document.getElementById("pinModal").addEventListener("submit", async (e) => {
  e.preventDefault();
  const cardAmount = document.getElementById("cardAmount");
  const pinInput = document.getElementById("pinInput");

  if (pinInput.value == 1111) {
    try {
      console.log(profileData);
      const senderTransactionDetails = {
        Description: `$ ${cardAmount.value} Card Funding `,
        Type: "Card Funding",
        Date: new Date().toLocaleDateString(),
        Amount: cardAmount.value,
        Status: "Successful", // try "Pending", "Failed"
        createdAt: serverTimestamp(),
        Direction: "outgoing",
      };
      // const recieverTransactionDetails = {
      //   Description: `Transfer from ${profileData.firstName} ${
      //     profileData.lastName
      //   } - ${transferDesc.value.slice(0, 15)}`,
      //   Type: "Bank Transfer",
      //   Date: new Date().toLocaleDateString(),
      //   Amount: transferAmount.value,
      //   Status: "Successful", //try "Pending", "Failed"
      //   createdAt: serverTimestamp(),
      //   Direction: "Incoming",
      // };
      pinModal.classList.add("hidden");
      pinModal.classList.remove("flex");
      pageContent.classList.remove("blur-[2px]", "brightness-60");
      // sender's reference
      const senderTransDocRef = collection(
        DB,
        "USERS",
        userUID,
        "TRANSACTIONS"
      );
      await addDoc(senderTransDocRef, senderTransactionDetails);
      // reciever's reference
      // const recieverTransDocRef = collection(
      //   DB,
      //   "USERS",
      //   recieverDoc,
      //   "TRANSACTIONS"
      // );
      // await addDoc(recieverTransDocRef, recieverTransactionDetails);

      // Balance Update
      let senderBalance =
        Number(profileData.balance) - Number(cardAmount.value);
      console.log("senderBalance:", senderBalance);

      let senderOutcome =
        Number(profileData.totalOutcome) + Number(cardAmount.value);
      console.log("senderOutcome:", senderOutcome);

      let cardBalance =
        Number(profileData.cardBalance) + Number(cardAmount.value);
      console.log("senderBalance:", cardBalance);

      alert("✅ Card Funded Successful!");
      // airtimeNumber.value = "";
      cardAmount.value = "";
      document.getElementById("pinInput").value = "";

      // Update Sender's Balance
      const senderBalDocRef = doc(usersColRef, userUID);
      await updateDoc(senderBalDocRef, {
        balance: senderBalance,
        totalOutcome: senderOutcome,
        cardBalance,
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    return alert("Incorrect Pin");
  }
});
