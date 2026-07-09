"use client";
import Link from "next/link";
import { IoPerson } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import { GiHamburgerMenu, GiCrossMark } from "react-icons/gi";
import { ImCross } from "react-icons/im";

import { useState } from "react";

const Header = () => {
  const [HamMenu, setHamMenu] = useState(false);

  return (
    <header className="relative">
      <div className="w-full flex flex-row items-center bg-neutral-800 py-4 px-3 text-2xl">
        <div className="flex gap-2">
          <GiHamburgerMenu
            onClick={() => setHamMenu(true)}
            className="self-center"
          />

          <Link href="/" className="bg-white">
            Logo
          </Link>
        </div>
        <div className="flex gap-2 ml-auto ">
          <IoMdSearch className="self-center" />

          <Link href="/profile" className="self-center">
            <IoPerson />
          </Link>

          <Link href="/cart">
            <FaCartShopping />
          </Link>
        </div>
      </div>

      {HamMenu ? (
        <>
          <div
            onClick={() => setHamMenu(false)}
            className="z-99  sm:hidden flex flex-col items-center min-w-[40%] min-h-screen gap-2 pb-4 bg-neutral-800 absolute top-0"
          >
            <GiCrossMark
              className="absolute right-5 top-3 text-2xl"
              onClick={() => setHamMenu(false)}
            />
            <span className="pt-4"></span>
            <Link href="/">Home</Link>
            <Link href="/register">Register</Link>
            <Link href="/login">Login</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </>
      ) : (
        <></>
      )}
    </header>
  );
};

export default Header;
