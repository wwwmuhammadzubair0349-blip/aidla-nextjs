import SignupClient from "./SignupClient";

export const metadata = {
  title: "Create Account | AIDLA",
  description: "Join AIDLA for free. Create an account to start learning, earn coins, and win real prizes.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <SignupClient />;
}
