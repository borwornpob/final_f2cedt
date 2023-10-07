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
    document.getElementById("problemsSection").classList.remove("hidden");
    fetchProblems();
  } catch (error) {
    console.error("Error during register/login:", error);
  }
}

async function fetchProblems() {
  try {
    const response = await fetch(`${apiUrl}/problems`);
    const problems = await response.json();
    const problemsList = document.getElementById("problemsList");
    problemsList.innerHTML = "";
    problems.forEach((problem) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<a href="#" class="text-blue-500 hover:underline">${problem.title}</a>`;
      problemsList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
  }
}

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

