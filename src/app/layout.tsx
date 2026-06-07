import "@mantine/core/styles.css";
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/carousel/styles.css';
import "./globals.css";

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { WebHeader } from "@/components/Headers/WebHeader";
import { Providers } from "@/components/Providers";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "WCWCPP",
  icons: {
    icon: "/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps} style={{ colorScheme: 'dark' }}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body className="antialiased">
        <Providers>
          <WebHeader />
          <main>{children}</main>
        </Providers>
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      </body>
    </html>
  );
}
