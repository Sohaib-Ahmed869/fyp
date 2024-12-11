import React, { useState, useEffect } from "react";
import { BiWorld } from "react-icons/bi";
import { FaChartLine } from "react-icons/fa";
import { AiOutlineClockCircle } from "react-icons/ai";
import Navbar from "./Components/Navbar";
import AuthService from "./Services/authService";
import useStore from "./Store/store";
import LogoWhite1 from "./Assets/LogoWhite1.png";
import loginimage from "./Assets/loginimage.png";

const advantages = [
  {
    color: "#14914A",
    icon: <BiWorld size={30} />,
    title: "Manage your business from anywhere",
    description:
      "Nimbus is a cloud-based platform that allows you to manage your business from anywhere in the world.",
  },
  {
    color: "#4084F4",
    icon: <FaChartLine size={30} />,
    title: "Track your business performance",
    description:
      "Track your business performance with our easy-to-use dashboard.",
  },
  {
    color: "#368F8B",
    icon: <AiOutlineClockCircle size={30} />,
    title: "Get real-time updates",
    description:
      "Get real-time updates on your business performance with our easy-to-use dashboard.",
  },
];

const AllInOneLogin = () => {
  const [role, setRole] = useState(""); // To select the role (Admin, Cashier, Manager)
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [shopNames, setShopNames] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shopName, setShopName] = useState("");
  const [branch, setBranch] = useState("");
  const { setUserRole } = useStore();

  useEffect(() => {
    if (role === "Cashier" || role === "Manager") {
      AuthService.getShopNames().then((res) => setShopNames(res));
    }
  }, [role]);

  useEffect(() => {
    if (shopName) {
      AuthService.getBranches(shopName).then((res) => setBranches(res));
    } else {
      setBranches([]);
    }
  }, [shopName]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (role === "Admin") {
      AuthService.adminLogin(name, password).then((res) => {
        if (res === "error") {
          alert("Wrong Credentials");
        } else {
          alert("Login Successful");
          setUserRole(res.data.role);
          window.location.href = "/admin/dashboard";
        }
      });
    } else if (role === "Cashier") {
      AuthService.cashierLogin(name, password, shopName, branch).then((res) => {
        if (res === "error") {
          alert("Wrong Credentials");
        } else {
          alert("Login Successful");
          setUserRole(res.data.role);
          window.location.href = "/cashier/dashboard";
        }
      });
    } else if (role === "Manager") {
      AuthService.managerLogin(name, password, shopName, branch).then((res) => {
        if (res === "error") {
          alert("Wrong Credentials");
        } else {
          alert("Login Successful");
          setUserRole(res.data.role);
          window.location.href = "/manager/dashboard";
        }
      });
    }
  };

  return (
    <div className="text-center flex flex-col items-center justify-center">
      <Navbar />
      <div className="w-full flex h-full items-center">
        <div>
          <img src={loginimage} alt="Login" className="w-full max-md:hidden" />
        </div>
        <div className="m-10 p-10 w-1/2 max-md:w-full">
          <div className="flex items-center mb-10">
            <img src={LogoWhite1} alt="Logo" className="w-20 h-20" />
            <h1 className="text-4xl font-bold text-left text-black mb-2">
              Nimbus<span className="text-blue-500">360</span>
            </h1>
          </div>
          <h1 className="text-left font-bold text-2xl text-black text-md mb-10">
            Nice to see you again
          </h1>

          {/* Role Selection */}
          <div className="flex flex-col mb-5">
            <h2 className="text-left text-md mb-2">Select Role</h2>
            <select
              className="p-2 border border-gray-300 rounded-xl"
              onChange={(e) => setRole(e.target.value)}
              value={role}
            >
              <option value="">Choose Role</option>
              <option value="Admin">Admin</option>
              <option value="Cashier">Cashier</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          {/* Login Form */}
          {role && (
            <>
              <div className="flex flex-col justify-center gap-10">
                <div className="flex flex-row w-full gap-4">
                  <div className="flex flex-col w-1/2">
                    <h1 className="text-left text-black text-md">Username</h1>
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      className="p-2 border border-gray-300 rounded-xl"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col w-1/2">
                    <h1 className="text-left text-black text-md">Password</h1>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      className="p-2 border border-gray-300 rounded-xl"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {role !== "Admin" && (
                <>
                  <div className="flex flex-col justify-center mt-3">
                    <div className="flex flex-col w-full">
                      <h1 className="text-left text-black text-md">
                        Shop Name
                      </h1>
                      <select
                        className="p-2 border border-gray-300 rounded-xl"
                        onChange={(e) => setShopName(e.target.value)}
                      >
                        <option value="">Select Shop</option>
                        {shopNames.map((shop) => (
                          <option key={shop.shop_name} value={shop.shop_name}>
                            {shop.shop_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col w-full mt-4">
                      <h1 className="text-left text-black text-md">Branch</h1>
                      <select
                        className="p-2 border border-gray-300 rounded-xl"
                        onChange={(e) => setBranch(e.target.value)}
                      >
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                          <option
                            key={branch.branch_name}
                            value={branch.branch_name}
                          >
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mt-10 w-full"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllInOneLogin;
