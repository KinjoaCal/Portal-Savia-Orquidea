"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Megaphone, Calendar, FileText, ExternalLink, Image as ImageIcon, BellOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Comunicado {
  id: string
  title: string
  content: string
  category: string
  file_url?: string
  file_type?: string
  file_name?: string
  created_at: string
}

export function AnnouncementsSection() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
  const [loading, setLoading] = useState(true)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  useEffect(() => {
    async function fetchComunicados() {
      try {
        const { data, error } = await supabase
          .from("comunicados")
          .select("*")
          .order("created_at", { ascending: false })

        if (data) {
          setComunicados(data)
        }
      } catch (err) {
        console.error("Error al consultar comunicados:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchComunicados()
  }, [])

  const categories = ["Todos", ...Array.from(new Set(comunicados.map((c) => c.category)))]

  const filteredComunicados = selectedCategory === "Todos"
    ? comunicados
    : comunicados.filter((c) => c.category === selectedCategory)

  return (
    <section id="comunicados" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full mb-3">
            <Megaphone className="h-3.5 w-3.5" />
            <span>Avisos Oficiales</span>
          </div>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Comunicados de la Mesa Directiva
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Entérate de las últimas noticias, avisos importantes y boletines informativos de nuestra comunidad.
          </p>
        </div>

        {/* Category Filters */}
        {comunicados.length > 0 && categories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full text-xs"
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        {/* Empty State when no comunicados exist */}
        {!loading && comunicados.length === 0 && (
          <Card className="max-w-xl mx-auto border-0 shadow-lg text-center p-8 bg-card">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <BellOff className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl">Sin Comunicados Publicados Actualmente</CardTitle>
            <CardDescription className="mt-2">
              Los comunicados, avisos y noticias de la Mesa Directiva aparecerán publicados en esta sección.
            </CardDescription>
          </Card>
        )}

        {/* Comunicados Grid */}
        {comunicados.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredComunicados.map((item) => {
              const dateStr = new Date(item.created_at).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })

              const isImage = item.file_type === "image" || (item.file_url && /\.(jpg|jpeg|png|webp|gif)/i.test(item.file_url))

              return (
                <Card key={item.id} className="border border-border/60 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow bg-card">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="bg-primary text-primary-foreground font-medium">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {dateStr}
                      </span>
                    </div>
                    <CardTitle className="text-xl leading-snug">{item.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>

                    {/* Image Attachment Preview */}
                    {isImage && item.file_url && (
                      <div 
                        className="relative h-44 w-full rounded-xl overflow-hidden cursor-pointer group mt-3 border"
                        onClick={() => setLightboxImg(item.file_url || null)}
                      >
                        <Image
                          src={item.file_url}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium bg-black/40">
                          <ImageIcon className="h-4 w-4 mr-1" /> Clic para ampliar
                        </div>
                      </div>
                    )}

                    {/* Non-Image Document Attachment */}
                    {!isImage && item.file_url && (
                      <div className="pt-2">
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors w-full justify-center"
                        >
                          <FileText className="h-4 w-4" />
                          Ver / Descargar Adjunto ({item.file_name || "Documento"})
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Images */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={lightboxImg}
              alt="Vista previa de imagen"
              fill
              className="object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20 text-sm"
              onClick={() => setLightboxImg(null)}
            >
              ✕ Cerrar
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
