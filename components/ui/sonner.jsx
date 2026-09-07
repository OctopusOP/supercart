
"use client";

import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      position="top-center"
      expand={false}
      richColors
      toastOptions={{
        className:
          "bg-white text-zinc-950 border-zinc-200 shadow-lg dark:bg-zinc-900 dark:text-white dark:border-zinc-700",
        descriptionClassName:
          "text-zinc-600 dark:text-zinc-300",
      }}
      {...props}
    />
  );
};

export { Toaster };

