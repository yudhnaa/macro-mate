import LoginForm from "@/app/components/layout/LoginForm";
import { COLORS } from "@/app/utils/constants";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans"
      style={{ backgroundColor: COLORS.background.gray }}
    >
      <LoginForm />
    </div>
  );
}
