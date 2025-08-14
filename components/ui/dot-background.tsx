'use client'
import { cn } from '@/lib/utils'
import React from 'react'
import { motion as m, useMotionTemplate, useMotionValue } from 'motion/react'

export function DotBackground({ children }: { children: React.ReactNode }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    if (!currentTarget) return
    const { left, top } = currentTarget.getBoundingClientRect()

    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <m.div
      className={cn(
        'group relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-black'
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Base dot pattern */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          '[background-size:20px_20px]',
          '[background-image:radial-gradient(#d9d9d9_1px,transparent_1px)]',
          'dark:[background-image:radial-gradient(#1f1f1f_1px,transparent_1px)]'
        )}
      />
      {/* Interactive highlight layer */}
      <m.div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100',
          '[background-size:20px_20px]',
          '[background-image:radial-gradient(#000000_1px,transparent_1px)]',
          'dark:[background-image:radial-gradient(#c4c4c4_1px,transparent_1px)]'
        )}
        style={{
          WebkitMaskImage: useMotionTemplate`
						radial-gradient(
							400px circle at ${mouseX}px ${mouseY}px,
							black 0%,
							transparent 100%
						)
					`,
          maskImage: useMotionTemplate`
						radial-gradient(
							400px circle at ${mouseX}px ${mouseY}px,
							black 0%,
							transparent 100%
						)
					`,
        }}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      <div className="relative z-20">{children}</div>
    </m.div>
  )
}
