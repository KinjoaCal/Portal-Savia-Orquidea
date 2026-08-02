"use client"

import { useEffect, useState } from "react"
import { DollarSign, Users, TrendingUp, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MonthlyItem {
  mes: string
  monto: number
}

interface FinancialData {
  totalRecaudado: number
  cuotaMensual: number
  vecinosAlCorriente: number
  totalVecinos: number
  tendencia: string
  ultimaActualizacion: string
  monthlyData: MonthlyItem[]
}

const defaultFinancialData: FinancialData = {
  totalRecaudado: 1643830,
  cuotaMensual: 850,
  vecinosAlCorriente: 58,
  totalVecinos: 64,
  tendencia: "+8%",
  ultimaActualizacion: "Marzo 2026",
  monthlyData: [
    { mes: "Octubre", monto: 85200 },
    { mes: "Noviembre", monto: 85200 },
    { mes: "Diciembre", monto: 85200 },
    { mes: "Enero", monto: 85200 },
    { mes: "Febrero", monto: 85200 },
    { mes: "Marzo", monto: 85200 },
  ],
}

export function FinancesSection() {
  const [finances, setFinances] = useState<FinancialData>(defaultFinancialData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFinances() {
      try {
        const { data, error } = await supabase
          .from("finanzas")
          .select("*")
          .eq("id", "general")
          .single()

        if (data) {
          setFinances({
            totalRecaudado: Number(data.total_recaudado ?? 1643830),
            cuotaMensual: Number(data.cuota_mensual ?? 850),
            vecinosAlCorriente: Number(data.vecinos_al_corriente ?? 58),
            totalVecinos: Number(data.total_vecinos ?? 64),
            tendencia: data.tendencia || "+8%",
            ultimaActualizacion: data.ultima_actualizacion || "Marzo 2026",
            monthlyData: data.monthly_data && data.monthly_data.length > 0 ? data.monthly_data : defaultFinancialData.monthlyData,
          })
        }
      } catch (err) {
        console.warn("Usando finanzas iniciales:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFinances()
  }, [])

  const porcentajeAlCorriente = finances.totalVecinos > 0 
    ? Math.round((finances.vecinosAlCorriente / finances.totalVecinos) * 100)
    : 0

  // Calculate max monthly amount for percentage bars
  const maxMonto = finances.monthlyData.reduce((max, item) => Math.max(max, item.monto), 1)

  return (
    <section id="finanzas" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
            Transparencia Financiera
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Estado de Cuotas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Consulta el estado actual de las cuotas recaudadas y el avance financiero de nuestra comunidad.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Recaudado
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${finances.totalRecaudado.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acumulado este periodo
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cuota Mensual
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${finances.cuotaMensual.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Por vivienda
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vecinos al Corriente
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {finances.vecinosAlCorriente}/{finances.totalVecinos}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div 
                  className="h-2 rounded-full bg-accent transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, porcentajeAlCorriente))}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {porcentajeAlCorriente}% de cumplimiento
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tendencia
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{finances.tendencia}</div>
              <p className="text-xs text-muted-foreground mt-1">
                vs. mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Desglose Mensual</CardTitle>
            <CardDescription>
              Recaudación del periodo • Actualizado: {finances.ultimaActualizacion}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {finances.monthlyData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-28 text-sm font-medium text-foreground">
                    {item.mes}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 rounded-lg bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary/80 rounded-lg flex items-center justify-end pr-3 transition-all"
                        style={{ width: `${Math.min(100, Math.max(8, (item.monto / maxMonto) * 100))}%` }}
                      >
                        <span className="text-xs font-medium text-primary-foreground">
                          ${item.monto.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {finances.monthlyData.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  No hay desglose mensual registrado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
