import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full grid grid-cols-2 gap-4 justify-center bg-neutral-400 text-white px-8 py-5">
      <div className="flex flex-col">
        <Link href="/">Home</Link>
        <Link href="/contact">Contact Us</Link>
        <Link href="/about">About Us</Link>
        <Link href="/email">Email</Link>
        <Link href="/whatsapp">Whatsapp</Link>
      </div>
      <div className="flex flex-col">
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/">About Us</Link>
        <Link href="/">Email</Link>
        <Link href="/">Whatsapp</Link>
      </div>
    </footer>
  );
};

export default Footer;
