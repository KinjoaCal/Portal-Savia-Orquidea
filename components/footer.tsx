import { Home } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground tracking-tight">
                Savia Orquidea
              </span>
              <span className="text-xs text-muted-foreground">Condominio</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#inicio" className="hover:text-primary transition-colors">Inicio</a>
            <a href="#finanzas" className="hover:text-primary transition-colors">Finanzas</a>
            <a href="#obras" className="hover:text-primary transition-colors">Obras</a>
            <a href="#directiva" className="hover:text-primary transition-colors">Mesa Directiva</a>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Condominio Savia Orquidea. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Villas de Zapopan, 45133 Zapopan, Jal.
          </p>
        </div>
      </div>
    </footer>
  )
}
