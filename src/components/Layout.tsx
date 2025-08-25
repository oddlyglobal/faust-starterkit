import Head from "next/head";
import { useQuery } from "@apollo/client";
import { SITE_DATA_QUERY } from "../../queries/SiteSettingsQuery";
import { HEADER_MENU_QUERY } from "../../queries/MenuQueries";
import Header from "../../components/header";
import Footer from "../../components/footer";

type Props = { title?: string; children: React.ReactNode };

export default function Layout({ title, children }: Props) {
  const { data: site } = useQuery(SITE_DATA_QUERY, { fetchPolicy: "cache-first" });
  const { data: menu } = useQuery(HEADER_MENU_QUERY, { fetchPolicy: "cache-first" });

  const siteTitle = site?.generalSettings?.title ?? "";
  const siteDescription = site?.generalSettings?.description ?? "";
  const menuItems = menu?.primaryMenuItems?.nodes ?? [];

  return (
    <>
      <Head>
        <title>{title ? `${title} - ${siteTitle}` : siteTitle}</title>
      </Head>
      <Header siteTitle={siteTitle} siteDescription={siteDescription} menuItems={menuItems} />
      {children}
      <Footer />
    </>
  );
}
