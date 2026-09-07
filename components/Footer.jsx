import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-850 mt-auto py-10 px-6 text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-xl font-black text-zinc-900 dark:text-white mb-3">
            Super<span className="text-green-600 dark:text-green-500">Cart</span>
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your all-in-one destination for premium products at great prices.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Quick Links</h5>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition">Home</Link>
            <Link href="/cart" className="hover:text-zinc-900 dark:hover:text-white transition">Shopping Cart</Link>
            <Link href="/profile" className="hover:text-zinc-900 dark:hover:text-white transition">User Profile</Link>
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Company</h5>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/about" className="hover:text-zinc-900 dark:hover:text-white transition">About Us</Link>
            <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition">Contact Us</Link>
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">Account</h5>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/login" className="hover:text-zinc-900 dark:hover:text-white transition">Sign In</Link>
            <Link href="/register" className="hover:text-zinc-900 dark:hover:text-white transition">Create Account</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
        &copy; {new Date().getFullYear()} SuperCart. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
