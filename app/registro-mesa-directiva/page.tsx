"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, Lock, Mail, User, ArrowLeft, Loader2, UserPlus, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegisterMesaDirectivaPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden. Por favor verifícalas.")
      return
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            role: "admin",
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      setSuccessMsg("¡Registro exitoso! Tu cuenta de la Mesa Directiva ha sido creada.")
      setFullName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")

      // Redirect to admin or login after 2 seconds
      setTimeout(() => {
        if (data.session) {
          router.push("/admin")
        } else {
          router.push("/login")
        }
      }, 2000)
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al procesar el registro.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-muted/20 relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Inicio de Sesión
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-border/50 backdrop-blur-sm bg-background/95">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-8 ring-primary/5">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Registro de Administrador</CardTitle>
            <CardDescription className="mt-1">
              Registro Privado para la Mesa Directiva • Savia Orquídea
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle className="font-medium">Error en el registro</AlertTitle>
              <AlertDescription className="text-sm mt-1">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="mb-6 border-primary/50 text-primary bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertTitle className="font-medium">¡Cuenta Creada!</AlertTitle>
              <AlertDescription className="text-sm mt-1">{successMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Nombre Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Ej: Lic. María Fernández"
                  className="pl-10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
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
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2 gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando Cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Registrar mi Cuenta de Administrador
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col border-t pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Acceso exclusivo proporcionado por la Mesa Directiva del condominio.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
