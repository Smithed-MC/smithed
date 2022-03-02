module: {
    rules: [
      {
        test: /\.s?css$/,
          use: [
            ...
            'postcss-loader',

        ]
      }
    ]
  }