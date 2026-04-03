import Image from "next/image"

export function HeroSection() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Savia Orquidea.jpg"
          alt="Vista de la entrada del condominio"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-card/80">
          Bienvenido a
        </p>
        <h1 className="text-balance text-5xl font-bold tracking-tight text-card sm:text-7xl lg:text-8xl">
          Condominio<br />Savia Orquidea
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-card/90">
          Portal de transparencia para vecinos.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#finanzas"
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
          >
            Ver Estado Financiero
          </a>
          <a
            href="#directiva"
            className="rounded-full border border-card/30 bg-card/10 px-8 py-3 text-sm font-semibold text-card backdrop-blur-sm transition-all hover:bg-card/20"
          >
            Conocer la Mesa Directiva
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-card/50 p-1.5">
          <div className="h-2 w-1 rounded-full bg-card/70" />
        </div>
      </div>
    </section>
  )
}
