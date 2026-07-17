"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Profile = () => {
  const router = useRouter()
  const [user, setUser] = useState({
    username: "",
    name: "",
    number: "",
    email: "",
    dob: "",
    gender: "",
    default: true,
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    state: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateData = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...user,
        }),
      });

      const data = await res.json();
      if (data.status === 200) {
        alert("Data Updated");
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getUser = async () => {
    try {
      const res = await fetch("/api/profile");

      const data = await res.json();

      console.log(data);

      setUser((prev) => ({
        ...prev,
        ...data,
        ...data.usersinfo,
        ...data.addresses,
      }));
      
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        // Clear any local storage data
        localStorage.removeItem("user");
        sessionStorage.clear();

        // Redirect to login page
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className="min-h-screen py-10 px-4 ">
        <div className="max-w-2xl mx-auto rounded-3xl shadow-lg p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-green-300 flex items-center justify-center text-3xl font-bold ">
              DS
            </div>

            <h1 className="text-2xl font-bold mt-4">My Profile</h1>
            <button
              onClick={logout}
              className="mt-4 px-5 py-2 bg-red-500 hover:bg-red-600  rounded-xl transition"
            >
              Logout
            </button>
            <button
              onClick={getUser}
              className="mt-4 px-5 py-2 bg-yellow-500 hover:bg-red-600  rounded-xl transition"
            >
              Refresh Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Username</label>
              <input
                className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                name="username"
                readOnly
                value={user.username}
                onChange={handleChange}
              />
            </div>

            {/* Name */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Name</label>
              <input
                className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                name="name"
                value={user.name}
                onChange={handleChange}
              />
            </div>

            {/* Number */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Phone Number</label>
              <input
                type="tel"
                className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                name="number"
                value={user.number}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Email</label>
              <input
                type="email"
                className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                name="email"
                readOnly
                value={user.email}
                onChange={handleChange}
              />
            </div>

            {/* DOB */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Date of Birth</label>
              <input
                type="date"
                className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                name="dob"
                value={user.dob}
                onChange={handleChange}
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Gender</label>
              <select
                className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                name="gender"
                value={user.gender}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-5">Address</h2>

            <div className="flex items-center gap-2 mb-5">
              <input
                type="checkbox"
                checked={user.default}
                readOnly
                name="default"
              />
              <label>Set as default address</label>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Address Line 1</label>
                <input
                  className="border rounded-xl px-4 py-3"
                  name="line1"
                  value={user.line1}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium">Address Line 2</label>
                <input
                  className="border rounded-xl px-4 py-3"
                  name="line2"
                  value={user.line2}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="mb-1 font-medium">City</label>
                  <input
                    className="border rounded-xl px-4 py-3"
                    name="city"
                    value={user.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 font-medium">Pincode</label>
                  <input
                    className="border rounded-xl px-4 py-3"
                    name="pincode"
                    value={user.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium">State</label>
                <input
                  className="border rounded-xl px-4 py-3"
                  name="state"
                  value={user.state}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            onClick={updateData}
            className="w-full mt-8 bg-green-500 hover:bg-green-600  py-3 rounded-xl font-semibold transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default Profile;
