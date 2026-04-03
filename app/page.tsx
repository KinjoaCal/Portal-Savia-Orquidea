import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FinancesSection } from "@/components/finances-section"
import { ProjectsSection } from "@/components/projects-section"
import { BoardSection } from "@/components/board-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FinancesSection />
      <ProjectsSection />
      <BoardSection />
      <Footer />
    </main>
  )
}
