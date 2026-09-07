"use client";
import LoadingCard from "@/components/LoadingCard";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Profile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [user, setUser] = useState({
    username: "",
    name: "",
    number: "",
    email: "",
    dob: "",
    gender: "male",
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
    setSaving(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setFeedbackMessage({ type: "error", text: data?.error || "Error updating profile" });
      }
    } catch (error) {
      console.error("Update failed:", error);
      setFeedbackMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const getUser = async () => {
    setLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
        }
        return;
      }

      const data = await res.json();
      const info = Array.isArray(data.usersinfo)
        ? data.usersinfo[0] || {}
        : data.usersinfo || {};
      const addr = Array.isArray(data.addresses)
        ? data.addresses[0] || {}
        : data.addresses || {};

      setUser((prev) => ({
        ...prev,
        username: data.username || "",
        email: data.email || "",
        name: info.name || "",
        number: info.number || "",
        dob: info.dob || "",
        gender: info.gender || "male",
        line1: addr.line1 || "",
        line2: addr.line2 || "",
        city: addr.city || "",
        pincode: addr.pincode || "",
        state: addr.state || "",
      }));
      setFeedbackMessage({ type: "success", text: "Profile refreshed" });
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setFeedbackMessage({ type: "error", text: "Failed to fetch profile" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitialProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
          }
          return;
        }

        const data = await res.json();
        if (ignore) return;

        const info = Array.isArray(data.usersinfo)
          ? data.usersinfo[0] || {}
          : data.usersinfo || {};
        const addr = Array.isArray(data.addresses)
          ? data.addresses[0] || {}
          : data.addresses || {};

        setUser((prev) => ({
          ...prev,
          username: data.username || "",
          email: data.email || "",
          name: info.name || "",
          number: info.number || "",
          dob: info.dob || "",
          gender: info.gender || "male",
          line1: addr.line1 || "",
          line2: addr.line2 || "",
          city: addr.city || "",
          pincode: addr.pincode || "",
          state: addr.state || "",
        }));
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialProfile();

    return () => {
      ignore = true;
    };
  }, [router]);

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        localStorage.removeItem("user");
        sessionStorage.clear();
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userInitials = (user.name || user.username || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return <LoadingCard/>
  }

  return (
    <>
     <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 transition-colors">
  <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none p-8 transition-colors">  {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-green-500 text-white flex items-center justify-center text-3xl font-bold shadow-md">
              {userInitials}
            </div>

            <h1 className="text-2xl font-bold mt-4 text-zinc-900 dark:text-white">My Profile</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email || user.username}</p>

            {feedbackMessage && (
              <div
                className={`mt-4 w-full p-3 text-sm rounded-xl border ${
                  feedbackMessage.type === "success"
                    ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/50"
                    : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50"
                }`}
              >
                {feedbackMessage.text}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={getUser}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-medium rounded-xl transition cursor-pointer"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">Username</label>
              <input
                className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 rounded-xl px-4 py-3 focus:outline-none"
                name="username"
                readOnly
                value={user.username}
                onChange={handleChange}
              />
            </div>

            {/* Name */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">Name</label>
              <input
                className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                name="name"
                value={user.name}
                onChange={handleChange}
              />
            </div>

            {/* Number */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">Phone Number</label>
              <input
                type="tel"
                className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                name="number"
                value={user.number}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">Email</label>
              <input
                type="email"
                className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 rounded-xl px-4 py-3 focus:outline-none"
                name="email"
                readOnly
                value={user.email}
                onChange={handleChange}
              />
            </div>

            {/* DOB */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">Date of Birth</label>
              <input
                type="date"
                className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                name="dob"
                value={user.dob}
                onChange={handleChange}
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">Gender</label>
              <select
                className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
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
          <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Address</h2>

            <div className="flex items-center gap-2 mb-5">
              <input
                type="checkbox"
                checked={user.default}
                readOnly
                name="default"
                className="accent-green-600 rounded"
              />
              <label className="text-sm text-zinc-700 dark:text-zinc-300">Set as default address</label>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">Address Line 1</label>
                <input
                  className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  name="line1"
                  value={user.line1}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">Address Line 2</label>
                <input
                  className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  name="line2"
                  value={user.line2}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">City</label>
                  <input
                    className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                    name="city"
                    value={user.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">Pincode</label>
                  <input
                    className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                    name="pincode"
                    value={user.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-zinc-700 dark:text-zinc-300 text-sm">State</label>
                <input
                  className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  name="state"
                  value={user.state}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={updateData}
            className="w-full mt-8 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Profile;
