import { gql } from "@apollo/client";
import Head from "next/head";
import EntryHeader from "../components/EntryHeader";
import Footer from "../components/footer";
import Header from "../components/header";
import { SITE_DATA_QUERY } from "../queries/SiteSettingsQuery";
import { HEADER_MENU_QUERY } from "../queries/MenuQueries";
import { useFaustQuery } from "@faustwp/core";
import { GetStaticPropsContext } from "next"; // Import GetStaticPropsContext

interface MenuItem {
  id: string;
  uri: string;
  label: string;
}

const POST_QUERY = gql`
  query GetPost($databaseId: ID!, $asPreview: Boolean = false) {
    post(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      title
      content
      date
      author {
        node {
          name
        }
      }
    }
  }
`;

interface PostData {
  post?: {
    title?: string;
    content?: string;
    date?: string;
    author?: {
      node?: {
        name?: string;
      };
    };
  };
}

interface SinglePageProps {
  loading?: boolean;
  __SEED_NODE__?: {
    databaseId?: string;
    asPreview?: boolean;
  };
}

interface SiteData {
  generalSettings?: {
    title?: string;
    description?: string;
  };
}

interface HeaderMenuData {
  primaryMenuItems?: {
    nodes?: Array<{
      id: string;
      uri: string;
      label: string;
      // Add other properties if needed
    }>;
  };
}

export default function Component(props: SinglePageProps) {
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }

  const contentQuery: PostData = useFaustQuery(POST_QUERY) || {}; // Explicitly type
  const siteDataQuery: SiteData = useFaustQuery(SITE_DATA_QUERY) || {};
  const headerMenuDataQuery: HeaderMenuData = useFaustQuery(HEADER_MENU_QUERY) || {};

  const siteData = siteDataQuery?.generalSettings || {};
  const menuItems: MenuItem[] | undefined = headerMenuDataQuery?.primaryMenuItems?.nodes;
  const { title: siteTitle, description: siteDescription } = siteData;
  const { title, content, date, author } = contentQuery?.post || {};

  return (
    <>
      <Head>
        <title>{`${title} - ${siteTitle}`}</title>
      </Head>

      <Header
        siteTitle={siteTitle}
        siteDescription={siteDescription}
        menuItems={menuItems}
      />

      <main className="max-w-6xl mx-auto px-4">
        <EntryHeader title={title} date={date} author={author?.node?.name} />
        <div dangerouslySetInnerHTML={{ __html: content || '' }} />
      </main>

      <Footer />
    </>
  );
}

Component.queries = [
  {
    query: POST_QUERY,
    variables: ({ databaseId }: { databaseId: string }, ctx: GetStaticPropsContext) => ({ // Add types for databaseId and ctx
      databaseId,
      asPreview: ctx?.preview,
    }),
  },
  {
    query: SITE_DATA_QUERY,
  },
  {
    query: HEADER_MENU_QUERY,
  },
];
