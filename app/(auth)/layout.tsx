import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background tx-dot-bg text-foreground">
      {/* Left side: Form */}
      <div className="flex flex-1 flex-col justify-center lg:flex-none lg:w-[50vw]">
        {children}
      </div>
      {/* Right side: Product features/stats (hidden on mobile) */}
      <div className="relative hidden w-0 flex-1 lg:flex flex-col justify-center bg-foreground tx-dot-bg text-background border-l border-border px-12">
        <div className="mx-auto max-w-md space-y-10 relative z-10">
          <div className="space-y-3">
            <p className="tx-eyebrow-accent text-accent">AI SEO & CITATIONS</p>
            <h2 className="text-4xl font-poppins font-bold text-background leading-tight">
              Become the source AI recommends.
            </h2>
          </div>

          <div className="border border-border/30 bg-background/5 p-6 rounded-xl space-y-6 font-mono text-sm shadow-tx-lg">
            <div className="flex justify-between items-center border-b border-border/20 pb-4">
              <span className="opacity-70">AI Visibility Score</span>
              <span className="text-xl font-bold text-accent">87/100</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/20 pb-4">
              <span className="opacity-70">AI Citations</span>
              <span className="text-xl font-bold text-primary">↑ 312%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-70">Content Decay Alerts</span>
              <span className="text-xl font-bold">0</span>
            </div>
          </div>

          <div className="border-l-2 border-primary pl-4">
            <p className="text-sm opacity-80 leading-relaxed font-inter italic">
              "We fixed 3 articles and citations appeared in Perplexity within 2
              weeks."
            </p>
            <p className="text-xs opacity-50 mt-2 font-inter mt-3">
              — Sarah K., Content Lead
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
