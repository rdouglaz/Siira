"use client"

import { AppProvider } from "@/context/AppContext"
import { WordsProvider } from "@/context/WordsContext"
import { AuthProvider } from "@/context/AuthContext"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { type ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <WordsProvider>
            {children}
          </WordsProvider>
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  )
}