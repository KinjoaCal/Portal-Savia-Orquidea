"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Uncaught application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-background rounded-2xl shadow-xl border border-border">
        <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Ocurrió un error al cargar la página
          </h2>
          <p className="text-sm text-muted-foreground">
            No te preocupes, esto se puede solucionar intentando recargar la página.
          </p>
          {error?.message && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs font-mono text-left text-muted-foreground overflow-auto max-h-32">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} className="w-full sm:w-auto gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar Carga
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Ir al Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
