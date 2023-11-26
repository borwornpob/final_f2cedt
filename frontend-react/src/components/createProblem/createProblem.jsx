import { useState, useEffect } from "react";
//import Quill from "quill";
const apiUrl = "http://localhost:5001";
import createProblem from "./createProblem.js";

export default function CreateProblem({ fetchProblems }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState(null);
  const [difficulty, setDifficulty] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!window.Quill) return;

    if (!document.querySelector(".ql-toolbar")) {
      const quill = new window.Quill("#editor", {
        theme: "snow",
      });
      quill.on("text-change", function () {
        setDescription(quill.root.innerHTML);
      });
    }

    return () => {
      // Clean up
      quillRef.current = null;
    };
  }, []);

  async function handleCreateProblem() {
    setUploading(true);
    await createProblem(title, description, files, difficulty);
    setUploading(false);
    setTimeout(() => {
      fetchProblems();
    }, 1000);
  }

  return (
    <div
      id="createProblemSection"
      className="bg-white p-8 rounded-lg shadow-md mb-6"
    >
      <h2 className="text-2xl mb-4">Create a New Problem</h2>
      <input
        id="problemTitle"
        type="text"
        placeholder="Problem Title"
        className="border p-2 rounded mb-4 w-full"
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div id="editor" style={{ height: "200px" }}></div>
      <textarea
        id="problemDescriptionHidden"
        name="problemDescription"
        //onChange={(e) => setDescription(e.target.value)}
        hidden
      ></textarea>

      <input
        id="problemDifficulty"
        type="text"
        placeholder="Difficulty (e.g., easy, medium, hard)"
        className="border p-2 rounded mb-4 w-full"
        onChange={(e) => setDifficulty(e.target.value)}
        required
      />

      <label className="block text-gray-700 mb-2">
        Import Test Cases (CSV format: input,expected_output):
      </label>
      <input
        type="file"
        id="csvUpload"
        accept=".csv"
        className="border p-2 rounded mb-4 w-full"
        onChange={(e) => setFiles(e.target.files[0])}
        required
      />
      <button
        onClick={handleCreateProblem}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Create Problem
      </button>
    </div>
  );
}
