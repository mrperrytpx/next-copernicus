import React, { useEffect, useRef, useState } from "react";

interface IAccordionProps {
  children: React.ReactNode;
  title: string;
}

const TriangleIcon = ({ isExpanded }: { isExpanded: boolean }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="white"
      className={`transform fill-black transition-transform duration-300 ${
        isExpanded ? "rotate-180" : "rotate-0"
      }`}
    >
      <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"></path>
    </svg>
  );
};

export const Accordion = ({ children, title }: IAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col  items-center justify-start bg-white">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-2 p-2 shadow-sm"
      >
        <p className="select-none text-sm font-bold uppercase">{title}</p>
        <TriangleIcon isExpanded={isExpanded} />
      </div>
      <div
        className="flex max-h-0 w-full flex-col justify-center gap-1 overflow-y-hidden transition-all duration-75 ease-linear lg:flex-row"
        style={{
          maxHeight: isExpanded ? "100rem" : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};
