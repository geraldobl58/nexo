import { setProjectAnnotations } from "@storybook/nextjs-vite";
import * as projectAnnotations from "./preview";

// Aplica as anotações do projeto (decorators, parameters, etc.) para todos os testes
// https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([projectAnnotations]);
