"use client";
import Button from "@/compoenents/Button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/compoenents/Spinner";
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
    <div className="mx-auto max-w-md px-4 py-12 md:py-20">
      <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-100/50 sm:p-10">
        <h1 className="text-center text-3xl font-bold tracking-tight text-zinc-900">
          Register
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* Username Field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">
              Username
            </label>
            <input
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              name="username"
              placeholder="Enter Username"
              required
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Email</label>
            <input
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              name="email"
              placeholder="Enter Email"
              type="email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">
              Password
            </label>
            <div className="relative flex items-center rounded-2xl border border-zinc-200 bg-zinc-50/50 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <input
                className="w-full bg-transparent p-3 pr-12 text-zinc-900 placeholder-zinc-400 outline-none"
                name="password"
                placeholder="Enter Password"
                type={passeye ? "password" : "text"}
                required
              />
              <button
                type="button"
                className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-xl text-lg hover:bg-zinc-100 active:scale-95 transition"
                onClick={() => setPasseye(!passeye)}
              >
                {passeye ? "🙈" : "👀"}
              </button>
            </div>
          </div>

          {/* Submit Button Wrapper */}
          <div className="mt-2">
            <Button name={loading ? <Spinner/> : "Register"} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
