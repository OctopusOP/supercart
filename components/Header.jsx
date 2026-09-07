"use client";

import Link from "next/link";
import {
  IoPerson,
  IoBagHandle,
} from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";
import {
  GiHamburgerMenu,
  GiCrossMark,
} from "react-icons/gi";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ThemeToggle, {
  ThemeSegmentedControl,
} from "./ThemeToggle";

const Header = () => {
  const [hamMenu, setHamMenu] = useState(false);

  // ============================================
  // CART COUNT
  // ============================================

  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart-count"],

    queryFn: async () => {
      try {
        const res = await fetch("/api/cart", {
          cache: "no-store",
        });

        if (!res.ok) {
          return 0;
        }

        const result = await res.json();

        const items =
          result.data ||
          result.cart ||
          result.items ||
          [];

        return Array.isArray(items)
          ? items.length
          : 0;
      } catch (error) {
        console.error(
          "Failed to load cart count:",
          error
        );

        return 0;
      }
    },

    staleTime: 5000,
    refetchOnWindowFocus: true,
  });

  // ============================================
  // MOBILE MENU
  // ============================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setHamMenu(false);
      }
    };

    if (hamMenu) {
      document.body.style.overflow = "hidden";
      window.addEventListener(
        "keydown",
        handleKeyDown
      );
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [hamMenu]);

  // Close menu helper
  const closeMenu = () => {
    setHamMenu(false);
  };

  return (
    <>
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-zinc-800 dark:text-zinc-100">
          
          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setHamMenu(true)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:hidden"
              aria-label="Open navigation menu"
              aria-expanded={hamMenu}
              aria-controls="mobile-navigation"
            >
              <GiHamburgerMenu className="text-xl" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white"
            >
              Super
              <span className="text-green-600 dark:text-green-500">
                Cart
              </span>
            </Link>
          </div>

          {/* ==================================================
              RIGHT
          ================================================== */}

          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Theme */}
            <ThemeToggle />

            {/* Profile */}
            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              title="Profile"
              aria-label="Profile"
            >
              <IoPerson />
            </Link>

            {/* Orders */}
            <Link
              href="/orders"
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              title="Orders"
              aria-label="Orders"
            >
              <IoBagHandle />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-lg text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              title="Cart"
              aria-label={`Cart${
                cartCount > 0
                  ? `, ${cartCount} items`
                  : ""
              }`}
            >
              <FaCartShopping />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm dark:bg-green-500">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ==================================================
          MOBILE DRAWER
          IMPORTANT: Outside <header>
      ================================================== */}

      <div
        id="mobile-navigation"
        className={`sm:hidden ${
          hamMenu
            ? "pointer-events-auto visible"
            : "pointer-events-none invisible"
        }`}
        aria-hidden={!hamMenu}
      >
        {/* ==================================================
            BACKDROP
        ================================================== */}

        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className={`fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 dark:bg-black/70 ${
            hamMenu
              ? "opacity-100"
              : "opacity-0"
          }`}
        />

        {/* ==================================================
            DRAWER
        ================================================== */}

        <aside
          className={`fixed bottom-0 left-0 top-0 z-[100] flex w-[82%] max-w-sm flex-col border-r border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-900 ${
            hamMenu
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* ==================================================
              DRAWER HEADER
          ================================================== */}

          <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <Link
              href="/"
              onClick={closeMenu}
              className="text-xl font-black tracking-tight text-zinc-900 dark:text-white"
            >
              Super
              <span className="text-green-600 dark:text-green-500">
                Cart
              </span>
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="Close navigation menu"
            >
              <GiCrossMark className="text-lg" />
            </button>
          </div>

          {/* ==================================================
              NAVIGATION
          ================================================== */}

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <div className="flex flex-col gap-1">

              {/* Home */}
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center rounded-xl px-3 py-3 text-base font-medium text-zinc-800 transition hover:bg-zinc-100 hover:text-green-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-green-400"
              >
                Home
              </Link>

              {/* Orders */}
              <Link
                href="/orders"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-zinc-800 transition hover:bg-zinc-100 hover:text-green-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-green-400"
              >
                <IoBagHandle className="text-lg" />

                <span>Orders</span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium text-zinc-800 transition hover:bg-zinc-100 hover:text-green-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-green-400"
              >
                <div className="flex items-center gap-3">
                  <FaCartShopping className="text-base" />

                  <span>Cart</span>
                </div>

                {cartCount > 0 && (
                  <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white dark:bg-green-500">
                    {cartCount > 99
                      ? "99+"
                      : cartCount}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <Link
                href="/profile"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-zinc-800 transition hover:bg-zinc-100 hover:text-green-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-green-400"
              >
                <IoPerson className="text-lg" />

                <span>Profile</span>
              </Link>

              {/* Divider */}
              <div className="my-4 h-px bg-zinc-100 dark:bg-zinc-800" />

              {/* About */}
              <Link
                href="/about"
                onClick={closeMenu}
                className="rounded-xl px-3 py-3 text-base font-medium text-zinc-800 transition hover:bg-zinc-100 hover:text-green-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-green-400"
              >
                About Us
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                onClick={closeMenu}
                className="rounded-xl px-3 py-3 text-base font-medium text-zinc-800 transition hover:bg-zinc-100 hover:text-green-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-green-400"
              >
                Contact
              </Link>

              {/* Divider */}
              <div className="my-4 h-px bg-zinc-100 dark:bg-zinc-800" />

              {/* Login */}
              <Link
                href="/login"
                onClick={closeMenu}
                className="rounded-xl px-3 py-3 text-base font-medium text-zinc-800 transition hover:bg-zinc-100 hover:text-green-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-green-400"
              >
                Login
              </Link>

              {/* Register */}
              <Link
                href="/register"
                onClick={closeMenu}
                className="rounded-xl px-3 py-3 text-base font-medium text-zinc-800 transition hover:bg-zinc-100 hover:text-green-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-green-400"
              >
                Register
              </Link>
            </div>
          </nav>

          {/* ==================================================
              THEME
          ================================================== */}

          <div className="shrink-0 border-t border-zinc-100 px-5 py-5 dark:border-zinc-800">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Appearance
            </p>

            <ThemeSegmentedControl />
          </div>
        </aside>
      </div>
    </>
  );
};

export default Header;