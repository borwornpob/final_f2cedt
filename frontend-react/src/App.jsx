import { useState, useEffect } from "react";
import Register from "./components/register/register";
import CreateProblem from "./components/createProblem/createProblem.jsx";
import Problems from "./components/problems/problems";
import Navbar from "./components/navbar/navbar.jsx";

const apiUrl = "http://localhost:5001";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("uid"));
  const [userData, setUserData] = useState(null);
  const [problemsData, setProblemsData] = useState([]);

  //fetch problems data
  function fetchProblems() {
    fetch(`${apiUrl}/problems`)
      .then((response) => response.json())
      .then((data) => {
        setProblemsData(data);
      })
      .catch((error) => {
        console.error("Error fetching problems:", error);
      });
  }

  useEffect(() => {
    fetchProblems();
  }, []);

  // fetch user data
  useEffect(() => {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      return;
    }
    fetch(`${apiUrl}/get-user/${uid}`)
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [isLoggedIn]);

  const logIn = () => {
    setIsLoggedIn(!!localStorage.getItem("uid"));
  };

  function initializeUser(data) {
    setUserData(data);
  }

  return (
    <div className="container mx-auto">
      <Register
        initializeUser={initializeUser}
        isLoggedIn={isLoggedIn}
        logIn={logIn}
        fetchProblems={fetchProblems}
      ></Register>
      <Navbar userData={userData}></Navbar>
      <Problems isLoggedIn={isLoggedIn} problems={problemsData}></Problems>
      <CreateProblem fetchProblems={fetchProblems}></CreateProblem>
    </div>
  );
}

export default App;
