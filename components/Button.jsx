import React from "react";

const Button = ({
  name,
  children,
  type = "submit",
  disabled = false,
  className = "",
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-2xl transition cursor-pointer flex items-center justify-center ${className}`}
      {...props}
    >
      {children || name}
    </button>
  );
};

export default Button;
