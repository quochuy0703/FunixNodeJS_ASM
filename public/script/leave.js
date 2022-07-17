const startLeaveDate = document.getElementById("startLeaveDate");
const endLeaveDate = document.getElementById("endLeaveDate");
const anteLeaveStart = document.getElementById("anteLeaveStart");
const anteLeaveEnd = document.getElementById("anteLeaveEnd");
const annualLeave = document.getElementById("annualLeave");

let flagTouchStartLeaveDate = false;
let flagTouchEndLeaveDate = false;
const diffDate = () => {
  if (flagTouchStartLeaveDate && flagTouchEndLeaveDate) {
    if (!startLeaveDate.value || !endLeaveDate.value) {
      return alert("Vui long chon!");
    }

    const diffdate =
      new Date(endLeaveDate.value) - new Date(startLeaveDate.value);
    let countday = new Date(diffdate).getDate();
    countday = countday - 1;
    if (diffdate < 0) {
      return alert("Vui long chon 2!");
    }
    console.log(anteLeaveStart.value);
    if (anteLeaveStart.value === "2") {
      countday = countday - 0.5;
    }
    if (anteLeaveEnd.value === "2") {
      countday = countday + 0.5;
    }
    console.log(countday);
    annualLeave.innerHTML = countday;
  }
};

startLeaveDate.addEventListener("change", (e) => {
  flagTouchStartLeaveDate = true;
  endLeaveDate.setAttribute("min", startLeaveDate.value);
  diffDate();
});
endLeaveDate.addEventListener("change", (e) => {
  flagTouchEndLeaveDate = true;
  startLeaveDate.setAttribute("max", endLeaveDate.value);
  diffDate();
});
startLeaveDate.addEventListener("blur", (e) => {
  flagTouchStartLeaveDate = true;
});
endLeaveDate.addEventListener("blur", (e) => {
  flagTouchEndLeaveDate = true;
});

anteLeaveStart.addEventListener("change", (e) => {
  diffDate();
});
anteLeaveEnd.addEventListener("change", (e) => {
  diffDate();
});
