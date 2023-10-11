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
function fetchProblems() {
  fetch(`${apiUrl}/problems`)
    .then((response) => response.json())
    .then((problems) => {
      const problemsList = document.getElementById("problemsList");
      problemsList.innerHTML = ""; // Clear the previous list

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
          tdActions.className = "border px-4 py-2";

          const viewBtn = document.createElement("button");
          viewBtn.textContent = "View Problem";
          viewBtn.className =
            "bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded";
          viewBtn.onclick = function () {
            viewProblem(problem._id); // Using problem._id instead of problem.id
          };

          console.log("Problem ID:", problem._id); // Log problem._id to the console

          tdActions.appendChild(viewBtn);

          tr.appendChild(tdTitle);
          tr.appendChild(tdActions);
          problemsList.appendChild(tr);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching problems:", error);
    });
}

function viewProblem(problemId) {
  fetch(`${apiUrl}/problems/${problemId}`)
    .then((response) => response.json())
    .then((problem) => {
      document.getElementById("problemTitlePopup").textContent = problem.title;
      document.getElementById("problemDescriptionPopup").innerHTML =
        problem.description;

      // Show the popup
      document.getElementById("problemPopup").classList.remove("hidden");
    })
    .catch((error) => {
      console.error("Error fetching problem:", error);
    });
}

function closeProblemPopup() {
  document.getElementById("problemPopup").classList.add("hidden");
}

function submitCode() {
  const code = document.getElementById("codeEditor").value;
  const language = document.getElementById("languageSelector").value;

  // Example of sending code to the server.
  fetch(`${apiUrl}/submit-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      language,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle response from server. E.g., show a message based on success or failure.
      if (data.success) {
        alert("Code submitted successfully!");
      } else {
        alert("Code submission failed: " + data.error);
      }
    })
    .catch((err) => {
      console.error("Error submitting code:", err);
    });
}

function closeModal() {
  document.getElementById("problemModal").classList.add("hidden");
}

// Call the function when the page loads:
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
  const titleElement = document.getElementById("problemTitle");
  if (!titleElement.value.trim()) {
    alert("Please enter a problem title.");
    return;
  }

  const descriptionContent = quill.getText().trim();
  if (!descriptionContent) {
    alert("Please enter a problem description.");
    return;
  }

  const csvUpload = document.getElementById("csvUpload");
  if (!csvUpload.files.length) {
    alert("Please upload a CSV file.");
    return;
  }

  const file = csvUpload.files[0];
  const reader = new FileReader();
  reader.onload = async function (event) {
    const csvData = event.target.result;
    const testCases = processCSV(csvData);

    const title = document.getElementById("problemTitle").value;
    const descriptionHTML = quill.root.innerHTML;
    const difficulty = document.getElementById("problemDifficulty").value;

    try {
      const response = await fetch(`${apiUrl}/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: descriptionHTML,
          difficulty,
          testCases,
        }),
      });

      if (response.ok) {
        console.log("Problem created successfully!");
        document.getElementById("problemTitle").value = "";
        document.getElementById("problemDifficulty").value = "";
        quill.setText("");
        document.getElementById("csvUpload").value = ""; // Clear the file input

        alert("Problem created successfully!");

        fetchProblems(); // Refresh the list of problems
      } else {
        console.error("Error creating the problem:", await response.text());
      }
    } catch (error) {
      console.error("Error during problem creation:", error);
    }
  };
  reader.readAsText(file);
}

function processCSV(csvData) {
  const rows = csvData.split("\n").filter((row) => row.trim().length > 0);
  const testCases = [];

  rows.forEach((row) => {
    const [input, expectedOutput] = row.split(",").map((value) => value.trim());
    testCases.push({ input, output: expectedOutput });
  });

  return testCases;
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
document.addEventListener("DOMContentLoaded", function () {
  quill = new Quill("#editor", {
    theme: "snow",
  });
  fetchProblems();
  initializePage();
});

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

function processCSV(csvData) {
  const rows = csvData.split("\n").filter((row) => row.trim().length > 0);
  const testCases = [];

  rows.forEach((row) => {
    const [input, expectedOutput] = row.split(",").map((value) => value.trim());
    testCases.push([input, expectedOutput]);
  });

  return testCases;
}

document.getElementById("closePopupBtn").addEventListener("click", function () {
  document.getElementById("problemPopup").classList.add("hidden");
});
