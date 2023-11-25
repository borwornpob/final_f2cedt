import React, { useState, useEffect } from "react";
const apiUrl = "http://localhost:5001";

export default function ProblemPopup({
  resultMessage,
  problemId,
  isHidden,
  onClose,
}) {
  const [problem, setProblem] = useState({});
  const [hidden, setHidden] = useState(isHidden);

  useEffect(() => {
    fetch(`${apiUrl}/problems/${problemId}`)
      .then((response) => response.json())
      .then((data) => {
        setProblem(data);
      })
      .catch((error) => {
        console.error("Error fetching problems:", error);
      });
  }, [problemId]);

  return isHidden ? (
    <div id="problemPopup"></div>
  ) : (
    <div
      id="problemPopup"
      className={`problem-popup fixed top-0 left-0 w-full h-full 
      bg-black bg-opacity-70 flex items-center justify-center z-10`}
    >
      {/* <!-- Start of Popup Sheet --> */}
      <div className="bg-white rounded-lg w-4/5 h-4/5 relative overflow-hidden shadow-lg flex">
        {/* <!-- Left Half - Problem Description --> */}
        <div className="left-half w-1/2 p-4 overflow-y-auto">
          <div
            id="problemDescriptionPopup"
            className="problem-description text-base"
          >
            {problem.description}
          </div>
        </div>

        {/* <!-- Right Half - Code and Submission --> */}
        <div className="right-half w-1/2 p-4 flex flex-col">
          {/* <!-- Problem Title --> */}
          <h2 id="problemTitlePopup" className="text-2xl font-bold mb-4">
            {problem.title}
          </h2>

          <div className="p-4 mb-5 border-2 border-black rounded-lg">
            <span id="resultMessage">{resultMessage}</span>
          </div>

          {/* <!-- Programming Language Selector --> */}
          <div className="mb-4">
            <select id="languageSelector" className="border py-2 px-4 rounded">
              {/* <!-- Example language options, add more as needed --> */}
              <option value="python">Python</option>
            </select>
          </div>

          {/* <!-- Code Editor --> */}
          <textarea
            id="codeEditor"
            className="flex-grow border p-2 rounded mb-4"
            placeholder="Write your code here..."
          ></textarea>

          {/* <!-- Submit Button --> */}
          <button
            //onClick="submitCode()" // need work here
            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 self-end"
          >
            Submit
          </button>
        </div>
      </div>
      {/* <!-- Close Button --> */}
      <button
        id="closePopupBtn"
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        aria-label="Close"
        onClick={onClose}
      >
        &times;
      </button>
      {/* <!-- End of Popup Sheet --> */}
    </div>
  );
}
