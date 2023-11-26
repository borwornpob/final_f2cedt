import React, { useState } from "react";
import ProblemPopup from "../problemPopup/problemPopup";
import { useEffect } from "react";
const apiUrl = "http://localhost:5001";

export default function Problems({ login }) {
  const [resultMessage, setResultMessage] = useState("");
  const [problemId, setProblemId] = useState("");
  const [problems, setProblems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/problems`)
      .then((response) => response.json())
      .then((data) => {
        setProblems(data);
      })
      .catch((error) => {
        console.error("Error fetching problems:", error);
      });
  }, []);

  const handleViewProblem = (problemId) => {
    setProblemId(problemId);
    setResultMessage("No submit yet");
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  function handleResultMessage(message) {
    setResultMessage(message);
  }

  const problemRows =
    problems.length === 0 ? (
      <tr>
        <td colSpan="2" className="text-center border px-4 py-2">
          No problems available at the moment.
        </td>
      </tr>
    ) : (
      problems.map((problem) => (
        <tr key={problem._id}>
          {/* Add a key for each row */}
          <td className="border px-4 py-2">{problem.title}</td>
          <td className="border px-4 py-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
              onClick={() => {
                handleViewProblem(problem._id);
              }}
            >
              View Problem
            </button>
          </td>
        </tr>
      ))
    );

  return login ? (
    <>
      <div
        id="problemsSection"
        className="bg-white p-8 rounded-lg shadow-md mb-6"
      >
        <h2 className="text-2xl mb-4 font-semibold">Available Problems</h2>
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Problem Title</th>
              <th className="border px-4 py-2 w-44">Actions</th>
            </tr>
          </thead>

          <tbody id="problemsList">
            {/* <!-- Rows will be populated here --> */}
            {problemRows}
          </tbody>
        </table>
      </div>
      <ProblemPopup
        resultMessage={resultMessage}
        problemId={problemId}
        showPopup={showPopup}
        onClose={handleClosePopup}
        handleResultMessage={handleResultMessage}
      ></ProblemPopup>
    </>
  ) : (
    <></>
  );
}
