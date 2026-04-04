"use client"

import { DollarSign, Users, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const financialData = {
  totalRecaudado: 1643830,
  cuotaMensual: 850,
  vecinosAlCorriente: 58,
  totalVecinos: 64,
  ultimaActualizacion: "Marzo 2026"
}

const monthlyData = [
  //{ mes: "Octubre", monto: 85200, pagos: 10 },
  { mes: "Octubre", monto: 85200},
  { mes: "Noviembre", monto: 85200},
  { mes: "Diciembre", monto: 85200},
  { mes: "Enero", monto: 85200},
  { mes: "Febrero", monto: 85200},
  { mes: "Marzo", monto: 85200},
]

export function FinancesSection() {
  const porcentajeAlCorriente = Math.round((financialData.vecinosAlCorriente / financialData.totalVecinos) * 100)
  
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
                ${financialData.totalRecaudado.toLocaleString()}
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
                ${financialData.cuotaMensual.toLocaleString()}
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
                {financialData.vecinosAlCorriente}/{financialData.totalVecinos}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div 
                  className="h-2 rounded-full bg-accent transition-all"
                  style={{ width: `${porcentajeAlCorriente}%` }}
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
              <div className="text-3xl font-bold text-accent">+8%</div>
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
              Recaudación de los últimos 6 meses • Actualizado: {financialData.ultimaActualizacion}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((item) => (
                <div key={item.mes} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-foreground">
                    {item.mes}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 rounded-lg bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary/80 rounded-lg flex items-center justify-end pr-3 transition-all"
                        style={{ width: `${(item.monto / 96000) * 100}%` }}
                      >
                        <span className="text-xs font-medium text-primary-foreground">
                          ${item.monto.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/*<div className="w-20 text-right text-sm text-muted-foreground">
                    {item.pagos} pagos
                  </div>*/}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
