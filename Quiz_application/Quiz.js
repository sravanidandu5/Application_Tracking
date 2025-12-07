let QUESTIONS = [
  {q:"Which language runs in the browser?", options:["Java","JavaScript","Python","C"], ans:1},
  {q:"HTML stands for?", options:["HyperText Markup Language","HighText","HomeText","None"], ans:0},
  {q:"CSS used for?", options:["Styling","Backend","Database","None"], ans:0},
  {q:"JS file extension?", options:[".java",".js",".py",".txt"], ans:1},
  {q:"Which is frontend language?", options:["Java","Python","HTML","SQL"], ans:2},
  {q:"Which is database?", options:["HTML","CSS","MySQL","JS"], ans:2},
  {q:"Full form of SQL?", options:["Simple Query","Structured Query Language","Statement Query","None"], ans:1},
  {q:"React is?", options:["Framework","Library","Language","Tool"], ans:1},
  {q:"Which is not programming language?", options:["C","Python","CSS","Java"], ans:2},
  {q:"Which is used in styling?", options:["CSS","Java","SQL","C"], ans:0},
  {q:"Which is backend language?", options:["Java","HTML","CSS","React"], ans:0},
  {q:"CSS stands for?", options:["Color Style Sheet","Cascading Style Sheets","Coding Style Sheet","None"], ans:1},
  {q:"JS runs in?", options:["Browser","Database","Server only","None"], ans:0},
  {q:"Which is used for logic?", options:["HTML","CSS","JS","PNG"], ans:2},
  {q:"Which is Java framework?", options:["Django","React","Spring","Flask"], ans:2},
];

let current = 0;
let score = 0;
let selected = null;

window.onload = function () {
  if (document.getElementById("userShow")) {
    document.getElementById("userShow").innerHTML =
      "User: " + (localStorage.getItem("username") || "");
    loadQuestion();
  }
};

function loadQuestion() {
  let q = QUESTIONS[current];

  document.getElementById("questionBox").innerHTML =
    (current + 1) + ". " + q.q;

  let html = "";
  q.options.forEach((opt, i) => {
    html += `<div class='option' onclick='selectOption(${i}, this)'>${opt}</div>`;
  });

  document.getElementById("optionsBox").innerHTML = html;

  // Last question → show submit
  if (current === QUESTIONS.length - 1) {
    document.getElementById("submitBtn").style.display = "block";
    document.getElementById("nextBtn").style.display = "none";
  }
}

function selectOption(i, el) {
  selected = i;

  document.querySelectorAll(".option")
    .forEach(btn => btn.classList.remove("selected"));

  el.classList.add("selected");
}

function nextQuestion() {
  if (selected === null) {
    alert("Select an option first.");
    return;
  }

  if (selected === QUESTIONS[current].ans) score++;

  selected = null;
  current++;

  if (current < QUESTIONS.length) {
    loadQuestion();
  }
}

function submitQuiz() {
  if (selected !== null && selected === QUESTIONS[current].ans) {
    score++;
  }

  // Prevent second attempt
  sessionStorage.setItem("testDone", "yes");
  
  localStorage.setItem("score", score);
  window.location.href = "result.html";
}