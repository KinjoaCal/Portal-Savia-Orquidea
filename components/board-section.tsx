import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const boardMembers = [
  {
    name: "Ramses",
    role: "Presidente",
    initials: "R",
    description: "Coordinación general y representación legal del condominio ante autoridades.",
  },
  {
    name: "San Juana",
    role: "Vicepresidente",
    initials: "S",
    description: "Apoyo a la presidencia y coordinación de comités especiales.",
  },
  {
    name: "Edgar Espinoza",
    role: "Tesorera",
    initials: "E",
    description: "Administración de fondos, cobro de cuotas y control de egresos.",
  },
  {
    name: "Laura",
    role: "Vocal",
    initials: "L",
    description: "Actas de asamblea, comunicados oficiales y archivo documental.",
  },
  {
    name: "Alejandro Calderon",
    role: "Vocal",
    initials: "A",
    description: "Supervisión de seguridad y coordinación con personal de caseta.",
  }
]

export function BoardSection() {
  return (
    <section id="directiva" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
            Gestión 2025-2027
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Mesa Directiva
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Conoce a los vecinos que representan y trabajan por el bienestar de nuestra comunidad.
          </p>
        </div>

        {/* Board Members Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {boardMembers.map((member) => (
            <Card key={member.name} className="border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                    <p className="text-sm font-medium text-primary">{member.role}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {member.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <Card className="inline-block border-0 shadow-lg bg-primary text-primary-foreground px-8 py-6">
            <p className="text-lg font-semibold">¿Tienes alguna inquietud?</p>
            <p className="text-sm opacity-90 mt-1">
              Contáctanos en{" "}
              <a href="mailto:mesa@losjardines.com" className="underline hover:no-underline">
                mesa@losjardines.com
              </a>
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
