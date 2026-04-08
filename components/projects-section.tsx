"use client"

import { useState } from "react"
import Image from "next/image"
import { Wrench, Clock, CheckCircle2, X, ChevronLeft, ChevronRight, Images } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const projects = [
  {
    id: 1,
    title: "Construcción de bodega",
    description: "Bodega para meterial de mantenimiento y mobiliario",
    status: "programado",
    progress: 0,
    budget: 45000,
    startDate: "Pendiente",
    estimatedEnd: "Pendiente",
    images: [
      "/images/bodega.jpg"
    ]
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
    images: [
      "/images/Juegos.jpg"
    ]
  },
  {
    id: 3,
    title: "Instalación de césped sintético en area de juego/terraza",
    description: "Reemplazo de cespéd natural por césped sintético en area de juego/terraza",
    status: "programado",
    progress: 0,
    budget: 28000,
    startDate: "Pendiente",
    estimatedEnd: "Pendiente",
    images: [
      "/images/cesped.jpg"
    ]
  },
  {
    id: 4,
    title: "Instalación de césped sintético en cenefas ",
    description: "Reemplazo de cespéd natural por césped sintético en cenefas.",
    status: "programado",
    progress: 0,
    budget: 62000,
    startDate: "Pendiente",
    estimatedEnd: "Pendiente",
    images: [
      "/images/cesped.jpg"
    ]
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

interface GalleryState {
  isOpen: boolean
  projectId: number | null
  currentIndex: number
}

export function ProjectsSection() {
  const [gallery, setGallery] = useState<GalleryState>({
    isOpen: false,
    projectId: null,
    currentIndex: 0,
  })

  const currentProject = projects.find((p) => p.id === gallery.projectId)
  const currentImages = currentProject?.images || []

  const openGallery = (projectId: number) => {
    setGallery({ isOpen: true, projectId, currentIndex: 0 })
  }

  const closeGallery = () => {
    setGallery({ isOpen: false, projectId: null, currentIndex: 0 })
  }

  const nextImage = () => {
    setGallery((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % currentImages.length,
    }))
  }

  const prevImage = () => {
    setGallery((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + currentImages.length) % currentImages.length,
    }))
  }

  const goToImage = (index: number) => {
    setGallery((prev) => ({ ...prev, currentIndex: index }))
  }

  return (
    <>
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
                  <div 
                    className="relative h-48 w-full cursor-pointer group"
                    onClick={() => openGallery(project.id)}
                  >
                    <Image
                      src={project.images[0]}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-background/90 text-foreground px-4 py-2 rounded-full">
                        <Images className="h-4 w-4" />
                        <span className="text-sm font-medium">Ver galería ({project.images.length})</span>
                      </div>
                    </div>
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

      {/* Gallery Modal */}
      {gallery.isOpen && currentProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-sm"
          onClick={closeGallery}
        >
          <div 
            className="relative w-full max-w-5xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-background hover:text-background/80 hover:bg-transparent"
              onClick={closeGallery}
            >
              <X className="h-8 w-8" />
              <span className="sr-only">Cerrar galería</span>
            </Button>

            {/* Title */}
            <h3 className="absolute -top-12 left-0 text-background text-xl font-semibold">
              {currentProject.title}
            </h3>

            {/* Main Image */}
            <div className="relative aspect-video bg-background rounded-lg overflow-hidden">
              <Image
                src={currentImages[gallery.currentIndex]}
                alt={`${currentProject.title} - Imagen ${gallery.currentIndex + 1}`}
                fill
                className="object-contain"
              />

              {/* Navigation Arrows */}
              {currentImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full h-12 w-12"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Imagen anterior</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full h-12 w-12"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                    <span className="sr-only">Siguiente imagen</span>
                  </Button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-foreground/80 text-background px-4 py-2 rounded-full text-sm">
                {gallery.currentIndex + 1} / {currentImages.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex justify-center gap-3 mt-4">
              {currentImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`relative w-20 h-14 rounded-md overflow-hidden border-2 transition-all ${
                    index === gallery.currentIndex 
                      ? "border-primary ring-2 ring-primary/50" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
