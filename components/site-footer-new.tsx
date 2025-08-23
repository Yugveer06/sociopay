'use client'

import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Heart,
  Code,
  Palette,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export function SiteFooter() {
  const developers = [
    {
      name: 'Yugveer',
      role: 'Full Stack Developer',
      avatar: '/avatars/yugveer.jpg',
      fallback: 'YU',
      bio: 'Passionate developer crafting amazing web experiences with a keen eye for design',
      social: {
        github: 'https://github.com/Yugveer06',
        instagram: 'https://www.instagram.com/yugveer28/',
        linkedin: 'https://www.linkedin.com/in/yugveer06/',
        twitter: 'https://x.com/yugveer2806',
      },
    },
    {
      name: 'Zaid',
      role: 'Database Administrator & Data Analyst',
      avatar: '/avatars/zaid.jpg',
      fallback: 'ZA',
      bio: 'Data wizard who turns raw information into meaningful insights',
      social: {
        github: 'https://github.com/Zaid624',
        instagram: 'https://www.instagram.com/z4id.ir/',
        linkedin: 'https://www.linkedin.com/in/zaid-ansari-a1b6952b0/',
        twitter: 'https://x.com/ZaidAnsari2586',
      },
    },
  ]

  // Unified Developer Card that uses CSS for responsive behavior
  const DeveloperCard = ({ dev }: { dev: (typeof developers)[0] }) => (
    <>
      {/* Desktop version - Hidden on mobile */}
      <span className="hidden sm:inline">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="link"
              className="text-foreground hover:text-primary h-auto p-0 text-sm font-medium transition-colors"
            >
              {dev.name}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80" side="top">
            <div className="flex justify-between space-x-4">
              <Avatar>
                <AvatarImage src={dev.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  {dev.fallback}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-semibold">{dev.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  {dev.role}
                </Badge>
                <p className="text-muted-foreground text-sm">{dev.bio}</p>
                <div className="flex items-center space-x-1 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <Link
                      href={dev.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${dev.name}'s GitHub`}
                    >
                      <Github className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <Link
                      href={dev.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${dev.name}'s Instagram`}
                    >
                      <Instagram className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <Link
                      href={dev.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${dev.name}'s LinkedIn`}
                    >
                      <Linkedin className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <Link
                      href={dev.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${dev.name}'s X`}
                    >
                      <Twitter className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </span>

      {/* Mobile version - Hidden on desktop */}
      <span className="inline sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="link"
              className="text-foreground hover:text-primary h-auto p-0 text-sm font-medium transition-colors"
            >
              {dev.name}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-[70vh] max-h-[70vh] min-h-[350px] overflow-hidden p-0 sm:h-[75vh] sm:max-h-[75vh]"
          >
            <div className="flex h-full flex-col">
              <SheetHeader className="flex-shrink-0 border-b px-3 py-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={dev.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-xs font-medium text-white">
                      {dev.fallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-left text-sm leading-tight font-medium">
                      {dev.name}
                    </SheetTitle>
                    <Badge variant="secondary" className="mt-0.5 text-xs">
                      {dev.role}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="space-y-2 px-3 py-3 pb-6">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {dev.bio}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-10 flex-col gap-0.5 px-1 py-1"
                    >
                      <Link
                        href={dev.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-3.5 w-3.5" />
                        <span className="text-xs font-normal">GitHub</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-10 flex-col gap-0.5 px-1 py-1"
                    >
                      <Link
                        href={dev.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="h-3.5 w-3.5" />
                        <span className="text-xs font-normal">Instagram</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-10 flex-col gap-0.5 px-1 py-1"
                    >
                      <Link
                        href={dev.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                        <span className="text-xs font-normal">LinkedIn</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-10 flex-col gap-0.5 px-1 py-1"
                    >
                      <Link
                        href={dev.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-3.5 w-3.5" />
                        <span className="text-xs font-normal">X (Twitter)</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </span>
    </>
  )

  return (
    <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-50 flex min-h-16 shrink-0 items-center gap-2 rounded-b-md border-t backdrop-blur transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between gap-1 px-3 py-2 sm:px-4 lg:gap-2 lg:px-6">
        {/* Left side - Desktop and Tablet */}
        <div className="hidden items-center gap-2 sm:flex lg:gap-3">
          <div className="hidden items-center gap-2 lg:flex">
            <Code className="h-4 w-4 text-blue-500" />
            <Palette className="h-4 w-4 text-purple-500" />
          </div>
          <span className="text-muted-foreground text-xs sm:text-sm">
            <span className="hidden lg:inline">Developed & Designed by </span>
            <span className="lg:hidden">Made by </span>
            {developers.map((dev, idx) => (
              <React.Fragment key={dev.name}>
                <DeveloperCard dev={dev} />
                {idx < developers.length - 1 && ' & '}
              </React.Fragment>
            ))}
            <Heart className="ml-1 inline h-3 w-3 animate-pulse text-red-500 sm:h-4 sm:w-4" />
          </span>
        </div>

        {/* Left side - Mobile only */}
        <div className="flex items-center gap-2 sm:hidden">
          <div className="flex items-center gap-1">
            <Code className="h-3 w-3 text-blue-500" />
            <Palette className="h-3 w-3 text-purple-500" />
          </div>
          <span className="text-muted-foreground text-xs">
            Made with <Heart className="inline h-3 w-3 text-red-500" />
          </span>
        </div>

        {/* Right side - Desktop and Tablet */}
        <div className="hidden items-center gap-2 sm:flex lg:gap-3">
          <Badge variant="outline" className="hidden text-xs lg:inline-flex">
            Made with Next.js
          </Badge>
          <Separator
            orientation="vertical"
            className="hidden data-[orientation=vertical]:h-4 lg:block"
          />
          <div className="hidden items-center gap-1 md:flex">
            {developers.map(dev => (
              <HoverCard key={dev.name}>
                <HoverCardTrigger asChild>
                  <Avatar className="hover:ring-primary/20 h-7 w-7 cursor-pointer ring-2 ring-transparent transition-all lg:h-8 lg:w-8">
                    <AvatarImage src={dev.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-xs text-white">
                      {dev.fallback}
                    </AvatarFallback>
                  </Avatar>
                </HoverCardTrigger>
                <HoverCardContent className="w-80" side="top">
                  <div className="flex justify-between space-x-4">
                    <Avatar>
                      <AvatarImage src={dev.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {dev.fallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-semibold">{dev.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {dev.role}
                      </Badge>
                      <p className="text-muted-foreground text-sm">{dev.bio}</p>
                      <div className="flex items-center space-x-1 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0"
                        >
                          <Link
                            href={dev.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${dev.name}'s GitHub`}
                          >
                            <Github className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0"
                        >
                          <Link
                            href={dev.social.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${dev.name}'s Instagram`}
                          >
                            <Instagram className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0"
                        >
                          <Link
                            href={dev.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${dev.name}'s LinkedIn`}
                          >
                            <Linkedin className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0"
                        >
                          <Link
                            href={dev.social.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${dev.name}'s X`}
                          >
                            <Twitter className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>

        {/* Right side - Mobile only */}
        <div className="flex items-center gap-2 sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="View team"
              >
                <Users className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[75vh] max-h-[75vh] min-h-[400px] overflow-hidden p-0 sm:h-[80vh] sm:max-h-[80vh]"
            >
              <div className="flex h-full flex-col">
                <SheetHeader className="flex-shrink-0 border-b px-3 py-2">
                  <SheetTitle className="flex items-center gap-2 text-sm font-medium">
                    <Code className="h-4 w-4 text-blue-500" />
                    <Palette className="h-4 w-4 text-purple-500" />
                    Meet the Team
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto overscroll-contain">
                  <div className="space-y-3 px-3 py-3 pb-6">
                    {developers.map(dev => (
                      <div key={dev.name} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={dev.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-xs font-medium text-white">
                              {dev.fallback}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm leading-tight font-medium">
                              {dev.name}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="mt-0.5 text-xs"
                            >
                              {dev.role}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {dev.bio}
                        </p>

                        <div className="grid grid-cols-2 gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-10 flex-col gap-0.5 px-1 py-1"
                          >
                            <Link
                              href={dev.social.github}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github className="h-3.5 w-3.5" />
                              <span className="text-xs font-normal">
                                GitHub
                              </span>
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-10 flex-col gap-0.5 px-1 py-1"
                          >
                            <Link
                              href={dev.social.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Instagram className="h-3.5 w-3.5" />
                              <span className="text-xs font-normal">
                                Instagram
                              </span>
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-10 flex-col gap-0.5 px-1 py-1"
                          >
                            <Link
                              href={dev.social.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Linkedin className="h-3.5 w-3.5" />
                              <span className="text-xs font-normal">
                                LinkedIn
                              </span>
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-10 flex-col gap-0.5 px-1 py-1"
                          >
                            <Link
                              href={dev.social.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Twitter className="h-3.5 w-3.5" />
                              <span className="text-xs font-normal">
                                X (Twitter)
                              </span>
                            </Link>
                          </Button>
                        </div>

                        {dev !== developers[developers.length - 1] && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Badge variant="outline" className="text-xs">
            Next.js
          </Badge>
        </div>
      </div>
    </footer>
  )
}
