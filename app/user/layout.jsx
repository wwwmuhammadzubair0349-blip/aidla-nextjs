// Force static pre-rendering for ALL /user/* routes.
// Cloudflare serves the pre-built HTML from CDN — the Worker never runs.
// Auth is handled client-side inside UserLayoutClient (useAuth hook).
export const dynamic = 'force-static';

import UserLayoutClient from './UserLayoutClient';

export default function UserLayout({ children }) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
