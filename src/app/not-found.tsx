import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-[#FDFBF7] flex flex-col items-center justify-center px-5">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-[#F97316] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          404
        </h1>
        <p className="text-xl text-[#1C1917] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Page not found
        </p>
        <p className="text-[#78716C] mb-6">Sorry, we couldn't find the page you're looking for.</p>
        <Link
          href="/talk"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Talk
        </Link>
      </div>
    </div>
  );
}