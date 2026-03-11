export function Logo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const textColor = variant === "dark" ? "text-white" : "text-slate-800";
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#93c5fd]">
        <svg
          width="20"
          height="18"
          viewBox="0 0 24 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="white"
          />
        </svg>
      </div>
      <span className={`text-xl font-semibold ${textColor}`}>Diafit</span>
    </div>
  );
}
