// Configuración de PostCSS para Tailwind CSS v3 (recomendado)
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
// Si se usara Tailwind CSS v4 y diera error, se podría necesitar:
// module.exports = {
//   plugins: {
//     '@tailwindcss/postcss': {},
//     autoprefixer: {},
//   },
// }
