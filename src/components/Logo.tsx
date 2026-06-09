import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  
  height?: number
  
  linked?: boolean
  className?: string
}

export function Logo({ height = 22, linked = true, className = '' }: LogoProps) {
  const img = (
    <Image
      src="/logo.svg"
      alt="CodeNest"
      height={height}
      width={height * 5.5}   
      className={`dark:invert ${className}`}
      priority
    />
  )

  return linked ? (
    <Link href="/" className="flex items-center">
      {img}
    </Link>
  ) : (
    <span className="flex items-center">{img}</span>
  )
}
