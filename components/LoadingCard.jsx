export default function LoadingCard() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center bg-white dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 animate-bounce rounded-full bg-green-500 [animation-delay:-0.3s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-green-500 [animation-delay:-0.15s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-green-500" />
      </div>
    </div>
  );
}