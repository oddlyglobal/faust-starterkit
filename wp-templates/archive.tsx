import { gql, useQuery } from "@apollo/client";
import Head from "next/head";
import Header from "../components/header";
import EntryHeader from "../components/EntryHeader";
import Footer from "../components/footer";
import { SITE_DATA_QUERY } from "../queries/SiteSettingsQuery";
import { HEADER_MENU_QUERY } from "../queries/MenuQueries";
import { POST_LIST_FRAGMENT } from "../fragments/PostListFragment";
import PostListItem from "../components/PostListItem";
import { getNextStaticProps } from "@faustwp/core";
import { useState } from "react";
import { GetStaticPropsContext } from "next"; // Import GetStaticPropsContext

interface ArchivePageProps {
  __SEED_NODE__?: {
    uri?: string;
  };
  loading?: boolean;
}

interface Post { // Define Post interface based on PostListFragment
  id: string;
  title?: string;
  uri?: string;
  excerpt?: string;
  date?: string;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    };
  };
  author?: {
    node?: {
      name?: string;
      avatar?: {
        url?: string;
      };
    };
  };
}

// Change to how many posts you want to load at once
const BATCH_SIZE = 5;

const ARCHIVE_QUERY = gql`
  ${POST_LIST_FRAGMENT}
  query GetArchive($uri: String!, $first: Int!, $after: String) {
    nodeByUri(uri: $uri) {
      archiveType: __typename
      ... on Category {
        name
        posts(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            ...PostListFragment
          }
        }
      }
      ... on Tag {
        name
        posts(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            ...PostListFragment
          }
        }
      }
    }
  }
`;

// Combine all queries into a single query for ArchivePage.query
ArchivePage.query = gql`
  ${ARCHIVE_QUERY}
  ${SITE_DATA_QUERY}
  ${HEADER_MENU_QUERY}
`;

export default function ArchivePage(props: ArchivePageProps) {
  const currentUri = props.__SEED_NODE__?.uri;
  const {
    data,
    loading = true,
    error,
    fetchMore,
  } = useQuery(ARCHIVE_QUERY, {
    variables: { first: BATCH_SIZE, after: null, uri: currentUri },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const siteDataQuery = useQuery(SITE_DATA_QUERY) || {};
  const headerMenuDataQuery = useQuery(HEADER_MENU_QUERY) || {};

  if (loading && !data)
    return (
      <div className="max-w-6xl mx-auto px-4 flex justify-center py-20">Loading...</div>
    );

  if (error) return <p>Error! {error.message}</p>;

  if (!data?.nodeByUri?.posts?.nodes.length) {
    return <p>No posts have been published</p>;
  }

  const siteData = siteDataQuery?.data?.generalSettings || {};
  const menuItems = headerMenuDataQuery?.data?.primaryMenuItems?.nodes || {
    nodes: [],
  };
  const { title: siteTitle, description: siteDescription } = siteData;
  const { archiveType, name, posts } = data?.nodeByUri || {};

  const loadMorePosts = async () => {
    await fetchMore({
      variables: {
        first: BATCH_SIZE,
        after: posts.pageInfo.endCursor,
        uri: currentUri
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prevResult;

        return {
          nodeByUri: {
            ...fetchMoreResult.nodeByUri,
            posts: {
              ...fetchMoreResult.nodeByUri.posts,
              nodes: [
                ...prevResult.nodeByUri.posts.nodes,
                ...fetchMoreResult.nodeByUri.posts.nodes,
              ],
            },
          },
        };
      },
    });
  };

  return (
    <>
      <Head>
        <title>{`${archiveType}: ${name} - ${siteTitle}`}</title>
      </Head>

      <Header
        siteTitle={siteTitle}
        siteDescription={siteDescription}
        menuItems={menuItems}
      />

      <main className="max-w-6xl mx-auto px-4">
        <EntryHeader title={`Archive for ${archiveType}: ${name}`} />

        <div className="space-y-12">
          {posts && posts.nodes && posts.nodes.length > 0 ? (
            posts.nodes.map((post: Post) => (
              <PostListItem key={post.id} post={post} />
            ))
          ) : (
            <p>No posts found.</p>
          )}
          {posts.pageInfo.hasNextPage && (
            <div className="flex justify-center mt-8">
              <LoadMoreButton onClick={loadMorePosts} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) { // Add type for context
  return getNextStaticProps(context, {
    Page: ArchivePage,
    revalidate: 60,
  });
}

const LoadMoreButton = ({ onClick }: { onClick: () => void }) => { // Add type for onClick
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    setLoading(true);
    await onClick();
    setLoading(false);
  };

  return (
    <button
      type="button"
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={handleLoadMore}
      disabled={loading}
    >
      {loading ? <>Loading...</> : <>Load more</>}
    </button>
  );
};


