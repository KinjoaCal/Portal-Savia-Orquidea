"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  Shield, LogOut, Upload, FileText, Megaphone, Trash2, 
  CheckCircle2, AlertCircle, Loader2, Home, FileUp, Image as ImageIcon,
  ExternalLink, Plus, RefreshCw, Wrench, Clock, Images, Edit, X, DollarSign, Save, UserPlus
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

interface MonthlyItem {
  mes: string
  monto: number
}

interface FinanzasState {
  total_recaudado: number
  cuota_mensual: number
  vecinos_al_corriente: number
  total_vecinos: number
  tendencia: string
  ultima_actualizacion: string
  monthly_data: MonthlyItem[]
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

  // Form state for Finanzas
  const [finanzasData, setFinanzasData] = useState<FinanzasState>({
    total_recaudado: 1643830,
    cuota_mensual: 850,
    vecinos_al_corriente: 58,
    total_vecinos: 64,
    tendencia: "+8%",
    ultima_actualizacion: "Marzo 2026",
    monthly_data: [
      { mes: "Octubre", monto: 85200 },
      { mes: "Noviembre", monto: 85200 },
      { mes: "Diciembre", monto: 85200 },
      { mes: "Enero", monto: 85200 },
      { mes: "Febrero", monto: 85200 },
      { mes: "Marzo", monto: 85200 },
    ],
  })
  const [savingFinanzas, setSavingFinanzas] = useState(false)
  const [finanzasMsg, setFinanzasMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Data lists
  const [comunicadosList, setComunicadosList] = useState<ComunicadoItem[]>([])
  const [documentosList, setDocumentosList] = useState<DocumentoItem[]>([])
  const [proyectosList, setProyectosList] = useState<ProyectoItem[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return

        if (!session) {
          router.replace("/login")
          return
        }

        setUserEmail(session.user?.email || "Mesa Directiva")
        setLoadingAuth(false)
        loadData()
      } catch (err) {
        console.error("Error al autenticar:", err)
        if (isMounted) {
          router.replace("/login")
          setLoadingAuth(false)
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      if (session) {
        setUserEmail(session.user?.email || "Mesa Directiva")
        setLoadingAuth(false)
        loadData()
      } else {
        router.replace("/login")
      }
    })

    checkSession()

    // Safety timeout fallback (3 seconds) to guarantee the UI never gets stuck
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoadingAuth(false)
      }
    }, 3000)

    return () => {
      isMounted = false
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [router])

  const loadData = async () => {
    setLoadingData(true)

    try {
      const [comsRes, docsRes, projsRes, finRes] = await Promise.allSettled([
        supabase.from("comunicados").select("*").order("created_at", { ascending: false }),
        supabase.from("documentos").select("*").order("created_at", { ascending: false }),
        supabase.from("proyectos").select("*").order("created_at", { ascending: false }),
        supabase.from("finanzas").select("*").eq("id", "general").maybeSingle(),
      ])

      if (comsRes.status === "fulfilled" && comsRes.value.data) {
        setComunicadosList(Array.isArray(comsRes.value.data) ? comsRes.value.data : [])
      }

      if (docsRes.status === "fulfilled" && docsRes.value.data) {
        setDocumentosList(Array.isArray(docsRes.value.data) ? docsRes.value.data : [])
      }

      if (projsRes.status === "fulfilled" && projsRes.value.data) {
        const rawList = Array.isArray(projsRes.value.data) ? projsRes.value.data : []
        const sanitized = rawList.map((p: any) => {
          let imgs = p.images
          if (typeof imgs === "string") {
            try { imgs = JSON.parse(imgs) } catch { imgs = [] }
          }
          if (!Array.isArray(imgs)) imgs = []
          return { ...p, images: imgs }
        })
        setProyectosList(sanitized)
      }

      if (finRes.status === "fulfilled" && finRes.value.data) {
        const fin = finRes.value.data
        let monthly = fin.monthly_data
        if (typeof monthly === "string") {
          try { monthly = JSON.parse(monthly) } catch { monthly = [] }
        }
        if (!Array.isArray(monthly)) monthly = []

        const defaultMonthly = [
          { mes: "Octubre", monto: 85200 },
          { mes: "Noviembre", monto: 85200 },
          { mes: "Diciembre", monto: 85200 },
          { mes: "Enero", monto: 85200 },
          { mes: "Febrero", monto: 85200 },
          { mes: "Marzo", monto: 85200 },
        ]

        setFinanzasData({
          total_recaudado: Number(fin.total_recaudado ?? 1643830),
          cuota_mensual: Number(fin.cuota_mensual ?? 850),
          vecinos_al_corriente: Number(fin.vecinos_al_corriente ?? 58),
          total_vecinos: Number(fin.total_vecinos ?? 64),
          tendencia: fin.tendencia || "+8%",
          ultima_actualizacion: fin.ultima_actualizacion || "Marzo 2026",
          monthly_data: monthly.length > 0 ? monthly : defaultMonthly,
        })
      }
    } catch (err) {
      console.warn("Error cargando datos:", err)
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

  // Update existing project details
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

  // Save Finance Settings
  const handleSaveFinanzas = async (e: React.FormEvent) => {
    e.preventDefault()
    setFinanzasMsg(null)
    setSavingFinanzas(true)

    try {
      const { error } = await supabase
        .from("finanzas")
        .upsert({
          id: "general",
          total_recaudado: finanzasData.total_recaudado,
          cuota_mensual: finanzasData.cuota_mensual,
          vecinos_al_corriente: finanzasData.vecinos_al_corriente,
          total_vecinos: finanzasData.total_vecinos,
          tendencia: finanzasData.tendencia,
          ultima_actualizacion: finanzasData.ultima_actualizacion,
          monthly_data: finanzasData.monthly_data,
          updated_at: new Date().toISOString(),
        })

      if (error) throw new Error(error.message)

      setFinanzasMsg({ type: "success", text: "¡Información financiera y desglose mensual guardados correctamente!" })
      await loadData()
    } catch (err: any) {
      setFinanzasMsg({ type: "error", text: err.message || "Error al guardar información financiera." })
    } finally {
      setSavingFinanzas(false)
    }
  }

  // Monthly array helpers
  const handleMonthlyChange = (index: number, field: "mes" | "monto", value: string | number) => {
    const updated = [...finanzasData.monthly_data]
    updated[index] = { ...updated[index], [field]: value }
    setFinanzasData({ ...finanzasData, monthly_data: updated })
  }

  const handleAddMonthlyItem = () => {
    setFinanzasData({
      ...finanzasData,
      monthly_data: [...finanzasData.monthly_data, { mes: "Nuevo Mes", monto: 85200 }],
    })
  }

  const handleRemoveMonthlyItem = (index: number) => {
    const updated = finanzasData.monthly_data.filter((_, i) => i !== index)
    setFinanzasData({ ...finanzasData, monthly_data: updated })
  }

  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopyRegisterLink = () => {
    if (typeof window !== "undefined") {
      const registerUrl = `${window.location.origin}/registro-mesa-directiva`
      navigator.clipboard.writeText(registerUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 3000)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-0 h-auto sm:h-16 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base text-foreground leading-none truncate">Panel de Administración</h1>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">
                Savia Orquídea • {userEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyRegisterLink}
              className="gap-1.5 text-xs font-medium h-8 sm:h-9 px-2.5 sm:px-3"
              title="Copiar enlace secreto de registro para otros miembros de la Mesa Directiva"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs">¡Link Copiado!</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copiar Link de Registro</span>
                  <span className="sm:hidden">Link Admin</span>
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex h-8 sm:h-9">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Ver Sitio Público
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut} className="h-8 sm:h-9 px-2.5 sm:px-3">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">
        <Tabs defaultValue="comunicado" className="space-y-6">
          <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-5 max-w-4xl bg-muted p-1 rounded-xl gap-1">
              <TabsTrigger value="comunicado" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2 shrink-0">
                <Megaphone className="h-4 w-4" />
                <span>Comunicados</span>
              </TabsTrigger>
              <TabsTrigger value="documento" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2 shrink-0">
                <FileUp className="h-4 w-4" />
                <span>Documentos</span>
              </TabsTrigger>
              <TabsTrigger value="finanzas" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2 shrink-0">
                <DollarSign className="h-4 w-4" />
                <span>Finanzas</span>
              </TabsTrigger>
              <TabsTrigger value="obras" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2 shrink-0">
                <Wrench className="h-4 w-4" />
                <span>Obras</span>
              </TabsTrigger>
              <TabsTrigger value="gestion" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2 shrink-0">
                <FileText className="h-4 w-4" />
                <span>Publicaciones</span>
              </TabsTrigger>
            </TabsList>
          </div>

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

          {/* TAB 3: Gestión Financiera */}
          <TabsContent value="finanzas">
            <Card className="shadow-lg border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Gestión del Estado de Cuotas y Desglose Mensual
                </CardTitle>
                <CardDescription>
                  Modifica los valores del resumen de finanzas y actualiza los meses y montos recabados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {finanzasMsg && (
                  <Alert
                    variant={finanzasMsg.type === "success" ? "default" : "destructive"}
                    className="mb-6"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>{finanzasMsg.type === "success" ? "Finanzas Actualizadas" : "Error"}</AlertTitle>
                    <AlertDescription>{finanzasMsg.text}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSaveFinanzas} className="space-y-8">
                  {/* Sección 1: Métricas Generales */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-foreground border-b pb-2">
                      1. Valores del Estado de Cuotas
                    </h3>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="fin-recaudado">Total Recaudado ($)</Label>
                        <Input
                          id="fin-recaudado"
                          type="number"
                          value={finanzasData.total_recaudado}
                          onChange={(e) => setFinanzasData({ ...finanzasData, total_recaudado: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fin-cuota">Cuota Mensual ($)</Label>
                        <Input
                          id="fin-cuota"
                          type="number"
                          value={finanzasData.cuota_mensual}
                          onChange={(e) => setFinanzasData({ ...finanzasData, cuota_mensual: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fin-corriente">Vecinos al Corriente</Label>
                        <Input
                          id="fin-corriente"
                          type="number"
                          value={finanzasData.vecinos_al_corriente}
                          onChange={(e) => setFinanzasData({ ...finanzasData, vecinos_al_corriente: parseInt(e.target.value, 10) || 0 })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fin-total-vecinos">Total de Vecinos / Viviendas</Label>
                        <Input
                          id="fin-total-vecinos"
                          type="number"
                          value={finanzasData.total_vecinos}
                          onChange={(e) => setFinanzasData({ ...finanzasData, total_vecinos: parseInt(e.target.value, 10) || 0 })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fin-tendencia">Tendencia (ej: +8%)</Label>
                        <Input
                          id="fin-tendencia"
                          value={finanzasData.tendencia}
                          onChange={(e) => setFinanzasData({ ...finanzasData, tendencia: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fin-update">Texto de Última Actualización</Label>
                        <Input
                          id="fin-update"
                          placeholder="Marzo 2026"
                          value={finanzasData.ultima_actualizacion}
                          onChange={(e) => setFinanzasData({ ...finanzasData, ultima_actualizacion: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección 2: Desglose Mensual */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-semibold text-lg text-foreground">
                        2. Desglose Mensual (Meses y Montos Recaudados)
                      </h3>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddMonthlyItem} className="gap-1.5 text-xs">
                        <Plus className="h-3.5 w-3.5" /> Agregar Mes
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {(Array.isArray(finanzasData.monthly_data) ? finanzasData.monthly_data : []).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3 p-3 bg-muted/40 rounded-xl border">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Nombre del Mes</Label>
                              <Input
                                value={item.mes}
                                onChange={(e) => handleMonthlyChange(index, "mes", e.target.value)}
                                placeholder="Ej: Octubre"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Monto Recaudado ($)</Label>
                              <Input
                                type="number"
                                value={item.monto}
                                onChange={(e) => handleMonthlyChange(index, "monto", parseFloat(e.target.value) || 0)}
                                placeholder="85200"
                                required
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 shrink-0 mt-4"
                            onClick={() => handleRemoveMonthlyItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {finanzasData.monthly_data.length === 0 && (
                        <p className="text-xs text-muted-foreground italic py-2">
                          No hay meses configurados. Haz clic en &quot;Agregar Mes&quot; para registrar uno.
                        </p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="gap-2" disabled={savingFinanzas}>
                    {savingFinanzas ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando cambios...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Información Financiera
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Obras y Galerías */}
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

                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
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
                              <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                                <DialogHeader>
                                  <DialogTitle className="text-lg sm:text-xl">Editar Datos de la Obra</DialogTitle>
                                  <DialogDescription className="text-xs sm:text-sm">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                              <div key={idx} className="relative group w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden border">
                                <Image src={imgUrl} alt="Foto de la obra" fill className="object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhotoFromProject(proj.id, imgUrl, proj.images)}
                                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full sm:opacity-0 group-hover:opacity-100 transition-opacity"
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
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-muted/30 p-3 rounded-xl">
                            <Input
                              type="file"
                              multiple
                              accept="image/*"
                              className="text-xs cursor-pointer bg-background flex-1"
                              onChange={(e) => setAdditionalPhotosFiles(e.target.files)}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddPhotosToProject(proj.id, proj.images || [])}
                              disabled={uploadingMorePhotosId === proj.id}
                              className="gap-1 text-xs shrink-0 w-full sm:w-auto"
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

          {/* TAB 5: Gestionar Publicaciones Existentes */}
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

                  {(!comunicadosList || comunicadosList.length === 0) ? (
                    <p className="text-sm text-muted-foreground italic py-4">
                      No hay comunicados publicados aún.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(Array.isArray(comunicadosList) ? comunicadosList : []).map((item) => {
                        let formattedDate = ""
                        try {
                          if (item.created_at) {
                            formattedDate = new Date(item.created_at).toLocaleDateString("es-MX", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          }
                        } catch {
                          formattedDate = ""
                        }

                        return (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-4 p-4 rounded-xl bg-muted/40 border hover:border-primary/40 transition-colors"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary">{item.category}</Badge>
                                {formattedDate && (
                                  <span className="text-xs text-muted-foreground">
                                    {formattedDate}
                                  </span>
                                )}
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
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Section 2: Documentos List */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
                    <FileText className="h-5 w-5 text-accent" />
                    Documentos Oficiales ({documentosList?.length || 0})
                  </h3>

                  {(!documentosList || documentosList.length === 0) ? (
                    <p className="text-sm text-muted-foreground italic py-4">
                      No hay documentos oficiales registrados.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(Array.isArray(documentosList) ? documentosList : []).map((doc) => (
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
