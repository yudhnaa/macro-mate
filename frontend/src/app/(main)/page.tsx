import { COLORS } from "@/app/utils/constants";
import Hero from "../components/layout/Hero";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32" style={{ backgroundColor: COLORS.background.gray }}>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <h2
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                style={{ color: COLORS.text.primary }}
              >
                Create your meal plan right here in seconds
              </h2>
              <p
                className="text-lg md:text-xl"
                style={{ color: COLORS.text.secondary }}
              >
                Answer a few questions and we&apos;ll generate a personalized meal plan just for you
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
