"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [keywords, setKeywords] = useState<string[]>([])
  const [currentKeyword, setCurrentKeyword] = useState("")

  const addKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()])
      setCurrentKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addKeyword()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (keywords.length > 0) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">SL</span>
            </div>
            <h2 className="text-2xl font-bold">SocialListen</h2>
          </div>
          <CardTitle className="text-2xl">Let's set up your monitoring</CardTitle>
          <CardDescription>
            Enter keywords or brand names you want to monitor across social media and the web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="keywords">Keywords or Brand Names</Label>
                <div className="flex gap-2">
                  <Input
                    id="keywords"
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a keyword and press Enter"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addKeyword} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="px-3 py-1.5 text-sm">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {keywords.length === 0 && (
                    <div className="text-sm text-muted-foreground">Add at least one keyword to start monitoring</div>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Tips for effective monitoring:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li>Include your brand name and common misspellings</li>
                  <li>Add product names and key industry terms</li>
                  <li>Consider including competitor names</li>
                  <li>Use specific hashtags relevant to your brand</li>
                </ul>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={keywords.length === 0} className="w-full">
            Start Monitoring
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

