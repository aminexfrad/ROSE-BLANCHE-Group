/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react"

interface KPIData {
  label: string
  value: number
  target: number
  trend: "up" | "down" | "stable"
  color: string
}

interface KPIChartProps {
  title: string
  description?: string
  data: KPIData[]
  isLoading?: boolean
}

export function KPIChart({ title, description, data, isLoading = false }: KPIChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Chargement des KPI...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-red-600" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Aucune donnée KPI disponible</p>
            <p className="text-sm text-gray-500 mt-2">Les données seront chargées depuis l'API</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {item.value}% / {item.target}%
                    </span>
                    {item.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {item.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${item.color}`}
                    style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
