import type { Config } from "tailwindcss"
import typography from "@tailwindcss/typography"
import type { PluginAPI } from 'tailwindcss/types/config'

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
		"./index.html",
		"./src/**/*.{ts,tsx,md,mdx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: { "2xl": "1400px" },
		},
		extend: {
			fontFamily: {
				inter: ["Inter", "sans-serif"],
				"space-grotesk": ["Space Grotesk", "sans-serif"],
				minora: ['"Minora Trial"', "system-ui", "sans-serif"],
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
					glow: "hsl(var(--primary-glow))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				gaming: {
					purple: "hsl(var(--gaming-purple))",
					orange: "hsl(var(--gaming-orange))",
					green: "hsl(var(--gaming-green))",
				},
			},
			backgroundImage: {
				"gradient-primary": "var(--gradient-primary)",
				"gradient-secondary": "var(--gradient-secondary)",
				"gradient-hero": "var(--gradient-hero)",
				"gradient-card": "var(--gradient-card)",
			},
			boxShadow: {
				glow: "var(--shadow-glow)",
				card: "var(--shadow-card)",
				intense: "var(--shadow-intense)",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
				"accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},

			typography: (api: PluginAPI) => {
				// tiny helpers
				const t = (key: string, fallback = '') =>
					(api.theme(key) as string | undefined) ?? fallback;

				const tf = (key: string, fallback: string[]) =>
					((api.theme(key) as unknown) as string[] | undefined) ?? fallback;

				const sg = tf('fontFamily.space-grotesk', ['Space Grotesk', 'sans-serif']).join(',');

				return {
					DEFAULT: {
						css: {
							color: t('colors.muted.foreground'),
							maxWidth: '72ch',
							a: {
								color: t('colors.primary.DEFAULT'),
								textDecoration: 'none',
								fontWeight: '600',
								'&:hover': { opacity: 0.9 },
							},
							h1: { color: t('colors.foreground'), fontFamily: sg, fontWeight: '800' },
							h2: { color: t('colors.foreground'), fontFamily: sg, fontWeight: '700' },
							h3: { color: t('colors.foreground'), fontWeight: '700' },
							blockquote: { borderLeftColor: t('colors.border'), color: t('colors.foreground') },
							hr: { borderColor: t('colors.border') },
							code: {
								color: t('colors.foreground'),
								backgroundColor: t('colors.muted.DEFAULT'),
								padding: '0.15rem 0.35rem',
								borderRadius: t('borderRadius.sm', '0.125rem'),
							},
							pre: {
								backgroundColor: t('colors.muted.DEFAULT'),
								color: t('colors.foreground'),
								border: `1px solid ${t('colors.border')}`,
								borderRadius: t('borderRadius.lg', '0.5rem'),
							},
							'pre code': { backgroundColor: 'transparent', padding: 0 },
							'thead th': { color: t('colors.foreground') },
							'tbody tr': { borderBottomColor: t('colors.border') },
							img: { borderRadius: t('borderRadius.lg', '0.5rem') },
						},
					},
					invert: {
						css: {
							color: t('colors.muted.foreground'),
							a: { color: t('colors.primary.DEFAULT') },
							h1: { color: t('colors.foreground') },
							h2: { color: t('colors.foreground') },
							h3: { color: t('colors.foreground') },
							blockquote: { borderLeftColor: t('colors.border'), color: t('colors.foreground') },
							hr: { borderColor: t('colors.border') },
							code: {
								color: t('colors.foreground'),
								backgroundColor: t('colors.muted.DEFAULT'),
							},
							pre: {
								backgroundColor: t('colors.muted.DEFAULT'),
								color: t('colors.foreground'),
								border: `1px solid ${t('colors.border')}`,
							},
							'thead th': { color: t('colors.foreground') },
							'tbody tr': { borderBottomColor: t('colors.border') },
						},
					},
				};
			},
		},
	},
	plugins: [
		typography,
		require("tailwindcss-animate"),
	],
} satisfies Config
