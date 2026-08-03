"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, Lock, Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    // Listen to state changes & get initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      if (session) {
        router.replace("/admin")
      } else {
        setCheckingAuth(false)
      }
    })

    // Fallback timeout in case auth check takes too long on mobile networks
    const timer = setTimeout(() => {
      if (isMounted) setCheckingAuth(false)
    }, 2500)

    return () => {
      isMounted = false
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [router])


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Correo electrónico o contraseña incorrectos. Verifica tus datos de la Mesa Directiva.")
        } else {
          setErrorMsg(error.message)
        }
        return
      }

      if (data?.session) {
        router.push("/admin")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error inesperado al intentar iniciar sesión.")
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Verificando acceso...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-muted/20 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Home link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al sitio principal
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-border/50 backdrop-blur-sm bg-background/95">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-8 ring-primary/5">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Portal Mesa Directiva</CardTitle>
            <CardDescription className="mt-1">
              Condominio Residencial Savia Orquídea
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle className="font-medium">Error de acceso</AlertTitle>
              <AlertDescription className="text-sm mt-1">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Institucional / Registrado</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@saviaorquidea.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2 gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando Sesión...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Ingresar al Panel Administrativo
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col border-t pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Acceso restringido para administradores del condominio.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
