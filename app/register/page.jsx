"use client";
import Button from "@/compoenents/Button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
const RegisterPage = () => {
  const [passeye, setPasseye] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const { username, email, password } = Object.fromEntries(formData);

      const res = await fetch("api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      console.log(data);

      if (data.success === true) {
        alert(data.message);
        form.reset();
        router.push("/login");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="p-5">
      <div className="rounded-2xl">
        <div className="mt-10"></div>
        <h1 className="text-center text-2xl pt-5">Register</h1>
        <form onSubmit={handleSubmit} className="flex flex-col p-10 gap-2">
          <label>Username</label>
          <input
            className="p-2 border rounded-2xl outline-none"
            name="username"
            placeholder="Enter Username"
            required
          />
          <label>Email</label>
          <input
            className="p-2 border rounded-2xl outline-none"
            name="email"
            placeholder="Enter Email"
            type="email"
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
          <Button name={loading ? "Loading" : "Register"} />
        </form>
        <div className="mb-20"></div>
      </div>
    </div>
  );
};

export default RegisterPage;
