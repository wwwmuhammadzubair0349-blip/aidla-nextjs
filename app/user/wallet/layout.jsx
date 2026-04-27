export const dynamic = 'force-static';

import WalletLayoutClient from './WalletLayoutClient';

export default function WalletLayout({ children }) {
  return <WalletLayoutClient>{children}</WalletLayoutClient>;
}
