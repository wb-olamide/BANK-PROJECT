const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const firstNameEl = document.getElementById("firstName");
const lastNameEl = document.getElementById("lastName");

const signupFormEl = document.getElementById("signupForm");
const signupBtn = document.getElementById("signup-Btn");
const errorText = document.getElementById("error-text");

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

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

let num = Math.random();
console.log(num);

let accountNum = String(num).slice(3, 13);

// Card Number

function cardSplitRegex(str) {
  return str.replace(/(.{4})(?=.)/g, "$1 ");
}

const cardgenerate = String(num).slice(2, 18);

const cardNum = cardSplitRegex(cardgenerate);
console.log(cardNum);

// let Number = String(num.slice).slice(3, 13);
// console.log(Number);

const handleSignup = async () => {
  signupBtn.textContent = "Signing Up...";
  try {
    const userCredentials = await createUserWithEmailAndPassword(
      auth,
      emailEl.value,
      passwordEl.value
    );
    // console.log(userCredentials.user.uid);
    if (userCredentials.user) {
      signupBtn.textContent = "Redirecting...";

      sendEmailVerification(userCredentials.user);
      const newUserDocRef = doc(usersColRef, userCredentials.user.uid);
      await setDoc(newUserDocRef, {
        firstName: firstNameEl.value,
        lastName: lastNameEl.value,
        fullName: firstNameEl.value + " " + lastNameEl.value,
        email: emailEl.value,
        phoneNumber: "",
        DateofBirth: "",
        profilePicture: "",
        cardNumber: cardNum,
        accountNumber: accountNum,
        transactionPin: "",
        balance: 0,
        totalIncome: 0,
        totalOutcome: 0,
        cardBalance: 0,
        pin: 1111,
      });
      alert("Account Created Succesfully");
      window.location.href = "./signin.html";
    }
  } catch (error) {
    console.log(error);
    const errorCode = error.code;
    if (errorCode == "auth/invalid-email") {
      errorText.textContent = "Invalid Email or Password";
      return;
    } else if (errorCode == "auth/email-already-in-use") {
      errorText.textContent = "Email already in Use";
      return;
    } else if (errorCode == "auth/missing-password") {
      errorText.textContent = "Password should not be Empty";
      return;
    } else if (errorCode == "auth/missing-email") {
      errorText.textContent = "Email should not be empty";
      return;
    } else if (errorCode == "auth/weak-password") {
      errorText.textContent = "Password is too weak";
      return;
    } else {
      errorText.textContent = "Invalid Credentials";
      return;
    }
  } finally {
    console.log("DONE!!!");
    signupBtn.textContent = "Sign Up";
  }
};

signupFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSignup();
});
