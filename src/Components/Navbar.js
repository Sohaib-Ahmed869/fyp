import React, { useState, useEffect } from "react";

import Logo from "../Assets/Logo.png";

const Navbar = () => {
  const [show, handleShow] = useState(false);

  return (
    <div
      className={` top-0 z-50 w-full bg-white transition-all duration-500
        shadow-lg
         ${show && "bg-white shadow-lg"}`}
    >
      <div className="flex items-center justify-between p-5">
        <img
          src={Logo}
          alt="logo"
          className="w-20 h-20"
          onClick={() => (window.location.href = "/")}
        />
        <div className="flex items-center gap-10">
          <button className="bg-black text-white px-5 py-2 rounded-lg">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
