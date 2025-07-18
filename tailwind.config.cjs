/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */

module.exports = {
	mode: 'jit',
	content:  [
		"./index.html",
    	"./src/**/*.{js,ts,jsx,tsx}", 
		'./safelist.txt'
	],
	darkMode: 'class',
		theme: {
			fontFamily: {
				sans: [
					'Inter',
					'ui-sans-serif',
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'"Helvetica Neue"',
					'Arial',
					'"Noto Sans"',
					'sans-serif',
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"',
				],
				serif: [
					'ui-serif',
					'Georgia',
					'Cambria',
					'"Times New Roman"',
					'Times',
					'serif',
				],
				mono: [
					'ui-monospace',
					'SFMono-Regular',
					'Menlo',
					'Monaco',
					'Consolas',
					'"Liberation Mono"',
					'"Courier New"',
					'monospace',
				],
			},
			screens: {
				xs: '576px',
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1536px',
			},
			extend: {
				colors: {
					// Neutral
					'neutral': 'var(--neutral)',
					
					// Primary - Escala completa
					'primary': {
						50: 'var(--primary-50)',
						100: 'var(--primary-100)',
						200: 'var(--primary-200)',
						300: 'var(--primary-300)',
						400: 'var(--primary-400)',
						500: 'var(--primary-500)',
						600: 'var(--primary-600)',
						700: 'var(--primary-700)',
						800: 'var(--primary-800)',
						900: 'var(--primary-900)',
						950: 'var(--primary-950)',
						// Mantener aliases de compatibilidad
						'DEFAULT': 'var(--primary-600)',
						'deep': 'var(--primary-700)',
						'mild': 'var(--primary-500)',
						'subtle': 'var(--primary-50)',
					},
					
					// Error - Escala completa
					'error': {
						50: 'var(--error-50)',
						100: 'var(--error-100)',
						200: 'var(--error-200)',
						300: 'var(--error-300)',
						400: 'var(--error-400)',
						500: 'var(--error-500)',
						600: 'var(--error-600)',
						700: 'var(--error-700)',
						800: 'var(--error-800)',
						900: 'var(--error-900)',
						950: 'var(--error-950)',
						// Mantener aliases de compatibilidad
						'DEFAULT': 'var(--error-500)',
						'subtle': 'var(--error-50)',
					},
					
					// Success - Escala completa
					'success': {
						50: 'var(--success-50)',
						100: 'var(--success-100)',
						200: 'var(--success-200)',
						300: 'var(--success-300)',
						400: 'var(--success-400)',
						500: 'var(--success-500)',
						600: 'var(--success-600)',
						700: 'var(--success-700)',
						800: 'var(--success-800)',
						900: 'var(--success-900)',
						950: 'var(--success-950)',
						// Mantener aliases de compatibilidad
						'DEFAULT': 'var(--success-500)',
						'subtle': 'var(--success-50)',
					},
					
					// Info - Escala completa
					'info': {
						50: 'var(--info-50)',
						100: 'var(--info-100)',
						200: 'var(--info-200)',
						300: 'var(--info-300)',
						400: 'var(--info-400)',
						500: 'var(--info-500)',
						600: 'var(--info-600)',
						700: 'var(--info-700)',
						800: 'var(--info-800)',
						900: 'var(--info-900)',
						950: 'var(--info-950)',
						// Mantener aliases de compatibilidad
						'DEFAULT': 'var(--info-500)',
						'subtle': 'var(--info-50)',
					},
					
					// Warning - Escala completa
					'warning': {
						50: 'var(--warning-50)',
						100: 'var(--warning-100)',
						200: 'var(--warning-200)',
						300: 'var(--warning-300)',
						400: 'var(--warning-400)',
						500: 'var(--warning-500)',
						600: 'var(--warning-600)',
						700: 'var(--warning-700)',
						800: 'var(--warning-800)',
						900: 'var(--warning-900)',
						950: 'var(--warning-950)',
						// Mantener aliases de compatibilidad
						'DEFAULT': 'var(--warning-500)',
						'subtle': 'var(--warning-50)',
					},
					
					// Grises - Escala completa (mantenida)
					'gray-50': 'var(--gray-50)',
					'gray-100': 'var(--gray-100)',
					'gray-200': 'var(--gray-200)',
					'gray-300': 'var(--gray-300)',
					'gray-400': 'var(--gray-400)',
					'gray-500': 'var(--gray-500)',
					'gray-600': 'var(--gray-600)',
					'gray-700': 'var(--gray-700)',
					'gray-800': 'var(--gray-800)',
					'gray-900': 'var(--gray-900)',
					'gray-950': 'var(--gray-950)',
				},
				typography: (theme) => ({
					DEFAULT: {
						css: {
							color: theme('colors.gray.500'),
							maxWidth: '65ch',
						},
					},
					invert: {
						css: {
							color: theme('colors.gray.400'),
						},
					},
				}),
			},
		},
	plugins: [
        require('@tailwindcss/typography'),
	],
};