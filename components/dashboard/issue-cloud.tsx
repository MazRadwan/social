"use client"

import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArticlesByIssue } from '@/lib/data/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface IssueCloudProps {
  issuesData: ArticlesByIssue[] | null
  loading: boolean
  onDrillDown?: (issue: string) => void
}

export function IssueCloud({
  issuesData,
  loading,
  onDrillDown
}: IssueCloudProps) {
  // Ref for the container to get dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Use refs instead of state to avoid re-render cycles
  const previousPlacedBubblesRef = useRef<Array<any>>([]);
  const prevBubblesStringRef = useRef<string>('');

  // Effect to get container dimensions after render
  useEffect(() => {
    // Add a small delay to ensure container has rendered
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        console.log('Updated issue cloud dimensions:', { width, height });
      }
    }, 100);
    
    // Update dimensions on resize
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Also update dimensions when data changes
  useEffect(() => {
    if (issuesData && issuesData.length > 0 && containerRef.current) {
      // Small delay to ensure the DOM has updated
      const timer = setTimeout(() => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          if (width !== dimensions.width || height !== dimensions.height) {
            setDimensions({ width, height });
            console.log('Dimensions updated after data change:', { width, height });
          }
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [issuesData, dimensions.width, dimensions.height]);

  // Generate colors for each bubble
  const colors = useMemo(() => {
    // Color categories inspired by the image
    const colorSchemes = [
      { bg: 'rgba(166, 218, 149, 1)', text: 'white' },           // Green
      { bg: 'rgba(239, 93, 93, 0.95)', text: 'white' },          // Red
      { bg: 'rgba(186, 153, 230, 0.95)', text: 'white' },        // Purple
      { bg: 'rgba(92, 179, 205, 0.95)', text: 'white' },         // Blue
      { bg: 'rgba(249, 185, 87, 0.95)', text: 'rgba(0,0,0,0.8)' } // Yellow
    ];
    
    return colorSchemes;
  }, []);

  // Prepare data for the visualization
  const bubbleData = useMemo(() => {
    if (!issuesData || issuesData.length === 0) return [];
    
    // Calculate min and max counts for scaling
    const maxCount = Math.max(...issuesData.map(issue => issue.count));
    const minCount = Math.min(...issuesData.map(issue => issue.count));
    
    // Create bubble data
    return issuesData.map((issue, i) => {
      // Scale size between 40px (min) and 140px (max)
      const sizeRange = 100;
      const minSize = 40;
      // Use sqrt scaling for better size distribution
      const size = minSize + Math.sqrt((issue.count - minCount) / (maxCount - minCount || 1)) * sizeRange;
      
      // Assign a color category
      const colorIndex = i % colors.length;
      const opacity = 0.5 + ((issue.count - minCount) / (maxCount - minCount || 1)) * 0.5;
      const color = colors[colorIndex].bg.replace('1)', `${opacity})`);
      
      // Truncate long issue names
      const displayText = issue.issue.length > 12 
        ? `${issue.issue.substring(0, 10)}...` 
        : issue.issue;
      
      return {
        ...issue,
        size,
        color,
        fontColor: colors[colorIndex].text,
        displayText
      };
    });
  }, [issuesData, colors]);

  // Place bubbles without overlap and within container bounds
  const placeBubbles = useCallback(() => {
    console.log('placeBubbles called with dimensions:', dimensions);
    console.log('bubbleData:', bubbleData);
    
    // Use default dimensions if the container dimensions are not available yet
    const effectiveWidth = dimensions.width || 300;  // Default width if zero
    const effectiveHeight = dimensions.height || 300; // Default height if zero
    
    if (bubbleData.length === 0) {
      console.log('Skipping bubble placement - no data');
      return [];
    }
    
    const placedBubbles: Array<any> = [];
    const padding = 2; // Minimum space between bubbles
    
    // Calculate center point
    const centerX = effectiveWidth / 2;
    const centerY = effectiveHeight / 2;
    
    // Sort bubbles by size (largest first) for better placement
    const sortedBubbles = [...bubbleData].sort((a, b) => b.size - a.size);
    console.log('Sorted bubbles for placement:', sortedBubbles);
    
    // Define gravity parameters
    const gravitationalPull = 0.3; // How strongly bubbles are attracted to center (0-1)
    const spiralFactor = 0.8; // How much spiral effect to apply
    const minDistanceFromCenter = 10; // Minimum distance from center to avoid overlapping

    for (const bubble of sortedBubbles) {
      let isPlaced = false;
      let attempts = 0;
      const maxAttempts = 200;
      
      while (!isPlaced && attempts < maxAttempts) {
        // Start with a position that's more likely to be near the center
        const radius = bubble.size / 2;
        const distanceScale = Math.random(); // 0-1
        
        // Apply gravitational bias - larger/more important bubbles closer to center
        const normalizedSize = (bubble.size - 40) / 100; // 0-1 based on bubble size range
        const gravitationalBias = 1 - (normalizedSize * gravitationalPull);
        
        // Calculate distance from center, biased by gravity
        const distance = minDistanceFromCenter + (
          distanceScale * gravitationalBias * Math.min(effectiveWidth, effectiveHeight) * 0.4
        );
        
        // Apply spiral effect by using angle
        const angle = Math.random() * Math.PI * 2 * spiralFactor + 
                     (attempts / maxAttempts) * Math.PI * 2; // Spiral effect
        
        // Convert polar to cartesian coordinates
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        // Check if this position overlaps with any placed bubbles
        const overlaps = placedBubbles.some(placed => {
          const dx = placed.x - x;
          const dy = placed.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < (placed.radius + radius + padding);
        });
        
        // Check if bubble is inside container bounds with margin
        const inBounds = 
          x - radius >= 0 && 
          x + radius <= effectiveWidth && 
          y - radius >= 0 && 
          y + radius <= effectiveHeight;
        
        if (!overlaps && inBounds) {
          placedBubbles.push({
            ...bubble,
            x,
            y,
            radius
          });
          isPlaced = true;
        }
        
        attempts++;
      }
      
      // If we couldn't place after max attempts, try with a smaller size
      if (!isPlaced) {
        console.log(`Could not place bubble "${bubble.issue}" after ${maxAttempts} attempts, trying smaller size`);
        const smallerBubble = {
          ...bubble,
          size: bubble.size * 0.8
        };
        
        const radius = smallerBubble.size / 2;
        let placed = false;
        
        // Try a few more times with smaller size
        for (let i = 0; i < 50 && !placed; i++) {
          // Apply similar gravity logic for smaller bubbles, but allow them to go further out
          const distanceScale = Math.random();
          const angle = Math.random() * Math.PI * 2;
          const distance = minDistanceFromCenter + (
            distanceScale * Math.min(effectiveWidth, effectiveHeight) * 0.45
          );
          
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          
          // Check overlap again
          const overlaps = placedBubbles.some(placed => {
            const dx = placed.x - x;
            const dy = placed.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (placed.radius + radius + padding);
          });
          
          const inBounds = 
            x - radius >= 0 && 
            x + radius <= effectiveWidth && 
            y - radius >= 0 && 
            y + radius <= effectiveHeight;
            
          if (!overlaps && inBounds) {
            placedBubbles.push({
              ...smallerBubble,
              x,
              y,
              radius
            });
            placed = true;
          }
        }
        
        if (!placed) {
          console.log(`Still could not place "${bubble.issue}" even with smaller size`);
        }
      }
    }
    
    console.log('Placed bubbles result:', placedBubbles);
    return placedBubbles;
  }, [bubbleData, dimensions]);

  const placedBubbles = useMemo(() => {
    // Only recalculate if we have both data and meaningful dimensions
    const hasValidDimensions = dimensions.width > 10 && dimensions.height > 10;
    const hasData = bubbleData.length > 0;
    
    let result: Array<any> = [];
    
    if (hasValidDimensions && hasData) {
      result = placeBubbles();
    } else if (!hasValidDimensions && previousPlacedBubblesRef.current.length > 0) {
      // If we previously placed bubbles but now have invalid dimensions, keep the existing placement
      result = previousPlacedBubblesRef.current;
    } else {
      // Try anyway, will use default dimensions if needed
      result = placeBubbles();
    }
    
    // Store the result for future use in a ref - this doesn't trigger re-renders
    if (result.length > 0) {
      const currentBubblesString = JSON.stringify(result);
      if (currentBubblesString !== prevBubblesStringRef.current) {
        prevBubblesStringRef.current = currentBubblesString;
        previousPlacedBubblesRef.current = result;
      }
    }
    
    return result;
  }, [placeBubbles, dimensions.width, dimensions.height, bubbleData.length]); // Remove previousPlacedBubbles from dependencies
  
  // Debug - log the data we have
  useEffect(() => {
    console.log('IssueCloud render with data:', { issuesData, loading, dimensions, bubbleDataLength: bubbleData.length, placedBubblesLength: placedBubbles.length });
  }, [issuesData, loading, dimensions, bubbleData, placedBubbles]);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Issue Cloud</CardTitle>
        <CardDescription>Most frequently assigned issues</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading issues data...</p>
          </div>
        ) : bubbleData.length > 0 ? (
          <div className="h-[300px] relative" ref={containerRef}>
            {/* Bubble cloud visualization */}
            <div className="w-full h-full relative">
              <TooltipProvider>
                {placedBubbles.map((bubble) => (
                  <Tooltip key={bubble.issue}>
                    <TooltipTrigger asChild>
                      <div
                        className="rounded-full absolute flex items-center justify-center transition-all duration-300 hover:opacity-90 cursor-pointer"
                        style={{
                          width: `${bubble.size}px`,
                          height: `${bubble.size}px`,
                          backgroundColor: bubble.color,
                          top: 0,
                          left: 0,
                          transform: `translate(${bubble.x - bubble.radius}px, ${bubble.y - bubble.radius}px)`,
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          zIndex: Math.round(bubble.count),
                        }}
                        onClick={() => onDrillDown && onDrillDown(bubble.issue)}
                      >
                        <div 
                          className="text-center font-medium px-2"
                          style={{ 
                            color: bubble.fontColor,
                            fontSize: `${Math.max(10, bubble.size / 6)}px`,
                            lineHeight: 1.2
                          }}
                        >
                          {bubble.displayText}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col">
                        <span className="font-medium">{bubble.issue}</span>
                        <span className="text-xs text-muted-foreground">{bubble.count} mentions</span>
                        {onDrillDown && (
                          <span className="text-xs italic mt-1">Click to view details</span>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No issues data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 