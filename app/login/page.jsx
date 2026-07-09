"use client";
import Button from "@/compoenents/Button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
const LoginPage = () => {
  const [passeye, setPasseye] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    try {
      const formData = new FormData(e.currentTarget);
      const { userinfo, password } = Object.fromEntries(formData);

      const res = await fetch("api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userinfo,
          password,
        }),
      });

      const data = await res.json();

      if (data.status === 200) {
        alert("Login Successful");
        router.push("/");
      } else {
        alert(data?.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-5">
      <div className="mt-10"></div>
      <h1 className="text-center text-2xl">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col p-10 gap-2">
        <label>Username</label>
        <input
          className="p-2 border rounded-2xl outline-none"
          name="userinfo"
          placeholder="Enter Username or Email"
          required
        />

        <label>Password</label>
        <div className="border rounded-2xl relative flex justify-center">
          <input
            className="p-2 w-full outline-none"
            name="password"
            placeholder="Enter Password"
            type={passeye ? "password" : "text"}
            required
          ></input>
          <button
            type="button"
            className="absolute right-4 self-center"
            onClick={() => setPasseye(!passeye)}
          >
            {passeye ? "🙈" : "👀"}
          </button>
        </div>
        <div className="mt-5"></div>
        <Button name={"Login"} />
      </form>
      <div className="mb-20"></div>
    </div>
  );
};

export default LoginPage;
