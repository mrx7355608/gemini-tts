"use client";

import NoSSRWrapper from "./components/NoSSRWrapper";
import HomePage from "./Home";

export default function Home() {
  return (
    <NoSSRWrapper>
      <HomePage />
    </NoSSRWrapper>
  );
}
