import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AnnouncementsSection } from "@/components/announcements-section"
import { FinancesSection } from "@/components/finances-section"
import { ProjectsSection } from "@/components/projects-section"
import { DocumentsSection } from "@/components/documents-section"
import { BoardSection } from "@/components/board-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div id="inicio">
        <HeroSection />
      </div>
      <AnnouncementsSection />
      <FinancesSection />
      <ProjectsSection />
      <DocumentsSection />
      <div id="directiva">
        <BoardSection />
      </div>
      <Footer />
    </main>
  )
}
