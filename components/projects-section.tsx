"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Wrench, Clock, CheckCircle2, X, ChevronLeft, ChevronRight, Images } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Project {
  id: string | number
  title: string
  description?: string
  status: "en_proceso" | "programado" | "completado" | string
  progress: number
  budget: number
  startDate?: string
  estimatedEnd?: string
  start_date?: string
  estimated_end?: string
  images: string[]
}

const staticProjects: Project[] = [
  {
    id: 1,
    title: "Construcción de bodega",
    description: "Bodega para material de mantenimiento y mobiliario",
    status: "programado",
    progress: 0,
    budget: 45000,
    startDate: "Pendiente",
    estimatedEnd: "Pendiente",
    images: ["/images/bodega.jpg"],
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
    images: ["/images/Juegos.jpg"],
  },
  {
    id: 3,
    title: "Instalación de césped sintético en área de juego/terraza",
    description: "Reemplazo de césped natural por césped sintético en área de juego/terraza",
    status: "programado",
    progress: 0,
    budget: 28000,
    startDate: "Pendiente",
    estimatedEnd: "Pendiente",
    images: ["/images/cesped.jpg"],
  },
  {
    id: 4,
    title: "Instalación de césped sintético en cenefas",
    description: "Reemplazo de césped natural por césped sintético en cenefas.",
    status: "programado",
    progress: 0,
    budget: 62000,
    startDate: "Pendiente",
    estimatedEnd: "Pendiente",
    images: ["/images/cesped.jpg"],
  },
]

const statusConfig = {
  en_proceso: {
    label: "En Proceso",
    icon: Wrench,
    className: "bg-primary text-primary-foreground",
  },
  programado: {
    label: "Programado",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  completado: {
    label: "Completado",
    icon: CheckCircle2,
    className: "bg-accent text-accent-foreground",
  },
}

interface GalleryState {
  isOpen: boolean
  projectId: string | number | null
  currentIndex: number
}

export function ProjectsSection() {
  const [projectsList, setProjectsList] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [gallery, setGallery] = useState<GalleryState>({
    isOpen: false,
    projectId: null,
    currentIndex: 0,
  })

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from("proyectos")
          .select("*")
          .order("created_at", { ascending: false })

        if (error || !data || data.length === 0) {
          setProjectsList(staticProjects)
        } else {
          setProjectsList(data)
        }
      } catch (err) {
        console.warn("Usando obras informativas locales:", err)
        setProjectsList(staticProjects)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const currentProject = projectsList.find((p) => p.id === gallery.projectId)
  const currentImages = currentProject?.images && currentProject.images.length > 0 
    ? currentProject.images 
    : ["/images/Juegos.jpg"]

  const openGallery = (projectId: string | number) => {
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

  const inProgressCount = projectsList.filter((p) => p.status === "en_proceso").length
  const scheduledCount = projectsList.filter((p) => p.status === "programado").length
  const completedCount = projectsList.filter((p) => p.status === "completado").length

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
              Obras y Proyectos
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Conoce las obras en curso y las galerías de avances de nuestro residencial.
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {projectsList.map((project) => {
              const statusKey = (project.status in statusConfig ? project.status : "en_proceso") as keyof typeof statusConfig
              const status = statusConfig[statusKey]
              const StatusIcon = status.icon
              const displayImage = project.images && project.images.length > 0 ? project.images[0] : "/images/Juegos.jpg"
              const imagesCount = project.images ? project.images.length : 1

              const startDateDisplay = project.startDate || project.start_date || "Pendiente"
              const estimatedEndDisplay = project.estimatedEnd || project.estimated_end || "Pendiente"

              return (
                <Card key={project.id} className="border-0 shadow-lg overflow-hidden flex flex-col justify-between">
                  <div>
                    <div 
                      className="relative h-52 w-full cursor-pointer group bg-muted"
                      onClick={() => openGallery(project.id)}
                    >
                      <Image
                        src={displayImage}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-background/90 text-foreground px-4 py-2 rounded-full shadow-lg text-xs font-semibold">
                          <Images className="h-4 w-4" />
                          <span>Ver galería ({imagesCount} {imagesCount === 1 ? "foto" : "fotos"})</span>
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
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      {project.description && (
                        <CardDescription className="mt-2 leading-relaxed">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </div>

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
                          style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Presupuesto</p>
                        <p className="text-sm font-semibold text-foreground mt-1">
                          ${Number(project.budget || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Período</p>
                        <p className="text-sm font-semibold text-foreground mt-1">
                          {startDateDisplay} - {estimatedEndDisplay}
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
              <div className="text-3xl font-bold text-primary">{inProgressCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Obras en proceso</p>
            </Card>
            <Card className="border-0 shadow-md bg-card text-center py-6">
              <div className="text-3xl font-bold text-foreground">{scheduledCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Obras programadas</p>
            </Card>
            <Card className="border-0 shadow-md bg-card text-center py-6">
              <div className="text-3xl font-bold text-accent">{completedCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Obras completadas</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {gallery.isOpen && currentProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={closeGallery}
        >
          <div 
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Title */}
            <div className="flex items-center justify-between mb-3 text-white">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Images className="h-5 w-5 text-primary" />
                {currentProject.title}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={closeGallery}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Main Image */}
            <div className="relative aspect-video bg-black/60 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full h-12 w-12 border border-white/20"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full h-12 w-12 border border-white/20"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-1.5 rounded-full text-xs font-medium border border-white/20">
                {gallery.currentIndex + 1} / {currentImages.length}
              </div>
            </div>

            {/* Thumbnails */}
            {currentImages.length > 1 && (
              <div className="flex justify-center gap-3 mt-4 overflow-x-auto py-2">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      index === gallery.currentIndex 
                        ? "border-primary ring-2 ring-primary/50 scale-105" 
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
            )}
          </div>
        </div>
      )}
    </>
  )
}
