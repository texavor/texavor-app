import BouncingLogo from "@/components/BouncingLogo";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen bg-[#05140C]">
      <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
        <div className="flex">
          <div className="min-h-[600px] md:rounded-tl-lg md:rounded-bl-lg bg-[#EEDED3]">
            {children}
          </div>
          <div className="w-[600px]  bg-green-950 rounded-tr-md rounded-br-md">
            <BouncingLogo />
          </div>
        </div>
      </div>
    </div>
  );
}
