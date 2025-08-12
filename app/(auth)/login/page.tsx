"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "../actions";
import { signInSchema } from "@/lib/schemas";
import { motion as m } from "motion/react";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { DotBackground } from "@/components/ui/dot-background";

export default function LoginPage() {
	const router = useRouter();

	const [isPending, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);
	const [actionResult, setActionResult] = useState<{
		success: boolean;
		message: string;
		errors?: Record<string, string[]>;
	} | null>(null);

	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	function onSubmit(values: z.infer<typeof signInSchema>) {
		startTransition(async () => {
			try {
				const result = await signIn(values);
				setActionResult(result);

				if (result.success) {
					// Redirect on successful sign in
					router.push("/dashboard");
					return;
				}

				if (result.errors) {
					// Set form errors from validation
					Object.entries(result.errors).forEach(
						([field, messages]) => {
							form.setError(field as any, {
								type: "manual",
								message: messages[0],
							});
						}
					);
				}
			} catch (error) {
				setActionResult({
					success: false,
					message: "An unexpected error occurred",
				});
			}
		});
	}

	const MotionCard = m.create(Card);

	return (
		<div className='flex min-h-screen items-center justify-center'>
			<DotBackground>
				<MotionCard
					layoutId='authCard'
					className='w-full max-w-md relative backdrop-blur-2xl bg-background/75 border-2'
				>
					<CardHeader className='text-center'>
						<CardTitle className='text-3xl font-bold'>
							Sign In
						</CardTitle>
						<CardDescription className='mt-2'>
							Sign in to your account
						</CardDescription>
					</CardHeader>
					<CardContent>
						{actionResult && !actionResult.success && (
							<div className='mb-4 p-3 text-sm rounded-md text-destructive bg-destructive/10 border-destructive/20 border'>
								{actionResult.message}
							</div>
						)}
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className='space-y-6'
							>
								<FormField
									control={form.control}
									name='email'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type='email'
													placeholder='Enter your email'
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='password'
									render={({ field }) => (
										<FormItem>
											<div className='flex justify-between gap-4'>
												<FormLabel>Password</FormLabel>
												<Link
													href='/forgot-password'
													className='text-sm font-medium text-primary'
												>
													Forgot your password?
												</Link>
											</div>
											<FormControl>
												<div className='relative'>
													<Input
														type={
															showPassword
																? "text"
																: "password"
														}
														placeholder='Enter your password'
														{...field}
														className='pr-12'
													/>
													<Button
														className='absolute inset-y-0 right-0 pr-3 flex items-center'
														variant='outline'
														onClick={() =>
															setShowPassword(
																!showPassword
															)
														}
													>
														{showPassword ? (
															<EyeOff className='h-4 w-4 text-gray-400' />
														) : (
															<Eye className='h-4 w-4 text-gray-400' />
														)}
													</Button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type='submit'
									className='w-full'
									disabled={isPending}
								>
									{isPending ? (
										<>
											<LoaderCircle className='mr-2 h-4 w-4 animate-spin' />
											<m.span
												layoutId='authSubmit'
												layout='position'
											>
												Sign In
											</m.span>
										</>
									) : (
										<m.span
											layoutId='authSubmit'
											layout='position'
										>
											Sign In
										</m.span>
									)}
								</Button>
							</form>
						</Form>
						<div className='text-center mt-6 space-y-4'>
							<p className='text-sm'>
								Don't have an account?{" "}
								<Link
									href='/signup'
									className='font-medium text-primary'
								>
									Sign up
								</Link>
							</p>
						</div>
					</CardContent>
				</MotionCard>
			</DotBackground>
		</div>
	);
}
