"use client"

import { useState } from "react"
import { Button } from "./button"

export function TabsExample() {
  const [activeTab, setActiveTab] = useState<"positive" | "negative">("negative")
  
  return (
    <div className="w-full">
      <div className="flex w-full overflow-hidden border-b border-border">
        <Button
          variant="tab-positive"
          className="flex-1 py-2 px-0"
          data-state={activeTab === "positive" ? "active" : "inactive"}
          onClick={() => setActiveTab("positive")}
        >
          Positive
        </Button>
        <Button
          variant="tab-negative"
          className="flex-1 py-2 px-0"
          data-state={activeTab === "negative" ? "active" : "inactive"}
          onClick={() => setActiveTab("negative")}
        >
          Negative
        </Button>
      </div>
      
      <div className="p-4">
        {activeTab === "positive" ? (
          <p>Positive content goes here</p>
        ) : (
          <p>Negative content goes here</p>
        )}
      </div>
    </div>
  )
} 