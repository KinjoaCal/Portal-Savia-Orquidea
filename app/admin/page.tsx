"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  Shield, LogOut, Upload, FileText, Megaphone, Trash2, 
  CheckCircle2, AlertCircle, Loader2, Home, FileUp, Image as ImageIcon,
  ExternalLink, Plus, RefreshCw, Wrench, Clock, Images, Edit, X
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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

interface ProyectoItem {
  id: string
  title: string
  description?: string
  status: string
  progress: number
  budget: number
  start_date?: string
  estimated_end?: string
  images: string[]
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

  // Form states for Proyecto / Obra
  const [projectTitle, setProjectTitle] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [projectStatus, setProjectStatus] = useState("en_proceso")
  const [projectProgress, setProjectProgress] = useState("0")
  const [projectBudget, setProjectBudget] = useState("")
  const [projectStartDate, setProjectStartDate] = useState("Marzo 2026")
  const [projectEstEnd, setProjectEstEnd] = useState("Pendiente")
  const [projectFiles, setProjectFiles] = useState<FileList | null>(null)
  const [submittingProject, setSubmittingProject] = useState(false)
  const [projectMsg, setProjectMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Edit Project state
  const [editingProject, setEditingProject] = useState<ProyectoItem | null>(null)
  const [uploadingMorePhotosId, setUploadingMorePhotosId] = useState<string | null>(null)
  const [additionalPhotosFiles, setAdditionalPhotosFiles] = useState<FileList | null>(null)

  // Data lists
  const [comunicadosList, setComunicadosList] = useState<ComunicadoItem[]>([])
  const [documentosList, setDocumentosList] = useState<DocumentoItem[]>([])
  const [proyectosList, setProyectosList] = useState<ProyectoItem[]>([])
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

      const { data: projs } = await supabase
        .from("proyectos")
        .select("*")
        .order("created_at", { ascending: false })

      if (coms) setComunicadosList(coms)
      if (docs) setDocumentosList(docs)
      if (projs) setProyectosList(projs)
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

  // Handle Proyecto / Obra Submission
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setProjectMsg(null)
    setSubmittingProject(true)

    try {
      const imageUrls: string[] = []

      if (projectFiles && projectFiles.length > 0) {
        for (let i = 0; i < projectFiles.length; i++) {
          const res = await uploadToCloudinary(projectFiles[i])
          imageUrls.push(res.secure_url)
        }
      }

      const { error } = await supabase.from("proyectos").insert([
        {
          title: projectTitle,
          description: projectDesc,
          status: projectStatus,
          progress: parseInt(projectProgress, 10) || 0,
          budget: parseFloat(projectBudget) || 0,
          start_date: projectStartDate,
          estimated_end: projectEstEnd,
          images: imageUrls,
        },
      ])

      if (error) throw new Error(error.message)

      setProjectMsg({ type: "success", text: "¡Obra / Proyecto creado exitosamente con sus imágenes!" })
      setProjectTitle("")
      setProjectDesc("")
      setProjectProgress("0")
      setProjectBudget("")
      setProjectFiles(null)
      await loadData()
    } catch (err: any) {
      setProjectMsg({ type: "error", text: err.message || "Error al registrar la obra." })
    } finally {
      setSubmittingProject(false)
    }
  }

  // Add photos to existing project gallery
  const handleAddPhotosToProject = async (projectId: string, currentImages: string[]) => {
    if (!additionalPhotosFiles || additionalPhotosFiles.length === 0) return
    setUploadingMorePhotosId(projectId)

    try {
      const newUrls: string[] = []
      for (let i = 0; i < additionalPhotosFiles.length; i++) {
        const res = await uploadToCloudinary(additionalPhotosFiles[i])
        newUrls.push(res.secure_url)
      }

      const updatedImages = [...currentImages, ...newUrls]

      const { error } = await supabase
        .from("proyectos")
        .update({ images: updatedImages })
        .eq("id", projectId)

      if (error) throw new Error(error.message)

      setAdditionalPhotosFiles(null)
      await loadData()
    } catch (err: any) {
      alert("Error al agregar fotos: " + err.message)
    } finally {
      setUploadingMorePhotosId(null)
    }
  }

  // Remove photo from gallery
  const handleRemovePhotoFromProject = async (projectId: string, imageToDelete: string, currentImages: string[]) => {
    if (!confirm("¿Deseas eliminar esta foto de la galería?")) return

    try {
      const updatedImages = currentImages.filter((img) => img !== imageToDelete)

      const { error } = await supabase
        .from("proyectos")
        .update({ images: updatedImages })
        .eq("id", projectId)

      if (error) throw new Error(error.message)

      await loadData()
    } catch (err: any) {
      alert("Error al eliminar la foto: " + err.message)
    }
  }

  // Update existing project fields
  const handleUpdateProjectDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    try {
      const { error } = await supabase
        .from("proyectos")
        .update({
          title: editingProject.title,
          description: editingProject.description,
          status: editingProject.status,
          progress: editingProject.progress,
          budget: editingProject.budget,
          start_date: editingProject.start_date,
          estimated_end: editingProject.estimated_end,
        })
        .eq("id", editingProject.id)

      if (error) throw new Error(error.message)

      setEditingProject(null)
      await loadData()
    } catch (err: any) {
      alert("Error al actualizar proyecto: " + err.message)
    }
  }

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta obra? Se eliminarán también sus referencias.")) return
    setDeletingId(id)
    try {
      const { error } = await supabase.from("proyectos").delete().eq("id", id)
      if (error) throw new Error(error.message)
      await loadData()
    } catch (err: any) {
      alert("Error al eliminar: " + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  // Delete Comunicado
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

  // Delete Document
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
          <TabsList className="grid grid-cols-4 max-w-3xl bg-muted p-1 rounded-xl">
            <TabsTrigger value="comunicado" className="gap-2 text-xs sm:text-sm">
              <Megaphone className="h-4 w-4" />
              <span>Comunicados</span>
            </TabsTrigger>
            <TabsTrigger value="documento" className="gap-2 text-xs sm:text-sm">
              <FileUp className="h-4 w-4" />
              <span>Documentos</span>
            </TabsTrigger>
            <TabsTrigger value="obras" className="gap-2 text-xs sm:text-sm">
              <Wrench className="h-4 w-4" />
              <span>Obras y Galerías</span>
            </TabsTrigger>
            <TabsTrigger value="gestion" className="gap-2 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              <span>Publicaciones</span>
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
                    <Input
                      id="com-file"
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={(e) => setComunicadoFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
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

          {/* TAB 3: Obras y Galerías */}
          <TabsContent value="obras" className="space-y-8">
            {/* Formulario para Crear Obra */}
            <Card className="shadow-lg border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wrench className="h-5 w-5 text-primary" />
                  Registrar Nueva Obra / Proyecto
                </CardTitle>
                <CardDescription>
                  Crea una nueva obra con su galería de imágenes para mostrar avances a los residentes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projectMsg && (
                  <Alert
                    variant={projectMsg.type === "success" ? "default" : "destructive"}
                    className="mb-6"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>{projectMsg.type === "success" ? "Obra Registrada" : "Error"}</AlertTitle>
                    <AlertDescription>{projectMsg.text}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleCreateProject} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="proj-title">Nombre de la Obra *</Label>
                      <Input
                        id="proj-title"
                        placeholder="Ej: Remodelación de Área de Juegos Infantiles"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proj-status">Estado de la Obra</Label>
                      <Select value={projectStatus} onValueChange={setProjectStatus}>
                        <SelectTrigger id="proj-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_proceso">En Proceso</SelectItem>
                          <SelectItem value="programado">Programado</SelectItem>
                          <SelectItem value="completado">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proj-desc">Descripción del Proyecto</Label>
                    <Textarea
                      id="proj-desc"
                      placeholder="Detalles sobre lo que contempla esta obra o proyecto..."
                      rows={3}
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="proj-prog">Progreso (%)</Label>
                      <Input
                        id="proj-prog"
                        type="number"
                        min="0"
                        max="100"
                        value={projectProgress}
                        onChange={(e) => setProjectProgress(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proj-bud">Presupuesto ($)</Label>
                      <Input
                        id="proj-bud"
                        type="number"
                        placeholder="85000"
                        value={projectBudget}
                        onChange={(e) => setProjectBudget(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proj-start">Fecha Inicio</Label>
                      <Input
                        id="proj-start"
                        placeholder="Marzo 2026"
                        value={projectStartDate}
                        onChange={(e) => setProjectStartDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proj-end">Fecha Término</Label>
                      <Input
                        id="proj-end"
                        placeholder="Mayo 2026"
                        value={projectEstEnd}
                        onChange={(e) => setProjectEstEnd(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proj-files">Fotos Iniciales de la Galería (Selecciona una o varias imágenes)</Label>
                    <Input
                      id="proj-files"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setProjectFiles(e.target.files)}
                      className="cursor-pointer"
                    />
                  </div>

                  <Button type="submit" className="gap-2" disabled={submittingProject}>
                    {submittingProject ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Subiendo fotos y guardando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Crear Obra con Galería
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista y Edición de Obras Registradas */}
            <Card className="shadow-lg border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Obras Registradas y sus Galerías ({proyectosList.length})</CardTitle>
                  <CardDescription>
                    Administra el porcentaje de avance, agrega fotos adicionales a la galería o elimina fotos antiguas.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadData} disabled={loadingData}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {proyectosList.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-4">
                    No hay obras registradas dinámicamente aún.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {proyectosList.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-5 rounded-2xl bg-card border shadow-sm space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                proj.status === "en_proceso" ? "bg-primary" :
                                proj.status === "completado" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                              }>
                                {proj.status === "en_proceso" ? "En Proceso" : proj.status === "completado" ? "Completado" : "Programado"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">Progreso: {proj.progress}%</span>
                            </div>
                            <h3 className="font-bold text-lg text-foreground">{proj.title}</h3>
                            <p className="text-sm text-muted-foreground">{proj.description}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Edit Obra Modal Trigger */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingProject(proj)}
                                >
                                  <Edit className="h-4 w-4 mr-1" /> Editar Datos
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Datos de la Obra</DialogTitle>
                                  <DialogDescription>
                                    Modifica el porcentaje de avance, presupuesto o estado.
                                  </DialogDescription>
                                </DialogHeader>
                                {editingProject && (
                                  <form onSubmit={handleUpdateProjectDetails} className="space-y-4 pt-2">
                                    <div>
                                      <Label>Título</Label>
                                      <Input
                                        value={editingProject.title}
                                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <Label>Descripción</Label>
                                      <Textarea
                                        value={editingProject.description || ""}
                                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label>Estado</Label>
                                        <Select
                                          value={editingProject.status}
                                          onValueChange={(val) => setEditingProject({ ...editingProject, status: val })}
                                        >
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="en_proceso">En Proceso</SelectItem>
                                            <SelectItem value="programado">Programado</SelectItem>
                                            <SelectItem value="completado">Completado</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label>Progreso (%)</Label>
                                        <Input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={editingProject.progress}
                                          onChange={(e) => setEditingProject({ ...editingProject, progress: parseInt(e.target.value, 10) || 0 })}
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label>Presupuesto ($)</Label>
                                        <Input
                                          type="number"
                                          value={editingProject.budget}
                                          onChange={(e) => setEditingProject({ ...editingProject, budget: parseFloat(e.target.value) || 0 })}
                                        />
                                      </div>
                                      <div>
                                        <Label>Fechas</Label>
                                        <Input
                                          value={editingProject.start_date || ""}
                                          onChange={(e) => setEditingProject({ ...editingProject, start_date: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    <Button type="submit" className="w-full">Guardar Cambios</Button>
                                  </form>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProject(proj.id)}
                              disabled={deletingId === proj.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar Preview */}
                        <div className="space-y-1">
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Gallery Section */}
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold flex items-center gap-1.5">
                              <Images className="h-4 w-4 text-primary" />
                              Galería de Fotos ({proj.images?.length || 0})
                            </h4>
                          </div>

                          {/* Thumbnails grid */}
                          <div className="flex flex-wrap gap-3 mb-4">
                            {proj.images?.map((imgUrl, idx) => (
                              <div key={idx} className="relative group w-24 h-20 rounded-lg overflow-hidden border">
                                <Image src={imgUrl} alt="Foto de la obra" fill className="object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhotoFromProject(proj.id, imgUrl, proj.images)}
                                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Eliminar foto de la galería"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}

                            {(!proj.images || proj.images.length === 0) && (
                              <p className="text-xs text-muted-foreground italic">No hay fotos en esta galería.</p>
                            )}
                          </div>

                          {/* Add photos form */}
                          <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl">
                            <Input
                              type="file"
                              multiple
                              accept="image/*"
                              className="text-xs cursor-pointer bg-background"
                              onChange={(e) => setAdditionalPhotosFiles(e.target.files)}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddPhotosToProject(proj.id, proj.images || [])}
                              disabled={uploadingMorePhotosId === proj.id}
                              className="gap-1 text-xs shrink-0"
                            >
                              {uploadingMorePhotosId === proj.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Plus className="h-3.5 w-3.5" />
                              )}
                              Agregar Fotos
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Gestionar Publicaciones Existentes */}
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
