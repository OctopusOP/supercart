"use client";
import Button from "@/components/Button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/Spinner";

const RegisterPage = () => {
  const [passeye, setPasseye] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const { username, email, password } = Object.fromEntries(formData);

      const res = await fetch("/api/auth/register", {
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

      if (res.ok && data.success) {
        router.push("/login?registered=true");
      } else {
        setErrorMessage(data?.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration request failed:", error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-20">
      <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl shadow-zinc-100 dark:shadow-none sm:p-10 transition-colors">
        <h1 className="text-center text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Create an Account
        </h1>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Join SuperCart today for seamless shopping
        </p>

        {errorMessage && (
          <div className="mt-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* Username Field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Username
            </label>
            <input
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition focus:border-green-500 dark:focus:border-green-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-950"
              name="username"
              placeholder="Choose a username"
              required
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition focus:border-green-500 dark:focus:border-green-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-950"
              name="email"
              placeholder="Enter your email"
              type="email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative flex items-center rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 transition focus-within:border-green-500 dark:focus-within:border-green-500 focus-within:bg-white dark:focus-within:bg-zinc-800 focus-within:ring-2 focus-within:ring-green-100 dark:focus-within:ring-green-950">
              <input
                className="w-full bg-transparent p-3 pr-12 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
                name="password"
                placeholder="Choose a strong password"
                type={passeye ? "password" : "text"}
                required
              />
              <button
                type="button"
                className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-xl text-base hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-95 transition cursor-pointer"
                onClick={() => setPasseye(!passeye)}
                aria-label={passeye ? "Show password" : "Hide password"}
              >
                {passeye ? "🙈" : "👀"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-2">
            <Button disabled={loading}>
              {loading ? <Spinner /> : "Register"}
            </Button>
          </div>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
