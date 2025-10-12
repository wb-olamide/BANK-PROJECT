const pageContent = document.getElementById("pagecontent");
const profileIconEl = document.getElementById("profile-icon");
const closeIconEl = document.getElementById("close-icon");
const miniProfileDrop = document.getElementById("miniprofiledrop");

profileIconEl.addEventListener("click", () => {
  miniProfileDrop.classList.remove("hidden");
  pageContent.classList.add("blur-[2px]", "brightness-50");
});


