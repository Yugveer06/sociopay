import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function DeveloperFooter() {
  return (
    <div className="fixed bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
      <div className="bg-background/80 border-border flex items-center justify-center space-x-2 rounded-full border px-3 py-2 shadow-sm backdrop-blur-sm">
        <span className="text-muted-foreground hidden text-xs sm:inline">
          Developed and Designed by
        </span>
        <span className="text-muted-foreground text-xs sm:hidden">By</span>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                Z
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">Zaid</span>
          </div>
          <span className="text-muted-foreground text-xs">&</span>
          <div className="flex items-center space-x-1">
            <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                Y
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">Yugveer</span>
          </div>
        </div>
      </div>
    </div>
  )
}
