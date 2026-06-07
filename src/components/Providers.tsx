"use client";

import { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/theme";
import { ToastProvider } from "./Toast/ToastContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <ToastProvider>
        {children}
      </ToastProvider>
    </MantineProvider>
  );
}
