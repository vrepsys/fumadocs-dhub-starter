import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';

// Components registered here are available in every MDX file without imports.
// Dhub relies on Tabs/Tab, Accordions/Accordion and Steps/Step being global.
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    Accordion,
    Accordions,
    Step,
    Steps,
    img: (props) => <ImageZoom {...(props as any)} />,
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;
