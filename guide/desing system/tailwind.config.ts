/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Typography ──────────────────────────────────────────
      fontFamily: {
        // Display / Headings — always Poppins
        display: ["var(--font-poppins)", "ui-sans-serif", "system-ui"],
        poppins: ["var(--font-poppins)", "ui-sans-serif", "system-ui"],
        // Body copy — always Inter
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        inter: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        // Data / Metrics / Code — Geist Mono (makes it feel like a research tool)
        data: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        // Legacy (keep for now)
        arcade: ["var(--font-arcade)"],
        raleway: ["var(--font-raleway)"],
      },

      // ── Border Radius ────────────────────────────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },

      // ── Colors ───────────────────────────────────────────────
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // Amber accent — visual tension against forest green
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      // ── Box Shadows ──────────────────────────────────────────
      boxShadow: {
        // Design system elevation scale
        "tx-sm": "var(--shadow-sm)",
        "tx-md": "var(--shadow-md)",
        "tx-lg": "var(--shadow-lg)",
        "tx-glow-primary": "var(--shadow-glow-primary)",
        "tx-glow-accent": "var(--shadow-glow-accent)",
      },

      // ── Animations ───────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(20px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-15px, 10px) scale(0.97)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-slide-up": "fade-slide-up 0.5s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 4s ease-in-out infinite",
        blob: "blob 8s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },

      // ── Typography Plugin ─────────────────────────────────────
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: "hsl(var(--foreground))",
            maxWidth: "none",
            h1: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-poppins)",
              fontWeight: "700",
            },
            h2: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-poppins)",
              fontWeight: "700",
            },
            h3: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-poppins)",
              fontWeight: "600",
            },
            h4: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-poppins)",
              fontWeight: "600",
            },
            strong: { color: "hsl(var(--foreground))" },
            blockquote: {
              color: "hsl(var(--foreground))",
              borderLeftColor: "hsl(var(--primary))",
              borderLeftWidth: "3px",
              fontStyle: "normal",
            },
            a: {
              color: theme("colors.green.700"),
              textDecoration: "underline",
              "&:hover": { color: theme("colors.green.800") },
            },
            code: {
              color: "hsl(var(--foreground))",
              borderRadius: theme("borderRadius.md"),
              paddingLeft: theme("padding[1.5]"),
              paddingRight: theme("padding[1.5]"),
              paddingTop: theme("padding[0.5]"),
              paddingBottom: theme("padding[0.5]"),
              fontWeight: "500",
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            th: { color: "hsl(var(--foreground))" },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
