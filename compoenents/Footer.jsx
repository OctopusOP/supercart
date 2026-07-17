import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-screen py-10 px-5 shadow-2xl">
      <div className="flex flex-row justify-center gap-25 md:gap-55 lg:gap-90">
        <div className="flex flex-col">
          <Link href="/">Home</Link>
          <Link href="/email">Email</Link>
          <Link href="/whatsapp">Whatsapp</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/about">About Us</Link>
        </div>
        <div className="flex flex-col">
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/">Test2</Link>
          <Link href="/">Test3</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
