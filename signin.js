const emailEl = document.getElementById("email");
const loginForm = document.getElementById("login-form");
const passwordEl = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const loginBtn = document.getElementById("login-btn");

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
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

const handleSignin = async () => {
  loginBtn.textContent = "Signing In...";
  try {
    const userSignin = await signInWithEmailAndPassword(
      auth,
      emailEl.value,
      passwordEl.value
    );
    console.log(userSignin);
    alert("Signin Successful, Redirecting...");
  } catch (error) {
    console.log(error.code);
    const errorCode = error.code;
    if (errorCode == "auth/invalid-credential") {
      errorMessage.textContent = "Incorrect Email or Password";
      return;
    } else if (errorCode == "auth/invalid-email") {
      errorMessage.textContent = "Invalid Email or Password";
      return;
    }
  } finally {
    console.log("Done!!!");
    loginBtn.textContent = "Log In";
  }
};

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSignin();
});
