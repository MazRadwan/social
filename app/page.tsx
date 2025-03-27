"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/onboarding")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">SL</span>
            </div>
            <h2 className="text-2xl font-bold">SocialListen</h2>
          </div>
          <CardTitle className="text-2xl">{isLogin ? "Sign in" : "Create an account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Enter your credentials to access your account" : "Fill in the details to create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {!isLogin && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  )}
                </div>
                <Input id="password" type="password" />
              </div>
              <Button type="submit" className="w-full">
                {isLogin ? "Sign in" : "Create account"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground text-center w-full">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

