import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ExpensesLoading() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col gap-6">
          {/* Header skeleton */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-80" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>

          {/* Expense Overview Cards skeleton */}
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-2 h-8 w-24" />
                  <Skeleton className="h-3 w-36" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Expenses Table skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search input skeleton */}
                <div className="flex items-center py-4">
                  <Skeleton className="h-10 w-64" />
                </div>

                {/* Table skeleton */}
                <div className="rounded-md border">
                  {/* Table header */}
                  <div className="bg-muted/50 flex border-b p-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex-1">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>

                  {/* Table rows */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex border-b p-4 last:border-0">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <div key={j} className="flex-1">
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Pagination skeleton */}
                <div className="flex items-center justify-between px-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <div className="flex w-24 items-center justify-center">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
