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
import { signUp } from "../actions";
import { signUpSchema } from "@/lib/schemas";
import { motion as m } from "motion/react";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { DotBackground } from "@/components/ui/dot-background";

export default function SignupPage() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [actionResult, setActionResult] = useState<{
		success: boolean;
		message: string;
		errors?: Record<string, string[]>;
	} | null>(null);

	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			fullName: "",
			houseNumber: "",
			email: "",
			phone: "",
			password: "",
			confirmPassword: "",
		},
	});

	function onSubmit(values: z.infer<typeof signUpSchema>) {
		startTransition(async () => {
			try {
				const result = await signUp(values);
				setActionResult(result);

				if (result.success) {
					// Redirect on successful sign up
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
							Create Account
						</CardTitle>
						<CardDescription className='mt-2'>
							Sign up for a new account
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
								{/* Personal Information Section */}
								<div className='space-y-4'>
									<h3 className='text-sm font-medium text-muted-foreground border-b pb-2'>
										Personal Information
									</h3>

									<FormField
										control={form.control}
										name='fullName'
										render={({ field }) => (
											<FormItem>
												<FormLabel>Full Name</FormLabel>
												<FormControl>
													<Input
														placeholder='Enter your full name'
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className='grid grid-cols-2 gap-4'>
										<FormField
											control={form.control}
											name='houseNumber'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														House Number
													</FormLabel>
													<FormControl>
														<Input
															placeholder='A-10'
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='phone'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Phone</FormLabel>
													<FormControl>
														<Input
															type='tel'
															maxLength={10}
															placeholder='10-digit number'
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{/* Account Information Section */}
								<div className='space-y-4'>
									<h3 className='text-sm font-medium text-muted-foreground border-b pb-2'>
										Account Information
									</h3>

									<FormField
										control={form.control}
										name='email'
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Email Address
												</FormLabel>
												<FormControl>
													<Input
														type='email'
														placeholder='Enter your email address'
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className='grid grid-cols-1 gap-4'>
										<FormField
											control={form.control}
											name='password'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Password
													</FormLabel>
													<FormControl>
														<div className='relative'>
															<Input
																type={
																	showPassword
																		? "text"
																		: "password"
																}
																placeholder='Create a strong password'
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

										<FormField
											control={form.control}
											name='confirmPassword'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Confirm Password
													</FormLabel>
													<FormControl>
														<div className='relative'>
															<Input
																type={
																	showConfirmPassword
																		? "text"
																		: "password"
																}
																placeholder='Confirm your password'
																{...field}
																className='pr-12'
															/>
															<Button
																className='absolute inset-y-0 right-0 pr-3 flex items-center'
																variant='outline'
																onClick={() =>
																	setShowConfirmPassword(
																		!showConfirmPassword
																	)
																}
															>
																{showConfirmPassword ? (
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
									</div>
								</div>

								<Button
									type='submit'
									className='w-full mt-8'
									disabled={isPending}
								>
									{isPending ? (
										<>
											<LoaderCircle className='mr-2 h-4 w-4 animate-spin' />
											<m.span
												layoutId='authSubmit'
												layout='position'
											>
												Create Account
											</m.span>
										</>
									) : (
										<m.span
											layoutId='authSubmit'
											layout='position'
										>
											Create Account
										</m.span>
									)}
								</Button>
							</form>
						</Form>
						<div className='text-center mt-6'>
							<p className='text-sm'>
								Already have an account?{" "}
								<Link
									href='/login'
									className='font-medium text-primary'
								>
									Sign in
								</Link>
							</p>
						</div>
					</CardContent>
				</MotionCard>
			</DotBackground>
		</div>
	);
}
