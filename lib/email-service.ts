import { Resend } from 'resend'
import nodemailer from 'nodemailer'

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendOTPEmailParams {
  to: string
  otp: string
  type: 'sign-in' | 'email-verification' | 'forget-password'
}

// Create Ethereal test account for development
async function createEtherealTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount()
    return {
      user: testAccount.user,
      pass: testAccount.pass,
      smtp: testAccount.smtp,
    }
  } catch (error) {
    console.error('Failed to create Ethereal test account:', error)
    throw error
  }
}

// Get email content based on type
function getEmailContent(type: string, otp: string) {
  switch (type) {
    case 'forget-password':
      return {
        subject: 'Password Reset Code - SocioPay',
        html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #333; text-align: center;">Password Reset Code</h2>
						<p style="color: #666; font-size: 16px;">
							We received a request to reset your password for your SocioPay account.
						</p>
						<div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
							<p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
							<h1 style="margin: 10px 0; font-size: 32px; color: #333; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
						</div>
						<p style="color: #666; font-size: 14px;">
							This code will expire in 5 minutes. If you didn't request this, please ignore this email.
						</p>
						<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
						<p style="color: #999; font-size: 12px; text-align: center;">
							SocioPay - Your Neighborhood Payment Solution
						</p>
					</div>
				`,
      }
    case 'email-verification':
      return {
        subject: 'Verify Your Email - SocioPay',
        html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #333; text-align: center;">Verify Your Email</h2>
						<p style="color: #666; font-size: 16px;">
							Welcome to SocioPay! Please verify your email address to complete your registration.
						</p>
						<div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
							<p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
							<h1 style="margin: 10px 0; font-size: 32px; color: #333; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
						</div>
						<p style="color: #666; font-size: 14px;">
							This code will expire in 5 minutes.
						</p>
						<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
						<p style="color: #999; font-size: 12px; text-align: center;">
							SocioPay - Your Neighborhood Payment Solution
						</p>
					</div>
				`,
      }
    case 'sign-in':
      return {
        subject: 'Sign In Code - SocioPay',
        html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #333; text-align: center;">Sign In Code</h2>
						<p style="color: #666; font-size: 16px;">
							Use this code to sign in to your SocioPay account.
						</p>
						<div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
							<p style="margin: 0; font-size: 14px; color: #666;">Your sign-in code is:</p>
							<h1 style="margin: 10px 0; font-size: 32px; color: #333; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
						</div>
						<p style="color: #666; font-size: 14px;">
							This code will expire in 5 minutes. If you didn't request this, please contact support.
						</p>
						<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
						<p style="color: #999; font-size: 12px; text-align: center;">
							SocioPay - Your Neighborhood Payment Solution
						</p>
					</div>
				`,
      }
    default:
      return {
        subject: 'Verification Code - SocioPay',
        html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #333; text-align: center;">Verification Code</h2>
						<p style="color: #666; font-size: 16px;">
							Your verification code for SocioPay.
						</p>
						<div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
							<p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
							<h1 style="margin: 10px 0; font-size: 32px; color: #333; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
						</div>
						<p style="color: #666; font-size: 14px;">
							This code will expire in 5 minutes.
						</p>
						<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
						<p style="color: #999; font-size: 12px; text-align: center;">
							SocioPay - Your Neighborhood Payment Solution
						</p>
					</div>
				`,
      }
  }
}

// Send email using Ethereal (development)
async function sendEmailWithEthereal({ to, otp, type }: SendOTPEmailParams) {
  try {
    const testAccount = await createEtherealTestAccount()

    // Create transporter with Ethereal SMTP
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })

    const { subject, html } = getEmailContent(type, otp)

    const info = await transporter.sendMail({
      from: '"SocioPay Development" <noreply@sociopay.dev>',
      to: to,
      subject: subject,
      html: html,
    })

    console.log('')
    console.log('='.repeat(60))
    console.log('📧 ETHEREAL EMAIL SENT SUCCESSFULLY')
    console.log('='.repeat(60))
    console.log('📨 Preview URL:', nodemailer.getTestMessageUrl(info))
    console.log('🔐 OTP Code:', otp)
    console.log('📧 To:', to)
    console.log('📝 Type:', type)
    console.log('='.repeat(60))
    console.log('')

    return {
      id: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    }
  } catch (error) {
    console.error('Failed to send email with Ethereal:', error)
    throw error
  }
}

// Send email using Resend (production)
async function sendEmailWithResend({ to, otp, type }: SendOTPEmailParams) {
  try {
    // Check if Resend is properly configured
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    // Validate email parameters
    if (!to || !otp) {
      throw new Error('Email address and OTP are required')
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL || 'SocioPay <onboarding@resend.dev>'
    const { subject, html } = getEmailContent(type, otp)

    console.log(
      `Attempting to send ${type} email to ${to} with from: ${fromEmail}`
    )

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Resend API error:', error)

      // Handle the specific case where domain verification is required
      const errorMessage = error.message || ''
      const errorData = error as any // Type assertion for accessing additional properties

      if (
        errorMessage.includes('verify a domain') ||
        errorMessage.includes('testing emails to your own email') ||
        errorData.statusCode === 403
      ) {
        throw new Error(
          `Email sending failed: ${
            errorMessage ||
            'Domain verification required. In development, you can only send emails to your verified address or verify a domain at resend.com/domains'
          }`
        )
      }

      throw new Error(
        `Failed to send email: ${errorMessage || JSON.stringify(error)}`
      )
    }

    if (!data) {
      throw new Error('No data returned from Resend API')
    }

    console.log('Email sent successfully via Resend:', data.id)
    return data
  } catch (error) {
    console.error('Error sending OTP email via Resend:', error)

    // If it's our custom error, re-throw it
    if (error instanceof Error) {
      throw error
    }

    // For unknown errors, wrap them
    throw new Error(`Unexpected error sending email: ${String(error)}`)
  }
}

// Main email sending function that chooses between Ethereal and Resend
export async function sendOTPEmail({ to, otp, type }: SendOTPEmailParams) {
  try {
    // In development, use Ethereal Email
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Development mode: Using Ethereal Email')
      return await sendEmailWithEthereal({ to, otp, type })
    }

    // In production, use Resend
    console.log('🚀 Production mode: Using Resend')
    return await sendEmailWithResend({ to, otp, type })
  } catch (error) {
    console.error('Failed to send OTP email:', error)

    // In development, provide a fallback with console logging
    if (process.env.NODE_ENV === 'development') {
      console.log('')
      console.log('='.repeat(60))
      console.log('🚨 EMAIL SENDING FAILED - CONSOLE FALLBACK')
      console.log('='.repeat(60))
      console.log('🔐 OTP Code:', otp)
      console.log('📧 To:', to)
      console.log('📝 Type:', type)
      console.log(
        '❌ Error:',
        error instanceof Error ? error.message : String(error)
      )
      console.log('='.repeat(60))
      console.log('')

      // Don't throw error in development, allow the process to continue
      return { id: 'console-fallback', previewUrl: null }
    }

    // In production, re-throw the error
    throw error
  }
}

export { resend }
