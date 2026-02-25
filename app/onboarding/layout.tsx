import BouncingLogo from "@/components/BouncingLogo";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] bg-background tx-dot-bg text-foreground">
      {/* Left side: Form */}
      <div className="flex flex-1 flex-col justify-center p-4 lg:flex-none lg:w-[50vw]">
        {children}
      </div>
      {/* Right side: Logo/Visuals (hidden on mobile) */}
      <div className="relative hidden w-0 flex-1 lg:flex flex-col items-center justify-center bg-foreground tx-dot-bg text-background border-l border-border">
        <div className="w-full max-w-md flex justify-center">
          <BouncingLogo />
        </div>
      </div>
    </div>
  );
}
