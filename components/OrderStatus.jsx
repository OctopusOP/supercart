
const STATUS_STYLES = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",

  confirmed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",

  processing:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",

  shipped:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",

  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",

  cancelled:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

function formatStatus(status) {
  if (!status) return "Unknown";

  return (
    String(status).charAt(0).toUpperCase() +
    String(status).slice(1)
  );
}

export default function OrderStatus({
  status,
}) {
  const normalizedStatus =
    String(status || "").toLowerCase();

  const className =
    STATUS_STYLES[
      normalizedStatus
    ] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {formatStatus(
        normalizedStatus
      )}
    </span>
  );
}

