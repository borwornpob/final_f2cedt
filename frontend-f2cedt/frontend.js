const apiUrl = "http://localhost:5001";

async function registerOrLogin() {
  const name = document.getElementById("username").value;
  let response;
  try {
    response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (response.status === 404) {
      response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    }
    const data = await response.json();
    localStorage.setItem("uid", data.uid);
    document.getElementById("loginSection").classList.add("hidden");
    fetchProblems();
  } catch (error) {
    console.error("Error during register/login:", error);
  }
}

let currentPage = 1;
const limit = 10;

function changePage(direction) {
  currentPage += direction;
  fetchProblems();
}

function fetchProblems() {
  const startIndex = (currentPage - 1) * limit;
  fetch("http://localhost:5500/api/tasks")
    .then((response) => response.json())
    .then((allProblems) => {
      const problems = allProblems.slice(startIndex, startIndex + limit);
      const problemsList = document.getElementById("problemsList");
      problemsList.innerHTML = "";

      if (problems.length === 0) {
        problemsList.innerHTML =
          "<tr><td colspan='2' class='text-center border px-4 py-2'>No problems available at the moment.</td></tr>";
      } else {
        problems.forEach((problem) => {
          const tr = document.createElement("tr");

          const tdTitle = document.createElement("td");
          tdTitle.className = "border px-4 py-2";
          tdTitle.textContent = problem.title;

          const tdActions = document.createElement("td");
          tdActions.className = "border px-4 py-2 whitespace-nowrap";

          const viewBtn = document.createElement("button");
          viewBtn.textContent = "View Problem";
          viewBtn.className =
            "bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded";
          viewBtn.onclick = function () {
            viewProblem(problem.id);
          };

          tdActions.appendChild(viewBtn);

          tr.appendChild(tdTitle);
          tr.appendChild(tdActions);
          problemsList.appendChild(tr);
          const prevBtn = document.getElementById("prevBtn");
          const nextBtn = document.getElementById("nextBtn");

          prevBtn.disabled = currentPage === 1;
          if (prevBtn.disabled) {
            prevBtn.classList.add("opacity-50", "cursor-not-allowed");
          } else {
            prevBtn.classList.remove("opacity-50", "cursor-not-allowed");
          }

          nextBtn.disabled = allProblems.length <= currentPage * limit;
          if (nextBtn.disabled) {
            nextBtn.classList.add("opacity-50", "cursor-not-allowed");
          } else {
            nextBtn.classList.remove("opacity-50", "cursor-not-allowed");
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching problems:", error);
    });
}

function viewProblem(problemId) {
  const iframe = document.getElementById("pdfFrame");
  iframe.src = `https://programming.in.th/api/tasks/${problemId}/statement`;
  document.getElementById("pdfOverlay").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", fetchProblems);

function addTestCaseFields() {
  const container = document.getElementById("testCasesContainer");
  const testCaseGroup = document.createElement("div");
  testCaseGroup.classList.add("testCaseGroup", "mb-4");

  const testCaseInput = document.createElement("input");
  testCaseInput.type = "text";
  testCaseInput.placeholder = "Test Case Input";
  testCaseInput.classList.add(
    "border",
    "p-2",
    "rounded",
    "mb-2",
    "w-full",
    "testCaseInput"
  );

  const expectedOutput = document.createElement("input");
  expectedOutput.type = "text";
  expectedOutput.placeholder = "Expected Output";
  expectedOutput.classList.add(
    "border",
    "p-2",
    "rounded",
    "mb-2",
    "w-full",
    "expectedOutput"
  );

  testCaseGroup.appendChild(testCaseInput);
  testCaseGroup.appendChild(expectedOutput);

  container.appendChild(testCaseGroup);
}

async function createBattle() {
  const problemId = "some-problem-id";
  try {
    const response = await fetch(`${apiUrl}/create-battle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId,
        name: document.getElementById("username").value,
      }),
    });
    const data = await response.json();
    console.log(`Battle room created with ID: ${data.roomId}`);
  } catch (error) {
    console.error("Error creating battle:", error);
  }
}

async function createProblem() {
  const title = document.getElementById("problemTitle").value;
  const description = document.getElementById("problemDescription").value;
  const difficulty = document.getElementById("problemDifficulty").value;

  const testCasesInputs = document.querySelectorAll(".testCaseInput");
  const expectedOutputs = document.querySelectorAll(".expectedOutput");

  let testCases = [];
  testCasesInputs.forEach((input, index) => {
    testCases.push({
      input: input.value,
      output: expectedOutputs[index].value,
    });
  });

  try {
    const response = await fetch(`${apiUrl}/problems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        difficulty,
        testCases,
      }),
    });
    if (response.ok) {
      console.log("Problem created successfully!");
      fetchProblems(); // Refresh the list of problems
    } else {
      console.error("Error creating the problem:", await response.text());
    }
  } catch (error) {
    console.error("Error during problem creation:", error);
  }
}

async function joinBattle() {
  const roomId = document.getElementById("battleRoomId").value;
  try {
    const response = await fetch(`${apiUrl}/join-battle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        name: document.getElementById("username").value,
      }),
    });
    if (response.ok) {
      console.log("Joined the battle successfully!");
    } else {
      console.error("Error joining the battle:", await response.text());
    }
  } catch (error) {
    console.error("Error during join battle:", error);
  }
}

async function submitSolution() {
  const code = document.getElementById("solutionInput").value;
  try {
    const response = await fetch(`${apiUrl}/submit-solution`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code /* ... other fields ... */ }),
    });
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error("Error submitting solution:", error);
  }
}

function parseCSV() {
  const csvUpload = document.getElementById("csvUpload");
  if (!csvUpload.files.length) {
    alert("Please select a CSV file first.");
    return;
  }
  const file = csvUpload.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const csvData = event.target.result;
    extractTestCasesFromCSV(csvData);
  };
  reader.readAsText(file);
}

function extractTestCasesFromCSV(csvData) {
  const rows = csvData.split("\n").filter((row) => row.trim().length > 0);
  const testCasesContainer = document.getElementById("testCasesContainer");
  testCasesContainer.innerHTML = "";

  rows.forEach((row) => {
    const [input, output] = row.split(",").map((value) => value.trim());

    const testCaseGroup = document.createElement("div");
    testCaseGroup.classList.add("testCaseGroup", "mb-4");

    const testCaseInput = document.createElement("input");
    testCaseInput.type = "text";
    testCaseInput.placeholder = "Test Case Input";
    testCaseInput.classList.add(
      "border",
      "p-2",
      "rounded",
      "mb-2",
      "w-full",
      "testCaseInput"
    );
    testCaseInput.value = input;

    const expectedOutput = document.createElement("input");
    expectedOutput.type = "text";
    expectedOutput.placeholder = "Expected Output";
    expectedOutput.classList.add(
      "border",
      "p-2",
      "rounded",
      "mb-2",
      "w-full",
      "expectedOutput"
    );
    expectedOutput.value = output;

    testCaseGroup.appendChild(testCaseInput);
    testCaseGroup.appendChild(expectedOutput);

    testCasesContainer.appendChild(testCaseGroup);
  });
}

function initializePage() {
  const isLoggedIn = !!localStorage.getItem("uid");
  if (isLoggedIn) {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("profileSection").classList.remove("hidden");
    const uid = localStorage.getItem("uid");
    fetch(`${apiUrl}/get-user/${uid}`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("profileName").textContent = data.name;
        const initial = data.name.charAt(0).toUpperCase();
        document.getElementById("profileInitial").textContent = initial;
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  } else {
    // Ensure that if not logged in, the profile section is hidden
    document.getElementById("loginSection").classList.remove("hidden");
    document.getElementById("profileSection").classList.add("hidden");
  }
}

function closePDFOverlay() {

  document.getElementById("pdfOverlay").classList.add("hidden");
  document.getElementById("pdfFrame").src = "";
}

function initializePage() {
  const isLoggedIn = !!localStorage.getItem("uid");
  if (isLoggedIn) {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("profileSection").classList.remove("hidden");
    const uid = localStorage.getItem("uid");
    fetch(`${apiUrl}/get-user/${uid}`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("profileName").textContent = data.name;
        const initial = data.name.charAt(0).toUpperCase();
        document.getElementById("profileInitial").textContent = initial;
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  } else {
    document.getElementById("loginSection").classList.remove("hidden");
    document.getElementById("profileSection").classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", initializePage);

async function registerOrLogin() {
  const name = document.getElementById("username").value;
  let response;
  try {
    response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (response.status === 404) {
      response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    }
    const data = await response.json();
    localStorage.setItem("uid", data.uid);
    initializePage();
  } catch (error) {
    console.error("Error during register/login:", error);
  }
}

function logout() {
  localStorage.removeItem("uid");
  // Redirect to the main page or refresh the page
  location.reload();
}

function toggleDropdown(event) {
  const dropdown = document.getElementById("profileDropdown");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
  } else {
    dropdown.classList.add("hidden");
  }
  event.stopPropagation();
}

document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("profileDropdown");
  const profilePicture = document.getElementById("profilePicture");
  if (
    !profilePicture.contains(event.target) &&
    !dropdown.contains(event.target)
  ) {
    dropdown.classList.add("hidden");
  }
});
