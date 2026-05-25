import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata = {
  title: "Reset Your Password — AIDLA",
  description: "Reset your AIDLA account password securely.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div style={{ width: '100vw', height: '100dvh', background: '#f4f7fb' }}></div>}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
