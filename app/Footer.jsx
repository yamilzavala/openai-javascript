import React from "react";
import { sourceCodePro } from "./styles/fonts";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer
      className={`p-4 bg-gray-800 text-white w-full grid grid-cols-3 fixed bottom-0 ${sourceCodePro.className}`}
    >
      <p className={`text-center ${sourceCodePro.className}`}>
        Yamil Zavala
      </p>
      <p className={`text-center ${sourceCodePro.className}`}>
        &copy; LangChain JS {year}
      </p>
      <p className={`text-center ${sourceCodePro.className}`}>
        Open AI
      </p>
    </footer>
  );
};

export default Footer;
