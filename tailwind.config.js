/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:             'var(--bg)',
        'bg-elevated':  'var(--bg-elevated)',
        surface:        'var(--surface)',
        'surface-2':    'var(--surface-2)',
        'surface-3':    'var(--surface-3)',
        border:         'var(--border)',
        'border-strong':'var(--border-strong)',
        'border-accent':'var(--border-accent)',
        text:           'var(--text)',
        muted:          'var(--text-muted)',
        subtle:         'var(--text-subtle)',
        accent:         'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-soft':  'var(--accent-soft)',
        'accent-ring':  'var(--accent-ring)',
        success:        'var(--success)',
        'success-soft': 'var(--success-soft)',
        warning:        'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
        danger:         'var(--danger)',
        'danger-soft':  'var(--danger-soft)',
        info:           'var(--info)',
        'info-soft':    'var(--info-soft)',
        // legacy aliases kept for any remaining code
        green:          'var(--success)',
        red:            'var(--danger)',
        yellow:         'var(--warning)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm:   'var(--shadow-sm)',
        md:   'var(--shadow-md)',
        lg:   'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        shimmer:     'shimmer 1.5s infinite linear',
        'fade-in':   'fade-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow':'pulse-slow 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
        micro:    'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
