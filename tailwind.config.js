module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {
        '320': '320px',
        '480': '480px',
        '640': '640px'
      },
      height: {  
        '180': '180px',
        '270': '270px',
        '360': '360px'
      },
      colors: {
        'light-accent': '#216BEA',
        'dark-accent': '#1B48C4',
        darkAccent: '#1B48C4',
        lightAccent: '#216BEA',
        badAccent: '#FF282F',
        darkBackground: '#24232B',
        lightBackground: '#2F2F38',
        text: '#FFFFFF',
        subText: '#A0A0A0',
        titlebar: '#FFFFFF'
      },
      fontFamily: {
        'disket': ['Disket'],
        'inconsolata': ['Inconsolata']
      }
    },
  },
  plugins: [],
}
