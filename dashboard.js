const pageContent = document.getElementById("pagecontent");
const profileIconEl = document.querySelectorAll(".profile-icon");
const closeIconEl = document.getElementById("close-icon");
const miniProfileDrop = document.getElementById("miniprofiledrop");
const accountNumberEl = document.getElementById("account-num");
const cardNumberEl = document.getElementById("card-num");
const verifiedStatus = document.getElementById("verified-status");
const transactionDisplayEl = document.getElementById("transactionDisplay");
const picEl = document.querySelectorAll(".profile-pic");
const balanceEl = document.querySelectorAll(".account-balance");
const incomeEl = document.getElementById("account-income");
const outcomeEl = document.getElementById("account-outcome");
const cardBalance = document.getElementById("cardBalance");

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
    incomeEl.textContent = profileData.totalIncome.toLocaleString();
    outcomeEl.textContent = profileData.totalOutcome.toLocaleString();
    cardBalance.textContent = profileData.cardBalance.toLocaleString();
    // let formatBalance = profileData.balance;
    balanceEl.forEach((el) => {
      el.textContent = profileData.balance.toLocaleString();
    });

    if (user.emailVerified) {
      // console.log("Verified");
      verifiedStatus.textContent = "Verified";
    } else {
      // console.log("Not Verified");
      verifiedStatus.textContent = "Not Verified";
    }

    let currentProfileImage = profileData.profilePicture || "";

    if (currentProfileImage) {
      picEl.forEach((pic) => {
        pic.src = currentProfileImage;
      });
    }
  } else {
    alert("Session Expired! Redirecting....");
    window.location.href = "./signin.html";
  }
});
const UserUID = localStorage.getItem("uid");

// Transaction Direction
let direction;
// if ((transactionType = "Deposit")) {
//   direction = "Incoming";
// } else {
//   direction = "Outgoing";
// }

// const addTransactionsHistory = async () => {
//   try {
//     console.log(UserUID);
//     const transactionDetails = {
//       Description: "Money transfer from WBEE",
//       Type: "Bank Transfer",
//       Date: new Date().toLocaleDateString(),
//       Amount: 200,
//       Status: "Pending", // or "Pending", "Failed"
//       createdAt: serverTimestamp(),
//       Direction: "direction",
//     };
//     const transactionsColRef = collection(DB, "USERS", UserUID, "transactions");
//     const docRef = await addDoc(transactionsColRef, transactionDetails);
//     // console.log(docRef);
//   } catch (error) {
//     console.log(error);
//   }
// };
// addTransactionsHistory();
const gettransactionsHistory = async () => {
  try {
    const transactionsColRef = collection(DB, "USERS", UserUID, "TRANSACTIONS");
    const q = query(transactionsColRef, orderBy("createdAt", "desc"));
    const querySnapShot = await getDocs(q);
    const transactionDetails = [];
    console.log(querySnapShot);

    querySnapShot.forEach((doc) => {
      // const transactionDetails = doc.data();
      transactionDetails.push(doc.data());
      // console.log(transactionDetails);
    });

    transactionDetails.forEach((value, index) => {
      transactionDisplayEl.innerHTML += `
                <tr class= "even:bg-gray-50 ">
                  <td class="px-3 py-2">${value.Description}</td>
                  <td class="px-3">${value.Type}</td>
                  <td class="px-3">${value.Date}</td>
                  <td class="px-3">$ ${value.Amount}</td>
                  <td class="px-3  ${getStatusColor(value.Status)} ">${
        value.Status
      } </td>
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
// console.log(UserUID);

// chart Display
const ctx = document.getElementById("transactionChart");
const labels = [];
const outAmounts = [];
const inAmounts = [];
try {
  // const chartColRef = collection(DB, "USERS", UserUID, "TRANSACTIONS");
  // const chartquerySnapShot = await getDocs(chartColRef);
  const transactionsColRef = collection(DB, "USERS", UserUID, "TRANSACTIONS");
  const q = query(transactionsColRef, orderBy("createdAt", "desc"));
  const chartquerySnapShot = await getDocs(q);
  const chartDetails = [];

  chartquerySnapShot.forEach((doc) => {
    const chartData = doc.data();
    chartData.Direction == "outgoing"
      ? outAmounts.unshift(chartData.Amount)
      : inAmounts.unshift(chartData.Amount);

    chartDetails.push(doc.data());
    labels.unshift(chartData.Date);
    // console.log(labels);

    // amounts.push(chartData.Amount);
    // console.log(chartDetails);
    // console.log(outAmounts);
    // console.log(inAmounts);
  });
} catch (error) {
  console.log(error);
}
// console.log(amounts);
// console.log(labels);
const transactionChart = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Outgoing",
        data: outAmounts,
        tension: 0.4,
        borderColor: "#F43F5E", // Tailwind rose-500
        backgroundColor: "rgba(244,63,94,0.12)",
        // fill: true,
      },
      {
        label: "Incoming",
        data: inAmounts,
        tension: 0.4,
        borderColor: "#2563EB",
        backgroundColor: "rgba(37,99,235,0.12)",
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { tooltip: { intersect: false } },
    scales: {
      x: { ticks: { color: "#6B7280" }, grid: { display: false } },
      y: {
        ticks: { color: "#6B7280" },
        grid: { color: "rgba(203,213,225,0.3)" },
      },
    },
  },
});
