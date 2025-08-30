"use client";

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, FileText, Users } from 'lucide-react';
import KpiEvaluationForm from '@/components/kpi-evaluation-form';
import KpiEvaluationsList from '@/components/kpi-evaluations-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function KpiEvaluationsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

  const handleFormSuccess = () => {
    setShowForm(false);
    setActiveTab('list');
    // Trigger a refresh of the evaluations list instead of reloading the page
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setActiveTab('list');
  };

  const breadcrumbs = [{ label: "Évaluations KPI des Stagiaires" }];

  return (
    <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Évaluations KPI des Stagiaires</h1>
          <p className="text-muted-foreground">
            Gérez les évaluations KPI pour mesurer le potentiel à long terme des stagiaires
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle évaluation
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total évaluations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Évaluations effectuées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/5</div>
            <p className="text-xs text-muted-foreground">
              Moyenne des scores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stagiaires évalués</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Stagiaires évalués
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire d'évaluation (modal) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <KpiEvaluationForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Liste des évaluations</TabsTrigger>
          <TabsTrigger value="create">Créer une évaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <KpiEvaluationsList refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <KpiEvaluationForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </TabsContent>
      </Tabs>

      {/* Informations sur le système KPI */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">À propos du système d'évaluation KPI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Objectif</h4>
              <p className="text-sm text-muted-foreground">
                Ce système permet aux responsables RH d'évaluer le potentiel à long terme 
                des stagiaires après leur stage (PFE) en utilisant des indicateurs clés 
                de performance (KPI) standardisés.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Méthodologie</h4>
              <p className="text-sm text-muted-foreground">
                Chaque KPI est évalué sur une échelle de 0 à 5 et pondéré selon son 
                importance. Le score total détermine automatiquement la catégorie de 
                potentiel du stagiaire.
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Répartition des poids</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Taux de Satisfaction des Livrables</span>
                <span className="font-medium">25%</span>
              </div>
              <div className="flex justify-between">
                <span>Respect des Délais</span>
                <span className="font-medium">20%</span>
              </div>
              <div className="flex justify-between">
                <span>Capacité d'Apprentissage</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span>Prise d'Initiatives</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex justify-between">
                <span>Comportement Professionnel</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span>Adaptabilité</span>
                <span className="font-medium">15%</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Interprétation des scores</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="font-semibold text-green-800">4,5 - 5,0</div>
                <div className="text-green-700">Potentiel élevé</div>
              </div>
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <div className="font-semibold text-blue-800">3,5 - 4,4</div>
                <div className="text-blue-700">Bon potentiel</div>
              </div>
              <div className="text-center p-3 bg-yellow-100 rounded-lg">
                <div className="font-semibold text-yellow-800">2,5 - 3,4</div>
                <div className="text-yellow-700">Potentiel moyen</div>
              </div>
              <div className="text-center p-3 bg-red-100 rounded-lg">
                <div className="font-semibold text-red-800">&lt; 2,5</div>
                <div className="text-red-700">À renforcer</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
