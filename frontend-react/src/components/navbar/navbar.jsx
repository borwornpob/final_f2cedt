import { useState } from "react";

export default function Navbar({ userData, logOut }) {
  const [dropDown, setDropDown] = useState(false);

  function toggleDropdown() {
    setDropDown(!dropDown);
  }

  return (
    <div className="w-full bg-blue-600 p-4 text-white mb-5 rounded-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Code Battle</h1>
        </div>
        <div id="profileSection">
          <div className="relative flex items-center">
            <span id="profileName" className="mr-2 text-white font-bold">
              {!!userData && userData.name}
            </span>
            {!!userData && (
              <div
                id="profilePicture"
                className="h-10 w-10 rounded-full border-2 border-white cursor-pointer flex items-center justify-center text-white bg-gray-800"
                onClick={() => toggleDropdown()}
              >
                <span id="profileInitial">
                  {!!userData && userData.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* <!-- Dropdown --> */}
            {dropDown ? (
              <div
                className="absolute top-full mt-5 right-0 w-48 bg-white rounded-md shadow-lg"
                id="profileDropdown"
                style={{ zIndex: 1 }}
              >
                <ul>
                  <li
                    className="p-4 hover:bg-gray-200 cursor-pointer text-black"
                    onClick={logOut}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
