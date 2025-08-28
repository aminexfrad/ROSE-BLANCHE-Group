"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, TrendingDown, BarChart3, Users, Target, Award } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface KpiStatistics {
  total_evaluations: number;
  average_score: number;
  interpretation_distribution: Record<string, number>;
  recent_evaluations: number;
  top_scores: Array<{
    intern__nom: string;
    intern__prenom: string;
    total_score: number;
    interpretation: string;
  }>;
}

interface KpiStatisticsProps {
  className?: string;
}

export default function KpiStatistics({ className }: KpiStatisticsProps) {
  const [statistics, setStatistics] = useState<KpiStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rh/kpi-evaluations/statistics/?days=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInterpretationColor = (interpretation: string) => {
    switch (interpretation) {
      case 'elevé':
        return 'bg-green-100 text-green-800';
      case 'bon':
        return 'bg-blue-100 text-blue-800';
      case 'moyen':
        return 'bg-yellow-100 text-yellow-800';
      case 'à renforcer':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterpretationDisplay = (interpretation: string) => {
    switch (interpretation) {
      case 'elevé':
        return 'Potentiel élevé';
      case 'bon':
        return 'Bon potentiel';
      case 'moyen':
        return 'Potentiel moyen';
      case 'à renforcer':
        return 'Potentiel à renforcer';
      default:
        return interpretation;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des statistiques...</span>
      </div>
    );
  }

  if (!statistics) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          Aucune donnée disponible
        </CardContent>
      </Card>
    );
  }

  const totalEvaluations = statistics.total_evaluations;
  const averageScore = statistics.average_score;
  const interpretationDistribution = statistics.interpretation_distribution;

  return (
    <div className={className}>
      {/* Sélecteur de période */}
      <div className="mb-6 flex items-center gap-4">
        <h3 className="text-lg font-semibold">Statistiques des évaluations KPI</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 jours</SelectItem>
            <SelectItem value="30">30 jours</SelectItem>
            <SelectItem value="90">90 jours</SelectItem>
            <SelectItem value="365">1 an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total évaluations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              Évaluations effectuées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}/5</div>
            <p className="text-xs text-muted-foreground">
              Moyenne des scores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Évaluations récentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.recent_evaluations}</div>
            <p className="text-xs text-muted-foreground">
              Derniers {timeRange} jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de participation</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEvaluations > 0 ? Math.round((statistics.recent_evaluations / totalEvaluations) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Participation récente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution des interprétations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Distribution des potentiels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(interpretationDistribution).map(([interpretation, count]) => (
                <div key={interpretation} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getInterpretationColor(interpretation)}>
                      {getInterpretationDisplay(interpretation)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {count} stagiaire(s)
                    </span>
                  </div>
                  <div className="text-sm font-medium">
                    {totalEvaluations > 0 ? Math.round((count / totalEvaluations) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 5 des meilleurs scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.top_scores.length > 0 ? (
                statistics.top_scores.map((score, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          {score.intern__prenom} {score.intern__nom}
                        </div>
                        <Badge className={getInterpretationColor(score.interpretation)}>
                          {getInterpretationDisplay(score.interpretation)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {score.total_score}/5
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Aucune évaluation disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique de tendance (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des scores moyens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
            Graphique d'évolution des scores (à implémenter)
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={fetchStatistics}>
          Actualiser les statistiques
        </Button>
        <Button variant="outline">
          Exporter le rapport
        </Button>
      </div>
    </div>
  );
}
