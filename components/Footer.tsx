import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="container mx-auto justify-center lg:w-[1200px] md:w-8/12 w-11/12 mt-20 relative overflow-hidden pb-32 md:pb-66">
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
        <Link href="/terms-and-conditions">
          <p className="text-[#0A2918] hover:bg-transparent text-lg font-medium">
            Terms & Condition
          </p>
        </Link>
        <Link href="/privacy-policy">
          <p className="text-[#0A2918] hover:bg-transparent text-lg font-medium">
            Privacy Policy
          </p>
        </Link>
      </div>
      <div className="absolute mt-10 flex justify-center w-full">
        <p className="text-7xl md:text-9xl lg:text-[260px] text-[#030C0712] font-medium">
          EasyWrite
        </p>
      </div>
    </div>
  );
};

export default Footer;
