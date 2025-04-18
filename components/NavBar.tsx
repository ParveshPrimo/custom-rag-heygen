"use client";

import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ThemeSwitch } from "./ThemeSwitch";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && theme === "dark"
    ? "/maslow-logo-dark.webp"
    : "/maslow-logo-light.webp";

  return (
    <Navbar className="w-full">
      <NavbarBrand>
        <Link isExternal aria-label="Maslow" href="https://maslow.ai/">
          <Image
            src={logoSrc}
            alt="Maslow Logo"
            width={170}
            height={70}
          />
        </Link>
        <div className="bg-gradient-to-r from-[#EE7BB3] to-[#6DC4AD] bg-clip-text ml-4">
          <p className="text-xl font-semibold text-transparent">
            Fusion Face
          </p>
        </div>
      </NavbarBrand>
      <NavbarContent justify="center">
        <NavbarItem className="flex flex-row items-center gap-4">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
