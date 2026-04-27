// Force static pre-rendering for ALL /admin/* routes.
// Cloudflare serves the pre-built HTML from CDN — the Worker never runs.
// Auth/admin check is handled client-side inside AdminLayoutClient (useAuth hook).
export const dynamic = 'force-static';

import AdminLayoutClient from './AdminLayoutClient';

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
