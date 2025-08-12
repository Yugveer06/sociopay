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
import { forgotPassword } from "../actions";
import { forgotPasswordSchema } from "@/lib/schemas";
import { motion as m } from "motion/react";
import Link from "next/link";
import { LoaderCircle, ArrowLeft } from "lucide-react";
import { DotBackground } from "@/components/ui/dot-background";

export default function ForgotPasswordPage() {
	const router = useRouter();

	const [isPending, startTransition] = useTransition();
	const [actionResult, setActionResult] = useState<{
		success: boolean;
		message: string;
		errors?: Record<string, string[]>;
	} | null>(null);

	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
		startTransition(async () => {
			try {
				const result = await forgotPassword(values);
				setActionResult(result);

				if (result.success) {
					// Redirect to reset password page with email
					router.push(
						`/reset-password?email=${encodeURIComponent(
							values.email
						)}`
					);
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
							Forgot Password
						</CardTitle>
						<CardDescription className='mt-2'>
							Enter your email to receive a reset code
						</CardDescription>
					</CardHeader>
					<CardContent>
						{actionResult && (
							<div
								className={`mb-4 p-3 text-sm rounded-md border ${
									actionResult.success
										? "text-green-600 bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800"
										: "text-destructive bg-destructive/10 border-destructive/20"
								}`}
							>
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
												Sending Reset Code
											</m.span>
										</>
									) : (
										<m.span
											layoutId='authSubmit'
											layout='position'
										>
											Send Reset Code
										</m.span>
									)}
								</Button>
							</form>
						</Form>
						<div className='text-center mt-6'>
							<Link
								href='/login'
								className='inline-flex items-center text-sm font-medium text-primary'
							>
								<ArrowLeft className='mr-2 h-4 w-4' />
								Back to Sign In
							</Link>
						</div>
					</CardContent>
				</MotionCard>
			</DotBackground>
		</div>
	);
}
