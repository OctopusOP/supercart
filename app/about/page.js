import React from "react";
import Link from "next/link";

export const metadata = {
  title: "About Us - SuperCart",
  description: "Learn more about SuperCart and our mission.",
};

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          About SuperCart
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Reimagining modern e-commerce with convenience, speed, and exceptional quality.
        </p>
      </div>

      <div className="space-y-8 text-zinc-600 dark:text-zinc-300 leading-relaxed">
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Our Mission</h2>
          <p>
            At SuperCart, we believe shopping should be effortless and enjoyable. We curate high-grade
            products from trusted brands and creators, ensuring every order meets our rigorous
            standards of durability, value, and customer satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Fast Delivery</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Expedited fulfillment and real-time tracking from warehouse to your doorstep.
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Secure Payments</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              End-to-end encrypted transactions ensuring your security with every purchase.
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">24/7 Support</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Our dedicated support team is always available to help you with questions or returns.
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link
            href="/"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium px-8 py-3 rounded-2xl transition"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;