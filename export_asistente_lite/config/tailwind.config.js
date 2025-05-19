/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Si se usa ThemeProvider
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}', // Adaptar a la estructura del nuevo proyecto
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Aquí irían las definiciones de color HSL que teníamos en la rama 'cambios-visuales' si se quiere replicar ese tema.
      // Para la rama 'main' actual, puede que sea más simple o use los colores por defecto de Tailwind.
      // Por ahora, se deja la extensión de la rama 'main'.
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
       // Si se usa el theming de Shadcn/Radix de 'cambios-visuales', se añadirían aquí:
      // colors: { ... hsl(var(--border)) ... },
      // borderRadius: { ... var(--radius) ... },
      // keyframes: { ... accordion ... },
      // animation: { ... accordion ... },
    },
  },
  plugins: [
    // require("tailwindcss-animate"), // Si se usan animaciones de Shadcn/Radix
  ],
}
