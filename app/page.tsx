"use client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DotBackground } from "@/components/ui/dot-background";
import RotatingText from "@/components/ui/rotating-text";
import Link from "next/link";
import { motion as m } from "motion/react";

export default function Home() {
	const MotionCard = m.create(Card);
	return (
		<DotBackground>
			<div className='flex flex-col items-center justify-center max-w-4xl w-full space-y-8'>
				{/* Main Header */}
				<div className='text-center space-y-4'>
					<h1 className='flex gap-6 items-center justify-center text-4xl md:text-6xl font-bold mb-4'>
						<span>Sukoon</span>
						<RotatingText
							texts={["3", "&", "4"]}
							mainClassName='px-2 sm:px-2 md:px-3 bg-white text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-[16px]'
							staggerFrom={"last"}
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "-120%" }}
							staggerDuration={0.025}
							splitLevelClassName='overflow-hidden pb-0.5 sm:pb-1 md:pb-1'
							transition={{
								type: "spring",
								damping: 30,
								stiffness: 400,
							}}
							rotationInterval={1500}
						/>
						<span>Society</span>
					</h1>

					<p className='text-xl max-w-2xl mx-auto'>
						Welcome to our Society portal. Connect, collaborate, and
						build together.
					</p>
				</div>

				{/* Authentication Card */}
				<MotionCard
					layoutId='authCard'
					className='w-full max-w-md relative mt-24 backdrop-blur-2xl bg-background/75 border-2'
				>
					<CardHeader className='text-center'>
						<CardTitle className='text-2xl'>
							<m.span layoutId='authSubmit'>Get Started</m.span>
						</CardTitle>
						<CardDescription>
							Join our community or sign in to your account
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<Link href='/login' className='block'>
							<Button className='w-full' size='lg'>
								Sign In
							</Button>
						</Link>
						<Link href='/signup' className='block'>
							<Button
								variant='outline'
								className='w-full'
								size='lg'
							>
								Sign Up
							</Button>
						</Link>
					</CardContent>
				</MotionCard>
			</div>
		</DotBackground>
	);
}
