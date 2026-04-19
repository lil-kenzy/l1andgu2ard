import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Extra 3-D depth: 'sm' | 'md' | 'lg' */
  depth?: 'sm' | 'md' | 'lg';
  /** Enable parallax shift on hover (desktop) */
  parallax?: boolean;
  /** Forwarded aria role */
  role?: React.AriaRole;
  /** Forwarded aria label */
  'aria-label'?: string;
}

export function GlassCard({
  children,
  className = '',
  depth = 'md',
  parallax = false,
  role,
  'aria-label': ariaLabel,
}: GlassCardProps) {
  const depthClass = {
    sm: 'depth-2',
    md: 'depth-3',
    lg: 'depth-4',
  }[depth];

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={`glass-card ${depthClass} ${parallax ? 'parallax-layer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

