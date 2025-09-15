import LoginForm from "./LoginForm";
import LoginHero from "./LoginHero";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <LoginForm />
      <LoginHero />
    </div>
  );
}
