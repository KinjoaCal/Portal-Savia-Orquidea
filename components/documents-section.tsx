"use client"

import { useEffect, useState } from "react"
import { FileText, Download, ShieldCheck, FileCheck, Search, ExternalLink, FolderOpen } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Documento {
  id: string
  title: string
  description?: string
  category: string
  file_url: string
  file_type?: string
  file_name?: string
  created_at: string
}

export function DocumentsSection() {
  const [documents, setDocuments] = useState<Documento[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const { data, error } = await supabase
          .from("documentos")
          .select("*")
          .order("created_at", { ascending: false })

        if (data) {
          setDocuments(data)
        }
      } catch (err) {
        console.error("Error al consultar documentos:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section id="documentos" className="py-24 bg-muted/40 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent bg-accent/10 px-3.5 py-1.5 rounded-full mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Transparencia y Documentación</span>
          </div>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Documentos Oficiales del Condominio
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Consulta y descarga los reglamentos internos, actas de asamblea y formatos oficiales.
          </p>
        </div>

        {/* Search Input (Only if documents exist) */}
        {documents.length > 0 && (
          <div className="max-w-md mx-auto mb-10 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, categoría o palabra clave..."
              className="pl-10 rounded-full shadow-sm bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Empty State when no documents exist */}
        {!loading && documents.length === 0 && (
          <Card className="max-w-xl mx-auto border-0 shadow-lg text-center p-8 bg-card">
            <div className="h-16 w-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
              <FolderOpen className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl">Sin Documentos Publicados Actualmente</CardTitle>
            <CardDescription className="mt-2">
              Los documentos oficiales, reglamentos o formatos subidos por la Mesa Directiva aparecerán disponibles en esta sección.
            </CardDescription>
          </Card>
        )}

        {/* Documents Grid */}
        {documents.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((doc) => (
              <Card key={doc.id} className="border-0 shadow-md hover:shadow-lg transition-all bg-card flex flex-col justify-between">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs font-medium">
                      {doc.category}
                    </Badge>
                    <FileCheck className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg leading-snug">{doc.title}</CardTitle>
                  {doc.description && (
                    <CardDescription className="text-sm line-clamp-3">
                      {doc.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full justify-between gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Descargar / Consultar
                      </span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
