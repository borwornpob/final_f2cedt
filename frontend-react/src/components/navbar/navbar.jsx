

export default function Navbar() {
    return (
        <div class="w-full bg-blue-600 p-4 text-white mb-5 rounded-lg">
        <div class="container mx-auto flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold">Code Battle</h1>
          </div>
          <div id="profileSection">
            <div class="relative flex items-center">
              <span id="profileName" class="mr-2 text-white font-bold"></span>
              <div
                id="profilePicture"
                class="h-10 w-10 rounded-full border-2 border-white cursor-pointer flex items-center justify-center text-white bg-gray-800"
                onclick="toggleDropdown()"
              >
                <span id="profileInitial"></span>
              </div>

              <!-- Dropdown -->
              <div
                class="absolute top-full mt-5 right-0 w-48 bg-white rounded-md shadow-lg hidden"
                id="profileDropdown"
                style="z-index: 1"
              >
                <ul>
                  <li
                    class="p-4 hover:bg-gray-200 cursor-pointer text-black"
                    onclick="logout()"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}