module.exports = {
  /*
   ** Headers of the page
   */
  mode: 'spa',

  head: {
    title: 'ETL App',
    meta: [{
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: 'Nuxt.js project'
      }
    ],
    link: [{
      rel: 'icon',
      type: 'image/png',
      href: '/icon.png'
    }]
  },
  /*
   ** Customize the progress bar color
   */
  loading: {
    color: '#b3d4fc'
  },

  module: {
  rules: [
    {
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
          presets: ['es2015']
      }
  }
  ]
  },

  /*
   ** Build configuration
   */
  buildModules: [
    '@nuxtjs/vuetify',
    // '@nuxtjs/ngrok',
  ],

  plugins: ['~plugins/global-events-worker', '~plugins/global-functions', '~plugins/global-components'],

  build: {
    extend(config, {
      isDev,
      isClient
    }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
