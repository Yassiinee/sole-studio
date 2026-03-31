import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-2.5 text-red-600">
      <AlertCircle size={15} className="shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold mb-1">Error</p>
        <p className="text-xs leading-relaxed break-words">{message}</p>
        <button
          onClick={onRetry}
          className="mt-2 text-xs underline font-semibold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
