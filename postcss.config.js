module.exports = {
  plugins: [
    require('autoprefixer')({
      // A global audience, not one country's market share. The previous
      // "> 0.5% in US" understated the browsers that matter outside it.
      overrideBrowserslist: ['> 0.5%', 'last 2 versions', 'not dead']
    })
  ]
}
