'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { uploadKycDocumentSchema, UploadKycDocumentData } from '@/lib/zod'
import { uploadKycDocument, uploadFileToSupabase } from './actions'
import { toast } from 'sonner'
import { Plus, Upload, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  houseNumber: string
}

interface UploadKycFormProps {
  users: User[]
}

export function UploadKycForm({ users }: UploadKycFormProps) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<UploadKycDocumentData>({
    resolver: zodResolver(uploadKycDocumentSchema),
    defaultValues: {
      userId: '',
    },
  })

  const selectedFile = form.watch('file')

  const handleSubmit = async (data: UploadKycDocumentData) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      // Upload file to Supabase
      const uploadResult = await uploadFileToSupabase(data.file, data.userId)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload file')
      }

      // Complete progress
      setUploadProgress(100)

      // Save to database
      const result = await uploadKycDocument({
        userId: data.userId,
        fileName: data.file.name,
        downloadUrl: uploadResult.url!,
        fileSize: data.file.size.toString(),
        contentType: data.file.type,
      })

      if (result.success) {
        toast.success('KYC document uploaded successfully!')
        form.reset()
        setOpen(false)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload document'
      )
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
        form.setValue('file', file)
      } else {
        toast.error('Please select a PDF file under 10MB')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      form.setValue('file', file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload KYC Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload KYC Document</DialogTitle>
          <DialogDescription>
            Upload a KYC document for a renter. Only PDF files under 10MB are
            allowed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Renter</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a renter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - House {user.houseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>KYC Document</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                        dragActive
                          ? 'border-primary bg-primary/10'
                          : 'border-muted-foreground/25',
                        selectedFile && 'border-primary bg-primary/5'
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="text-primary h-8 w-8" />
                          <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-muted-foreground text-sm">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="text-muted-foreground mx-auto h-8 w-8" />
                          <div>
                            <p className="font-medium">
                              Drop your PDF here, or click to browse
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Maximum file size: 10MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || !selectedFile}>
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
