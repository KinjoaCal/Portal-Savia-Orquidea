"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Shield, LogOut, Upload, FileText, Megaphone, Trash2, 
  CheckCircle2, AlertCircle, Loader2, Home, FileUp, Image as ImageIcon,
  ExternalLink, Plus, RefreshCw
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ComunicadoItem {
  id: string
  title: string
  content: string
  category: string
  file_url?: string
  file_type?: string
  file_name?: string
  created_at: string
}

interface DocumentoItem {
  id: string
  title: string
  description?: string
  category: string
  file_url: string
  file_type?: string
  file_name?: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Form states for Comunicado
  const [comunicadoTitle, setComunicadoTitle] = useState("")
  const [comunicadoCategory, setComunicadoCategory] = useState("Comunicado")
  const [comunicadoContent, setComunicadoContent] = useState("")
  const [comunicadoFile, setComunicadoFile] = useState<File | null>(null)
  const [submittingComunicado, setSubmittingComunicado] = useState(false)
  const [comunicadoMsg, setComunicadoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form states for Documento
  const [docTitle, setDocTitle] = useState("")
  const [docCategory, setDocCategory] = useState("Reglamento")
  const [docDescription, setDocDescription] = useState("")
  const [docFile, setDocFile] = useState<File | null>(null)
  const [submittingDoc, setSubmittingDoc] = useState(false)
  const [docMsg, setDocMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Data lists
  const [comunicadosList, setComunicadosList] = useState<ComunicadoItem[]>([])
  const [documentosList, setDocumentosList] = useState<DocumentoItem[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace("/login")
          return
        }
        setUserEmail(session.user?.email || "Mesa Directiva")
        await loadData()
      } catch (err) {
        console.error("Error al autenticar:", err)
        router.replace("/login")
      } finally {
        setLoadingAuth(false)
      }
    }

    checkAuthAndLoad()
  }, [router])

  const loadData = async () => {
    setLoadingData(true)
    try {
      const { data: coms } = await supabase
        .from("comunicados")
        .select("*")
        .order("created_at", { ascending: false })

      const { data: docs } = await supabase
        .from("documentos")
        .select("*")
        .order("created_at", { ascending: false })

      if (coms) setComunicadosList(coms)
      if (docs) setDocumentosList(docs)
    } catch (err) {
      console.error("Error al cargar datos:", err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Handle Comunicado Submission
  const handleCreateComunicado = async (e: React.FormEvent) => {
    e.preventDefault()
    setComunicadoMsg(null)
    setSubmittingComunicado(true)

    try {
      let fileUrl = ""
      let fileType = ""
      let fileName = ""

      if (comunicadoFile) {
        const uploadRes = await uploadToCloudinary(comunicadoFile)
        fileUrl = uploadRes.secure_url
        fileType = comunicadoFile.type.startsWith("image/") ? "image" : "document"
        fileName = comunicadoFile.name
      }

      const { error } = await supabase.from("comunicados").insert([
        {
          title: comunicadoTitle,
          content: comunicadoContent,
          category: comunicadoCategory,
          file_url: fileUrl || null,
          file_type: fileType || null,
          file_name: fileName || null,
        },
      ])

      if (error) throw new Error(error.message)

      setComunicadoMsg({ type: "success", text: "¡Comunicado publicado con éxito!" })
      setComunicadoTitle("")
      setComunicadoContent("")
      setComunicadoFile(null)
      await loadData()
    } catch (err: any) {
      setComunicadoMsg({ type: "error", text: err.message || "Error al publicar comunicado." })
    } finally {
      setSubmittingComunicado(false)
    }
  }

  // Handle Document Submission
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    setDocMsg(null)

    if (!docFile) {
      setDocMsg({ type: "error", text: "Por favor selecciona un archivo PDF o documento." })
      return
    }

    setSubmittingDoc(true)

    try {
      const uploadRes = await uploadToCloudinary(docFile)

      const { error } = await supabase.from("documentos").insert([
        {
          title: docTitle,
          description: docDescription,
          category: docCategory,
          file_url: uploadRes.secure_url,
          file_type: docFile.name.endsWith(".pdf") ? "pdf" : "doc",
          file_name: docFile.name,
        },
      ])

      if (error) throw new Error(error.message)

      setDocMsg({ type: "success", text: "¡Documento subido y publicado correctamente!" })
      setDocTitle("")
      setDocDescription("")
      setDocFile(null)
      await loadData()
    } catch (err: any) {
      setDocMsg({ type: "error", text: err.message || "Error al subir el documento." })
    } finally {
      setSubmittingDoc(false)
    }
  }

  // Handle Deleting Comunicado
  const handleDeleteComunicado = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este comunicado?")) return
    setDeletingId(id)
    try {
      const { error } = await supabase.from("comunicados").delete().eq("id", id)
      if (error) throw new Error(error.message)
      await loadData()
    } catch (err: any) {
      alert("Error al eliminar: " + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  // Handle Deleting Document
  const handleDeleteDocument = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este documento?")) return
    setDeletingId(id)
    try {
      const { error } = await supabase.from("documentos").delete().eq("id", id)
      if (error) throw new Error(error.message)
      await loadData()
    } catch (err: any) {
      alert("Error al eliminar: " + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Cargando panel de administración...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Top Navbar */}
      <header className="bg-background border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-foreground leading-none">Panel de Administración</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Savia Orquídea • {userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Ver Sitio Público
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Tabs defaultValue="comunicado" className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-2xl bg-muted p-1 rounded-xl">
            <TabsTrigger value="comunicado" className="gap-2">
              <Megaphone className="h-4 w-4" />
              <span>Publicar Comunicado</span>
            </TabsTrigger>
            <TabsTrigger value="documento" className="gap-2">
              <FileUp className="h-4 w-4" />
              <span>Subir Documento</span>
            </TabsTrigger>
            <TabsTrigger value="gestion" className="gap-2">
              <FileText className="h-4 w-4" />
              <span>Gestionar ({comunicadosList.length + documentosList.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Publicar Comunicados */}
          <TabsContent value="comunicado">
            <Card className="shadow-lg border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Publicar Nuevo Comunicado o Aviso
                </CardTitle>
                <CardDescription>
                  Los avisos publicados aparecerán inmediatamente en la página principal para todos los vecinos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {comunicadoMsg && (
                  <Alert
                    variant={comunicadoMsg.type === "success" ? "default" : "destructive"}
                    className={`mb-6 ${
                      comunicadoMsg.type === "success" ? "border-primary/50 text-primary bg-primary/5" : ""
                    }`}
                  >
                    {comunicadoMsg.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {comunicadoMsg.type === "success" ? "Publicación exitosa" : "Error"}
                    </AlertTitle>
                    <AlertDescription>{comunicadoMsg.text}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleCreateComunicado} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="com-title">Título del Comunicado *</Label>
                      <Input
                        id="com-title"
                        placeholder="Ej: Mantenimiento programado de cisterna central"
                        value={comunicadoTitle}
                        onChange={(e) => setComunicadoTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="com-category">Categoría</Label>
                      <Select value={comunicadoCategory} onValueChange={setComunicadoCategory}>
                        <SelectTrigger id="com-category">
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Comunicado">Comunicado General</SelectItem>
                          <SelectItem value="Aviso">Aviso Importante</SelectItem>
                          <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                          <SelectItem value="Evento">Evento / Asamblea</SelectItem>
                          <SelectItem value="Urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="com-content">Contenido / Detalle del Comunicado *</Label>
                    <Textarea
                      id="com-content"
                      placeholder="Escribe aquí los detalles del aviso o comunicado para la comunidad..."
                      rows={5}
                      value={comunicadoContent}
                      onChange={(e) => setComunicadoContent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="com-file">Adjuntar Archivo (Opcional - Imagen o Documento PDF)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="com-file"
                        type="file"
                        accept="image/*,application/pdf,.doc,.docx"
                        onChange={(e) => setComunicadoFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Puedes subir fotos de avances de obra, comprobantes, o convocatorias en formato PDF o formato de imagen.
                    </p>
                  </div>

                  <Button type="submit" className="gap-2" disabled={submittingComunicado}>
                    {submittingComunicado ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Subiendo y Publicando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Publicar Comunicado
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Subir Documentos Oficiales */}
          <TabsContent value="documento">
            <Card className="shadow-lg border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileUp className="h-5 w-5 text-accent" />
                  Subir Documento Oficial
                </CardTitle>
                <CardDescription>
                  Sube reglamentos, formatos de solicitud, o balances financieros para consulta de los vecinos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {docMsg && (
                  <Alert
                    variant={docMsg.type === "success" ? "default" : "destructive"}
                    className={`mb-6 ${
                      docMsg.type === "success" ? "border-primary/50 text-primary bg-primary/5" : ""
                    }`}
                  >
                    {docMsg.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>{docMsg.type === "success" ? "Documento Guardado" : "Error"}</AlertTitle>
                    <AlertDescription>{docMsg.text}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleUploadDocument} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="doc-title">Nombre del Documento *</Label>
                      <Input
                        id="doc-title"
                        placeholder="Ej: Reglamento Interno de Convivencia 2026"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doc-category">Categoría de Documento</Label>
                      <Select value={docCategory} onValueChange={setDocCategory}>
                        <SelectTrigger id="doc-category">
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Reglamento">Reglamento</SelectItem>
                          <SelectItem value="Acta de Asamblea">Acta de Asamblea</SelectItem>
                          <SelectItem value="Reporte Financiero">Reporte Financiero</SelectItem>
                          <SelectItem value="Formato">Formato / Solicitud</SelectItem>
                          <SelectItem value="General">Otro Documento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-desc">Descripción Breve (Opcional)</Label>
                    <Input
                      id="doc-desc"
                      placeholder="Ej: Documento aprobado en la asamblea general de colonos"
                      value={docDescription}
                      onChange={(e) => setDocDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-file">Seleccionar Archivo (PDF, Word, Excel) *</Label>
                    <Input
                      id="doc-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                      onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                      required
                      className="cursor-pointer"
                    />
                  </div>

                  <Button type="submit" className="gap-2" disabled={submittingDoc}>
                    {submittingDoc ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Subiendo Archivo...
                      </>
                    ) : (
                      <>
                        <FileUp className="h-4 w-4" />
                        Guardar y Publicar Documento
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Gestionar Publicaciones */}
          <TabsContent value="gestion">
            <Card className="shadow-lg border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-xl">Gestión de Publicaciones</CardTitle>
                  <CardDescription>
                    Administra o elimina comunicados y documentos publicados anteriormente.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadData} disabled={loadingData}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? "animate-spin" : ""}`} />
                  Actualizar Lista
                </Button>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Section 1: Comunicados List */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Comunicados Publicados ({comunicadosList.length})
                  </h3>

                  {comunicadosList.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-4">
                      No hay comunicados publicados aún.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {comunicadosList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-4 p-4 rounded-xl bg-muted/40 border hover:border-primary/40 transition-colors"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary">{item.category}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString("es-MX", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground text-base mt-1">{item.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>

                            {item.file_url && (
                              <div className="pt-2">
                                <a
                                  href={item.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Ver adjunto ({item.file_name || "Archivo"})
                                </a>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteComunicado(item.id)}
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Documentos List */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
                    <FileText className="h-5 w-5 text-accent" />
                    Documentos Oficiales ({documentosList.length})
                  </h3>

                  {documentosList.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-4">
                      No hay documentos oficiales registrados.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {documentosList.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border hover:border-accent/40 transition-colors"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{doc.category}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString("es-MX", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground text-base mt-1">{doc.title}</h4>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
                            )}
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline pt-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Abrir o descargar archivo ({doc.file_name || "PDF"})
                            </a>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteDocument(doc.id)}
                            disabled={deletingId === doc.id}
                          >
                            {deletingId === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
