import { useState } from "react";
import Register from "./components/register/register";
import CreateProblem from "./components/createProblem/createProblem.jsx";
import Problems from "./components/problems/problems";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refetch, setRefetch] = useState(false);

  const refetchContent = () => {
    setRefetch(!refetch);
  };

  const logIn = () => {
    setIsLoggedIn(true);
  };

  const logOut = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="container mx-auto">
      <Register isLoggedIn={isLoggedIn} logIn={logIn}></Register>
      <Problems login={isLoggedIn} refetch={refetch}></Problems>
      <CreateProblem refetchContent={refetchContent}></CreateProblem>
    </div>
  );
}

export default App;
