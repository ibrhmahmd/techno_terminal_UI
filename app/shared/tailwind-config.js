// Precision Engine Tailwind Configuration
// Shared theme for all pages - DO NOT MODIFY LOCALLY

const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#000000',
        'primary-container': '#131b2e',
        'on-primary': '#ffffff',
        
        // Secondary Colors (Teal - Heartbeat of System)
        'secondary': '#006a61',
        'secondary-container': '#86f2e4',
        'secondary-fixed': '#89f5e7',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#002019',
        'on-secondary-fixed': '#001f17',
        
        // Tertiary Colors (Purple - Data Viz)
        'tertiary': '#000000',
        'tertiary-container': '#0f0069',
        'tertiary-fixed': '#7671ff',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#ffffff',
        
        // Surface Colors (Tonal Layering)
        'surface': '#f8f9ff',
        'surface-dim': '#cbdbf5',
        'surface-bright': '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#45464d',
        
        // Semantic Colors
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#410e0b',
        
        // Outline Colors
        'outline': '#76777d',
        'outline-variant': '#c6c6cd',
        'inverse-on-surface': '#f0f0f0',
        'inverse-surface': '#0f1f32',
        'inverse-primary': '#d4e4ff',
        
        // Extended Palette for Data Visualization
        'success': '#00a872',
        'warning': '#ff9500',
        'info': '#0066cc',
        'neutral': '#9c9ca0',
        
        // Overlay & Glassmorphism
        'overlay': 'rgba(11, 28, 48, 0.4)',
      },
      borderRadius: {
        'DEFAULT': '0.375rem',
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        'full': '9999px',
      },
      fontSize: {
        'xs': ['0.7rem', { lineHeight: '0.875rem', letterSpacing: '0.04em' }],
        'sm': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        'base': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.01em' }],
        'lg': ['1rem', { lineHeight: '1.5rem' }],
        'xl': ['1.125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.75rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
      },
      fontFamily: {
        'headline': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      spacing: {
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(11, 28, 48, 0.05)',
        'DEFAULT': '0 4px 6px rgba(11, 28, 48, 0.1)',
        'md': '0 12px 16px -4px rgba(11, 28, 48, 0.1)',
        'lg': '0 20px 24px -4px rgba(11, 28, 48, 0.15)',
        'xl': '0 25px 50px -12px rgba(11, 28, 48, 0.25)',
        'inner': 'inset 0 2px 4px rgba(11, 28, 48, 0.05)',
      },
      backdropBlur: {
        'sm': '4px',
        'md': '12px',
        'lg': '20px',
      },
      opacity: {
        '5': '0.05',
        '8': '0.08',
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
      },
    },
  },
};

// Auto-inject if running in browser
if (typeof window !== 'undefined' && window.tailwind) {
  window.tailwind.config = tailwindConfig;
}
