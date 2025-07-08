interface SaveUpLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SaveUpLogo({
  className = "",
  size = "md",
}: SaveUpLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient
            id="saveup-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#0070BA" />
            <stop offset="50%" stopColor="#003087" />
            <stop offset="100%" stopColor="#001C64" />
          </linearGradient>
          <linearGradient
            id="saveup-white-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>

        {/* Background circle with blue gradient */}
        <circle
          cx="16"
          cy="16"
          r="15"
          fill="url(#saveup-gradient)"
          stroke="url(#saveup-white-gradient)"
          strokeWidth="1"
        />

        {/* Piggy bank icon with modern styling */}
        <g transform="translate(6, 8)">
          {/* Main body */}
          <ellipse
            cx="10"
            cy="8"
            rx="9"
            ry="6"
            fill="url(#saveup-white-gradient)"
            opacity="0.95"
          />

          {/* Coin slot */}
          <rect
            x="8"
            y="3"
            width="4"
            height="1.5"
            rx="0.75"
            fill="url(#saveup-gradient)"
          />

          {/* Legs */}
          <circle cx="5" cy="13" r="1.5" fill="url(#saveup-white-gradient)" />
          <circle cx="15" cy="13" r="1.5" fill="url(#saveup-white-gradient)" />

          {/* Snout */}
          <ellipse
            cx="19"
            cy="8"
            rx="2"
            ry="1.5"
            fill="url(#saveup-white-gradient)"
          />

          {/* Nostril */}
          <circle cx="19.5" cy="8" r="0.3" fill="url(#saveup-gradient)" />

          {/* Eye */}
          <circle cx="13" cy="6" r="0.8" fill="url(#saveup-gradient)" />

          {/* Tail */}
          <path
            d="M 1 9 Q 0 7 1 5"
            stroke="url(#saveup-white-gradient)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Floating coins effect */}
        <circle
          cx="25"
          cy="8"
          r="1.5"
          fill="url(#saveup-white-gradient)"
          opacity="0.8"
        />
        <circle
          cx="27"
          cy="12"
          r="1"
          fill="url(#saveup-white-gradient)"
          opacity="0.6"
        />
        <text
          x="25"
          y="9"
          textAnchor="middle"
          className="text-xs"
          fill="url(#saveup-gradient)"
        >
          $
        </text>
      </svg>
    </div>
  );
}
