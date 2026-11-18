/** @type {import('tailwindcss').Config} */
// Up+Above — tokens from the brand guide (Project Branding_Up+Above.pdf).
// Lime #C8FF00 is the only accent. Backgrounds are an off-black and an
// off-white, never pure #000/#FFF, so the lime reads brighter against them.
// (v4 has no auto-loaded config file — the @config directive opts this in.)
module.exports = {
  content: ['./index.html', './src/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0A',
        surface: '#151514',
        ink: '#F2F2EC',
        lime: '#C8FF00',
        grey: '#E2E2E2',
      },
      // Bricolage Grotesque for headlines, Inter for body — per the brand guide.
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      // Fluid type: every size interpolates with the viewport instead of
      // jumping at breakpoints. Display sizes run tight and short the way the
      // reference studios set them; labels run wide.
      fontSize: {
        mark: ['clamp(4.5rem, 20vw, 26rem)', { lineHeight: '0.8', letterSpacing: '-0.055em' }],
        display: ['clamp(3rem, 9vw, 10rem)', { lineHeight: '0.86', letterSpacing: '-0.045em' }],
        h2: ['clamp(2.25rem, 5.2vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        statement: ['clamp(1.85rem, 4.1vw, 4.4rem)', { lineHeight: '1.06', letterSpacing: '-0.03em' }],
        h3: ['clamp(1.375rem, 2vw, 2rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'body-lg': ['clamp(1.0625rem, 1.2vw, 1.25rem)', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        label: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.08em' }],
      },
    },
  },
  plugins: [],
};
