import { UploadForm } from "@/components/upload-form"

export const metadata = {
  title: "Upload - IHP",
  description: "Upload and share your images",
}

export default function UploadPage() {
  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Upload Image</h1>
            <p className="text-muted-foreground text-lg">
              Share your images with the world. Organize them by categories for easy browsing.
            </p>
          </div>
          
          <UploadForm />
        </div>
      </div>
    </div>
  )
}
