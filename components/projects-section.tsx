"use client"

import Image from "next/image"
import { Wrench, Clock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const projects = [
  {
    id: 1,
    title: "Construcción de bodega",
    description: "Bodega para meterial de mantenimiento y mobiliario",
    status: "en_proceso",
    progress: 0,
    budget: 45000,
    startDate: "Pendiente",
    estimatedEnd: "Pendiente",
    image: "/public/images/bodega.jpg"
  },
  {
    id: 2,
    title: "Remodelación de Área de Juegos",
    description: "Recolección y remodelación de juegos infantiles.",
    status: "en_proceso",
    progress: 10,
    budget: 85000,
    startDate: "Marzo 2026",
    estimatedEnd: "Pendiente",
    image: "/public/images/Juegos.jpg"
  },
  {
    id: 3,
    title: "Instalación de césped sintético en area de juego/terraza",
    description: "Remmplazo de cespéd natural por césped sintético en area de juego/terraza",
    status: "programado",
    progress: 0,
    budget: 28000,
    startDate: "Pendiente",
    estimatedEnd: "Pendiente",
    image: "/public/images/cesped.jpg"
  },
  {
    id: 4,
    title: "Instalación de césped sintético en cenefas ",
    description: "Remmplazo de cespéd natural por césped sintético en cenefas.",
    status: "completado",
    progress: 100,
    budget: 62000,
    startDate: "Enero 2026",
    estimatedEnd: "Febrero 2026",
    image: "/public/images/cesped.jpg"
  },
]

const statusConfig = {
  en_proceso: {
    label: "En Proceso",
    icon: Wrench,
    variant: "default" as const,
    className: "bg-primary text-primary-foreground",
  },
  programado: {
    label: "Programado",
    icon: Clock,
    variant: "secondary" as const,
    className: "bg-muted text-muted-foreground",
  },
  completado: {
    label: "Completado",
    icon: CheckCircle2,
    variant: "outline" as const,
    className: "bg-accent text-accent-foreground",
  },
}

export function ProjectsSection() {
  return (
    <section id="obras" className="py-24 bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
            Mejoras Continuas
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Obras en Proceso
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Conoce los proyectos actuales y programados para mejorar nuestras áreas comunes.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => {
            const status = statusConfig[project.status as keyof typeof statusConfig]
            const StatusIcon = status.icon

            return (
              <Card key={project.id} className="border-0 shadow-lg overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={status.className}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <CardDescription className="mt-2 leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progreso</span>
                      <span className="text-sm font-medium text-foreground">{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Presupuesto</p>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        ${project.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Período</p>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        {project.startDate} - {project.estimatedEnd}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Card className="border-0 shadow-md bg-card text-center py-6">
            <div className="text-3xl font-bold text-primary">2</div>
            <p className="text-sm text-muted-foreground mt-1">Obras en proceso</p>
          </Card>
          <Card className="border-0 shadow-md bg-card text-center py-6">
            <div className="text-3xl font-bold text-foreground">1</div>
            <p className="text-sm text-muted-foreground mt-1">Obra programada</p>
          </Card>
          <Card className="border-0 shadow-md bg-card text-center py-6">
            <div className="text-3xl font-bold text-accent">1</div>
            <p className="text-sm text-muted-foreground mt-1">Obra completada</p>
          </Card>
        </div>
      </div>
    </section>
  )
}
