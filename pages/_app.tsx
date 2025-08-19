import "../faust.config";
import React from "react";
import { useRouter } from "next/router";
import { AppProps } from "next/app"; // Import AppProps
import { FaustProvider } from "@faustwp/core";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) { // Add AppProps type
  const router = useRouter();

  return (
    <FaustProvider pageProps={pageProps}>
      <Component {...pageProps} key={router.asPath} />
    </FaustProvider>
  );
}
