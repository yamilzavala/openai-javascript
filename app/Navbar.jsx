"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";
import { sourceCodePro } from "./styles/fonts";
import HamburgerMenu from "./components/HamburgerMenu";
const Navbar = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // const Navbar = () => {
  return (
    <nav className="fixed z-10 top-0 bg-gray-50 text-gray-800 w-full p-4 grid grid-cols-3 items-center">
      <a href="/" className={`text-center`}>
        LANGCHAIN JS
      </a>
      {isClient && <HamburgerMenu />}{" "}
      {/* Render HamburgerMenu component on the client side */}
      <p className={`text-center`}>OPEN AI</p>
      <div className="hidden">
        <Link href="/">Home 🏡 </Link>
        {/* Projects */}
        {/* <Link href="/page-template">Page Template ©️</Link> */}
        {/* Short Tutorials */}
        {/* <Link href="/chatcompletions">Chat Completions 💬</Link> */}
        <Link href="/pdf">PDF-GPT 👨🏻‍🏫</Link>
        <Link href="/memory">Memory 🧠</Link>
        <Link href="/streaming">Streaming 🌊</Link>

        {/* Documents / QA */}
        <Link href="/transcript-qa">YouTube Video Chat 💬</Link>

        {/* APIs, Templates, Agents */}
        <Link href="/content-generator">AI Content Wizard 🧙🏼</Link>

        {/* Documents / Database */}
        <Link href="/resume-reader">RoboHR 🤖</Link>
        <Link href="/api-tester">Testing ⚠️</Link>

        {/* When Time */}
        {/* DALL E */}

        {/* <Link href="/youtubeagent">YouTube Agent ▶️ </Link> */}
        {/* <Link href="/pdf">Celebrity AI 🤳🏽</Link> */}
        {/* Tutorials */}
        {/* <Link href="/agents">Agents 🕵🏼</Link> */}
        {/* New Page: */}
        {/* E.g. For a new link to  app/newpage/page.jsx */}
        {/* <Link href="/[APP_FOLDER_NAME]">New Page 📄</Link> */}
      </div>
    </nav>
  );
};

export default Navbar;
