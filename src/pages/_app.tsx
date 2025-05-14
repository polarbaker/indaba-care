import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

// Basic App component without Chakra UI to avoid version conflicts
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Indaba Care</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
