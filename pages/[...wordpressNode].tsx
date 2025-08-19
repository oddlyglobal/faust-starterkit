import { getWordPressProps, WordPressTemplate } from "@faustwp/core";
import { GetStaticPropsContext } from "next"; // Import GetStaticPropsContext

interface WordPressTemplateProps {
  __TEMPLATE_SLUG__?: string;
  __SEED_NODE__?: any; // This can be more specific if needed
  loading?: boolean;
}

export default function Page(props: WordPressTemplateProps) {
  return <WordPressTemplate {...props} />;
}

export function getStaticProps(ctx: GetStaticPropsContext) { // Add type for ctx
  return getWordPressProps({ ctx });
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
