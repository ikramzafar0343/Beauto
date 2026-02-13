import { Inter, Crimson_Pro } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

export default function ThemeRegistry() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 14px;
          height: 14px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--color-border, #e5e5e5);
          border: 4px solid transparent;
          border-radius: 9999px;
          background-clip: content-box;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--color-muted-foreground, #666666);
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }

        /* Transition Utilities */
        body {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }

        /* Text Selection */
        ::selection {
          background-color: var(--color-primary, #1a1a1a);
          color: var(--color-primary-foreground, #ffffff);
        }
        
        /* Gradient Utilities */
        .animated-gradient {
          background-size: 200% auto;
          animation: animated-gradient 3s linear infinite;
        }
        
        @keyframes animated-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `,
      }}
    />
  );
}