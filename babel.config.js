module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ["module-resolver", {
      "root": ["./src"],
      "extensions": [
        '.ios.ts',
        '.android.ts',
        '.ts',
        '.ios.tsx',
        '.android.tsx',
        '.tsx',
        '.jsx',
        '.js',
        '.json',
      ],
      "alias": {
        "tools": "./src/tools",
        "hooks": "./src/hooks",
        "properties": "./src/properties",
        "contexts": "./src/contexts",
        "sensors": "./src/sensors",
        "types": "./src/types",
        "components": "./src/components"
      }
    }],
    'react-native-reanimated/plugin'
  ]
};
