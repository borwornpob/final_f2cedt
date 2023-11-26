import { useState, useEffect } from "react";
import Register from "./components/register/register";
import CreateProblem from "./components/createProblem/createProblem.jsx";
import Problems from "./components/problems/problems";
import Navbar from "./components/navbar/navbar.jsx";

const apiUrl = "http://localhost:5001";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("uid"));
  const [refetch, setRefetch] = useState(false);
  const [userData, setUserData] = useState(null);

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

  const refetchContent = () => {
    setRefetch(!refetch);
  };

  const logIn = () => {
    setIsLoggedIn(true);
  };

  const logOut = () => {
    setIsLoggedIn(false);
  };

  function initializeUser(d) {
    setUserData(d);
  }

  return (
    <div className="container mx-auto">
      <Register
        initializeUser={initializeUser}
        isLoggedIn={isLoggedIn}
        logIn={logIn}
      ></Register>
      <Navbar userData={userData}></Navbar>
      <Problems login={isLoggedIn} refetch={refetch}></Problems>
      <CreateProblem refetchContent={refetchContent}></CreateProblem>
    </div>
  );
}

export default App;
