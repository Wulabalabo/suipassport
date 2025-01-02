interface StatsCardProps {
    value: string | number
    label: string
    className?: string
}

export function StatsCard({ value, label, className = '' }: StatsCardProps) {
    return (
        <div className={`p-4 flex rounded-md bg-card border border-border shadow shadow-border flex-col justify-between items-start  ${className}`}>
            <h1 className="text-2xl lg:text-4xl font-bold">{value}</h1>
            <p className="lg:text-sm text-blue-500">
                {label}
            </p>
        </div>
    )
} 