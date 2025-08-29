'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { UploadKycDocumentData, uploadKycDocumentSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, FileText, Plus, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { uploadFileToSupabase, uploadKycDocument } from './actions'

interface User {
  id: string
  name: string
  houseNumber: string
  houseOwnership: string
}

interface UploadKycFormProps {
  users: User[]
  canUploadForOthers: boolean
  currentUserId: string
}

export function UploadKycForm({
  users,
  canUploadForOthers,
  currentUserId,
}: UploadKycFormProps) {
  const [open, setOpen] = useState(false)
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<UploadKycDocumentData>({
    resolver: zodResolver(uploadKycDocumentSchema),
    defaultValues: {
      userId: canUploadForOthers ? '' : currentUserId, // Auto-select current user for non-admin renters
    },
  })

  const selectedFile = form.watch('file')

  const handleSubmit = async (data: UploadKycDocumentData) => {
    const selectedUser = users.find(user => user.id === data.userId)
    if (selectedUser && selectedUser.houseOwnership !== 'renter') {
      toast.error('User is not a renter')
      return
    }

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
            {canUploadForOthers
              ? 'Upload a KYC document for a renter. Only PDF files under 10MB are allowed.'
              : 'Upload your KYC document. Only PDF files under 10MB are allowed.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {canUploadForOthers && (
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Renter</FormLabel>
                    <Popover
                      open={userPopoverOpen}
                      onOpenChange={setUserPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              <div className="flex w-full min-w-0 items-center gap-2">
                                <span className="text-muted-foreground shrink-0">
                                  (
                                  {
                                    users.find(user => user.id === field.value)
                                      ?.houseNumber
                                  }
                                  )
                                </span>
                                <span className="truncate">
                                  {
                                    users.find(user => user.id === field.value)
                                      ?.name
                                  }
                                </span>
                              </div>
                            ) : (
                              'Select a renter'
                            )}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search renter..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No user found.</CommandEmpty>
                            <CommandGroup>
                              {users
                                .filter(
                                  user => user.houseOwnership === 'renter'
                                )
                                .map(user => (
                                  <CommandItem
                                    value={`${user.houseNumber} ${user.name}`}
                                    key={user.id}
                                    onSelect={() => {
                                      form.setValue('userId', user.id)
                                      setUserPopoverOpen(false)
                                    }}
                                  >
                                    <span className="text-muted-foreground shrink-0">
                                      ({user.houseNumber})
                                    </span>
                                    <span className="truncate">
                                      {user.name}
                                    </span>
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        user.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!canUploadForOthers && (
              <div className="bg-muted/30 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm">
                    Uploading for:{' '}
                    <strong>
                      {users.find(u => u.id === currentUserId)?.name}
                    </strong>
                    ({users.find(u => u.id === currentUserId)?.houseNumber})
                  </span>
                </div>
              </div>
            )}

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
