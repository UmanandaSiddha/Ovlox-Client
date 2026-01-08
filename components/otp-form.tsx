"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import Image from "next/image"
import { PlaceholderImage } from "@/assets"
import { verify } from "@/services/auth.service"
import { toast } from "sonner"

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const from = searchParams.get("from") || "/dashboard"
    const email = searchParams.get("email") || ""
    const phoneNumber = searchParams.get("phoneNumber") || undefined
    const [otp, setOtp] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (otp.length !== 6) {
            toast.warning("Enter 6 digit code")
            return
        }
        setIsSubmitting(true)
        try {
            await verify({ otpString: otp, email: email || undefined, phoneNumber })
            toast.success("Verified", { description: "Your account is verified." })
            router.push(from)
        } catch (error: any) {
            toast.error("Verification failed", { description: error?.response?.data?.message || "Invalid or expired code." })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className={cn("flex flex-col gap-6 md:min-h-[450px]", className)}
            {...props}
        >
            <Card className="flex-1 overflow-hidden p-0">
                <CardContent className="grid flex-1 p-0 md:grid-cols-2">
                    <form className="flex flex-col items-center justify-center p-6 md:p-8" onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field className="items-center text-center">
                                <h1 className="text-2xl font-bold">Enter verification code</h1>
                                <p className="text-muted-foreground text-sm text-balance">
                                    We sent a 6-digit code to your email
                                </p>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="otp" className="sr-only">
                                    Verification code
                                </FieldLabel>
                                <InputOTP
                                    maxLength={6}
                                    id="otp"
                                    required
                                    value={otp}
                                    onChange={(value) => setOtp(value)}
                                >
                                    <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                                <FieldDescription className="text-center">
                                    Enter the 6-digit code sent to your email.
                                </FieldDescription>
                            </Field>
                            <Field>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Verifying..." : "Verify"}
                                </Button>
                                <FieldDescription className="text-center">
                                    Didn&apos;t receive the code? <a href="#">Resend</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <Image
                            src={PlaceholderImage}
                            alt="Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <FieldDescription className="text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    )
}