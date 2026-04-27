import LoginClient from "./LoginClient";

export const metadata = {
  title: "Log In | AIDLA",
  description: "Sign in to your AIDLA account to continue learning, earning coins, and winning prizes.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginClient />;
}
