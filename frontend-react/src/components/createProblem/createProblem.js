const apiUrl = "http://localhost:5001";
import processCSV from "./processCSV";

export default async function createProblem(
  title,
  description,
  files,
  difficulty
) {
  if (!(title || "").trim()) {
    alert("Please enter a problem title.");
    return;
  }

  if (!(description || "").trim()) {
    alert("Please enter a problem description.");
    return;
  }

  if (!(difficulty || "").trim()) {
    alert("Please enter a problem difficulty.");
    return;
  }

  if (!files) {
    alert("Please upload a CSV file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function (event) {
    const csvData = event.target.result;
    const testCases = processCSV(csvData);
    const descriptionHTML = description;

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
        alert("Problem created successfully!");
      } else {
        console.error("Error creating the problem:", await response.text());
      }
    } catch (error) {
      console.error("Error during problem creation:", error);
    }
  };
  reader.readAsText(files);
}
