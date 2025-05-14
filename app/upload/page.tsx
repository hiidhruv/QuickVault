import { UploadForm } from "@/components/upload-form"

export const metadata = {
  title: "Upload - IHP",
  description: "Upload your images to IHP",
}

export default function UploadPage() {
  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Image</h1>
        <UploadForm />
      </div>
    </div>
  )
}
