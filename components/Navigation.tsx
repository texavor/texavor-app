/* eslint-disable */
/* @ts-nocheck */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleIcon,
  Phone,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "./ui/input";
import Image from "next/image";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axiosInstace";
//@ts-ignore
import ct from "countries-and-timezones";

const navigationLink: any = [
  {
    title: "Blog",
    href: "/blog",
    type: "simple",
  },
  // {
  //   title: "Pricing",
  //   href: "/pricing ",
  //   type: "simple",
  // },
  // {
  //   title: "About Us",
  //   href: "/about-us",
  //   type: "simple",
  // },
  // {
  //   title: "Contact Us",
  //   href: "/contact-us",
  //   type: "simple",
  // },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzInfo = ct.getTimezone(timezone);

  const joinWaitlist = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      await axiosInstance.post("/waitlists", {
        email,
        country: ct?.getCountry(tzInfo?.countries?.[0])?.name,
      });
      setEmail("");
      toast?.success("You have been added to the waitlist!");
    } catch (error: any) {
      console.log(error);
    }
  };

  const closeSheet = () => setIsOpen(false);

  return (
    <div className="sticky top-0 bg-[#F9F4F0] z-50 py-4">
      <div className="flex items-center justify-between w-full md:max-w-[1200px] mx-auto py-2 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-[62px] h-[36px] overflow-hidden absolute">
            <Image
              src="/singlelogo.png"
              alt="Texavor"
              height={24}
              width={24}
              className="absolute opacity-0 group-hover:opacity-100 top-0 left-1/2 -translate-x-1/2 rotate-180 transition-transform duration-300 ease-in-out -translate-y-10 group-hover:translate-y-0"
            />
            <Image
              src="/singlelogo.png"
              alt="Texavor"
              height={24}
              width={24}
              className="absolute opacity-0 group-hover:opacity-100 top-[13px] left-[10px] transition-transform duration-300 delay-100 ease-in-out translate-y-10 group-hover:translate-y-0"
            />
            <Image
              src="/singlelogo.png"
              alt="Texavor"
              height={24}
              width={24}
              className="absolute opacity-0 group-hover:opacity-100 top-[13px] left-[29px] transition-transform duration-300 ease-in-out translate-y-10 group-hover:translate-y-0"
            />
          </div>
          <div className="relative w-[62px] h-[36px] overflow-hidden group-hover:opacity-0">
            <Image
              src="/singlelogo.png"
              alt="Texavor"
              height={24}
              width={24}
              className="absolute top-0 left-1/2 -translate-x-1/2 rotate-180"
            />
            <Image
              src="/singlelogo.png"
              alt="Texavor"
              height={24}
              width={24}
              className="absolute top-[13px] left-[10px]"
            />
            <Image
              src="/singlelogo.png"
              alt="Texavor"
              height={24}
              width={24}
              className="absolute top-[13px] left-[29px]"
            />
          </div>
          <p className="text-[#104127] font-bold text-[24px]">Texavor</p>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="w-[300px] flex justify-center">
            <div className="relative w-full">
              <Input
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-5 pr-9 shadow-md font-medium w-full focus-visible:ring-0 border-0 placeholder:text-[#AAAAAA] bg-white h-10 rounded-full"
              />

              <Button
                onClick={joinWaitlist}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-[#104127] hover:bg-[#104127] rounded-full h-6 w-6 p-2"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              {navigationLink?.map((link: any, index: number) => (
                <NavigationList
                  key={index}
                  title={link?.title}
                  subMenu={link?.subMenu}
                  type={link?.type}
                  href={link?.href}
                />
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-[#1A4048]" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[350px] overflow-y-auto"
            >
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-[#1A4048] text-xl font-bold">
                  Menu
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col space-y-2">
                {navigationLink?.map((link: any, index: number) => (
                  <MobileNavigationItem
                    key={index}
                    title={link?.title}
                    subMenu={link?.subMenu}
                    type={link?.type}
                    href={link?.href}
                    closeSheet={closeSheet}
                  />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navigation;

function NavigationList({ title, type, href, subMenu, ...props }: any) {
  return (
    <li {...props}>
      {type === "simple" ? (
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} hover:bg-transparent focus:bg-transparent`}
          >
            <Link href={href}>
              <p className="text-lg text-[#1A1A1A]">{title}</p>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ) : (
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-lg">
            <p className="text-[#1A1A1A]">{title}</p>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                {subMenu?.map((item: any) => {
                  return (
                    <NavigationMenuLink asChild key={item?.href} className="">
                      <Link href={item?.href}>
                        <p className="text-normal text-[#1A4048]">
                          {item?.title}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  );
                })}
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      )}
    </li>
  );
}

function MobileNavigationItem({ title, type, href, subMenu, closeSheet }: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (type === "simple") {
    return (
      <SheetClose asChild>
        <Link
          href={href}
          className="flex items-center justify-between py-3 px-2 text-[#1A4048] font-medium hover:text-[#05C8E8] hover:bg-gray-50 rounded-lg transition-all duration-200"
          onClick={closeSheet}
        >
          {title}
        </Link>
      </SheetClose>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-2 text-[#1A4048] font-medium hover:text-[#05C8E8] hover:bg-gray-50 rounded-lg transition-all duration-200">
        {title}
        <ChevronRight
          className={`h-4 w-4 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-4 mt-1 space-y-1">
        {subMenu?.map((item: any) => (
          <SheetClose asChild key={item?.href}>
            <Link
              href={item?.href}
              className="block py-2 px-3 text-sm text-[#1A4048] hover:text-[#05C8E8] hover:bg-gray-50 rounded-md transition-all duration-200"
              onClick={closeSheet}
            >
              {item?.title}
            </Link>
          </SheetClose>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
