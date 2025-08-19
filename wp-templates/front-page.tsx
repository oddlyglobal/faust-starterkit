import { getWordPressProps, WordPressTemplate } from "@faustwp/core";
import { GetStaticPropsContext } from "next";

export default function FrontPage(props: any) {
  return <WordPressTemplate {...props} />;
}

export async function getStaticProps(ctx: GetStaticPropsContext) {
  return getWordPressProps({ ctx });
}