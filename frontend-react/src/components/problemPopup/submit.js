const apiUrl = "http://localhost:5001";

export default async function submitCode(code, language, problemId) {
  if (!problemId) {
    console.error("No problem selected.");
    return "Problem Id error";
  }

  const uid = localStorage.getItem("uid");
  try {
    const response = await fetch(`${apiUrl}/submitsolution`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        language,
        problemId,
        uid, // Add uid here
      }),
    });

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error("Error submitting the solution:", error); // Likely line 129
    alert("There was an error submitting the solution.");
    return "Error submitting the solution.";
  }
}
