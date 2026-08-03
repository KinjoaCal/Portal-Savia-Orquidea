export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  format: string
  resource_type: string
  original_filename: string
}

export async function uploadToCloudinary(
  file: File,
  customResourceType?: "image" | "raw" | "auto"
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "savia_preset"

  if (!cloudName) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurada en las variables de entorno.")
  }

  // Automatically select resource_type:
  // Images (png, jpg, webp, gif, svg) -> "image"
  // PDFs, Documents (pdf, doc, docx, xls, zip) -> "raw"
  let resourceType = customResourceType
  if (!resourceType) {
    const isImage = file.type.startsWith("image/")
    resourceType = isImage ? "image" : "raw"
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData?.error?.message || `Error al subir el archivo a Cloudinary (${response.status})`)
  }

  const data: CloudinaryUploadResult = await response.json()
  return data
}
