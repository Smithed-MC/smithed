function withOpacity(cssVariable) {
  return ({ opacityValue }) => {
      return `var(${cssVariable})`
  }
}

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
        darkAccent: withOpacity('--darkAccent'),
        lightAccent: withOpacity('--lightAccent'),
        badAccent: withOpacity('--badAccent'),
        darkBackground: withOpacity('--darkBackground'),
        lightBackground: withOpacity('--lightBackground'),
        text: withOpacity('--text'),
        subText: withOpacity('--subText'),
        titlebar: withOpacity('--titlebar')
      },
      fontFamily: {
        'disket': ['Disket'],
        'inconsolata': ['Inconsolata']
      }
    },
  },
  plugins: [],
}
