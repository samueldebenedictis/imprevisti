import path from "node:path";
import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["./**/*.stories.@(js|jsx|ts|tsx)", "./**/stories.@(js|jsx|ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  staticDirs: ["../public"],
  features: {
    backgroundsStoryGlobals: false,
  },
  webpackFinal: async (config) => {
    config.module ??= { rules: [] };
    config.module.rules ??= [];
    // Replace existing CSS rule with PostCSS-aware version (needed for Tailwind v4)
    config.module.rules = config.module.rules.map((rule) => {
      if (
        rule &&
        typeof rule === "object" &&
        rule.test instanceof RegExp &&
        rule.test.toString() === "/\\.css$/"
      ) {
        return {
          test: /\.css$/,
          use: [
            require.resolve("style-loader"),
            require.resolve("css-loader"),
            {
              loader: require.resolve("postcss-loader"),
              options: {
                postcssOptions: {
                  config: path.resolve(__dirname, "../postcss.config.mjs"),
                },
              },
            },
          ],
        };
      }
      return rule;
    });
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve("swc-loader"),
          options: {
            jsc: {
              parser: { syntax: "typescript", tsx: true },
              transform: { react: { runtime: "automatic" } },
            },
          },
        },
      ],
    });
    config.resolve ??= {};
    config.resolve.extensions = [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ...(config.resolve.extensions ?? []),
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
      "next/font/google": path.resolve(__dirname, "./next-font-mock.js"),
      "next/font/local": path.resolve(__dirname, "./next-font-mock.js"),
    };
    return config;
  },
};
export default config;
