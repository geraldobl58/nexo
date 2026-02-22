import type { Preview } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import React from "react";

import "../src/app/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story): ReactNode => {
      return React.createElement(Story);
    },
  ],
};

export default preview;
