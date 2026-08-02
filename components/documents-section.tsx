"use client"

import { useEffect, useState } from "react"
import { FileText, Download, ShieldCheck, FileCheck, Search, ExternalLink } from "lucide-react"
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

// Fallback demo documents
const demoDocuments: Documento[] = [
  {
    id: "doc-demo-1",
    title: "Reglamento Interno de Convivencia y Áreas Comunes",
    description: "Normas generales para residentes, uso de terraza, estacionamientos y convivencia armónica.",
    category: "Reglamento",
    file_url: "#",
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-demo-2",
    title: "Formato de Solicitud de Mudanza y Registro de Mascotas",
    description: "Formato oficial a llenar y entregar a la Mesa Directiva con anticipación.",
    category: "Formato",
    file_url: "#",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
]

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

        if (error || !data || data.length === 0) {
          setDocuments(demoDocuments)
        } else {
          setDocuments(data)
        }
      } catch (err) {
        console.warn("Usando documentos informativos locales:", err)
        setDocuments(demoDocuments)
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

        {/* Search Input */}
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

        {/* Documents Grid */}
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
      </div>
    </section>
  )
}
