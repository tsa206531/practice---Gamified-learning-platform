interface ColorfulProgressProps {
  value: number
  className?: string
}

export function ColorfulProgress({ value, className = "" }: ColorfulProgressProps) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-secondary via-primary to-accent transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
