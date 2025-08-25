# Gemini Refactor Runbook for Faust v3 Project

This runbook applies six quick-win best practices to your Faust v3 + Next.js project.
It is chunked into steps. Feed each step into Gemini CLI. Gemini will edit files and log to `refactor.log`.

---

## Step 1 — Enable ISR in Catch-all Route

**File:** `pages/[...wordpressNode].tsx`

**Instructions:**
- In `getStaticProps`, wrap `getWordPressProps` with ISR:
  ```ts
  export async function getStaticProps(ctx) {
    const props = await getWordPressProps({ ctx });
    return { ...props, revalidate: 120 };
  }
  ```
- Leave `getStaticPaths` unchanged.
- Append a log entry to `refactor.log`: `"Enabled ISR (revalidate:120) in catch-all route"`.

---

## Step 2 — Create Shared Layout Component

**File:** `src/components/Layout.tsx`

**Contents:**
```tsx
import Head from "next/head";
import { useQuery } from "@apollo/client";
import { SITE_DATA_QUERY } from "@/queries/SiteSettingsQuery";
import { HEADER_MENU_QUERY } from "@/queries/MenuQueries";
import Header from "@/components/header";
import Footer from "@/components/footer";

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
```

**Then update:**
- `wp-templates/page.tsx`
- `wp-templates/single.tsx`
- `wp-templates/archive.tsx`
  - Import Layout: `import Layout from "@/components/Layout";`
  - Wrap returned JSX with `<Layout title={page.title}>…</Layout>`
  - Remove `<Head>`, `<Header>`, `<Footer>` usage

**For `wp-templates/front-page.tsx`:**
- Replace WordPressTemplate delegation with a query like `page.tsx`.
- Use `__SEED_NODE__` to fetch page data, then render inside `<Layout>`.

Append log entries for each file touched.

---

## Step 3 — Standardize Fetch Policy

**Files:**  
- `wp-templates/page.tsx`  
- `wp-templates/single.tsx`  
- `wp-templates/archive.tsx`  

**Instructions:**
- In each `useQuery` / `useFaustQuery`, ensure `fetchPolicy: "cache-first"` is set.
- Do not change query variables.
- Append log entries.

---

## Step 4 — Add Tailwind Typography Plugin

**Instructions:**
1. Add `@tailwindcss/typography` to devDependencies in `package.json`.
2. In `tailwind.config.js` or `tailwind.config.mjs`, add:
   ```js
   plugins: [require("@tailwindcss/typography")]
   ```
3. In templates (`page.tsx`, `single.tsx`, `archive.tsx`), wrap WP HTML output with:
   ```tsx
   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
   ```
4. Append a log entry.

---

## Step 5 — Optional SEO Helper

**File:** `src/components/SEO.tsx`

**Contents:**
```tsx
import Head from "next/head";

type Props = { title?: string; description?: string; canonical?: string };

export default function SEO({ title, description, canonical }: Props) {
  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  );
}
```

Log entry: `"Created SEO helper component"`.

---

# Runbook Notes

- Run steps one by one in Gemini to minimize errors.
- Check `refactor.log` after each step.
- After all steps, run `npm run dev` and confirm build passes.
