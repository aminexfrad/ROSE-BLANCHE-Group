"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Download, Eye, Edit, Filter, Search, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface KpiEvaluation {
  id: number;
  intern_name: string;
  evaluator_name: string;
  stage_title?: string;
  evaluation_date: string;
  total_score: number;
  interpretation_display: string;
  created_at: string;
}

interface KpiEvaluationsListProps {
  onEdit?: (evaluation: KpiEvaluation) => void;
  onView?: (evaluation: KpiEvaluation) => void;
  refreshTrigger?: number; // Add this to trigger refreshes
}

export default function KpiEvaluationsList({ onEdit, onView, refreshTrigger }: KpiEvaluationsListProps) {
  const [evaluations, setEvaluations] = useState<KpiEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [interpretationFilter, setInterpretationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<KpiEvaluation | null>(null);

  // Charger les évaluations
  useEffect(() => {
    console.log('KpiEvaluationsList useEffect triggered');
    fetchEvaluations();
  }, [refreshTrigger]); // Add refreshTrigger to dependencies

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      console.log('Chargement des évaluations KPI...');
      
      // Utiliser l'API client pour charger les évaluations
      const response = await apiClient.getKpiEvaluations();
      console.log('Évaluations KPI chargées:', response);
      console.log('Nombre d\'évaluations:', response.results?.length || 0);
      
      if (response.results && response.results.length > 0) {
        console.log('Première évaluation:', response.results[0]);
      }
      
      setEvaluations(response.results || []);
      console.log('État des évaluations mis à jour:', response.results || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des évaluations KPI:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        name: error?.name || 'Unknown error type'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les évaluations KPI. Vérifiez votre connexion et vos permissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      console.log('Chargement terminé, loading = false');
    }
  };

  // Exporter en Excel
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      console.log('Export des évaluations KPI en Excel...');
      
      // Utiliser l'API client pour l'export
      const response = await apiClient.exportKpiEvaluations();
      
      // Créer le blob et télécharger
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluations_kpi_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Succès",
        description: "Export Excel des évaluations KPI réussi",
      });
    } catch (error) {
      console.error('Erreur lors de l\'export des évaluations KPI:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export Excel des évaluations KPI",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  // Filtrer les évaluations
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.intern_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.stage_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInterpretation = interpretationFilter === 'all' || !interpretationFilter || 
                                 evaluation.interpretation_display === interpretationFilter;
    
    const matchesDate = !dateFilter || 
                       evaluation.evaluation_date.includes(dateFilter);
    
    return matchesSearch && matchesInterpretation && matchesDate;
  });

  // Obtenir la couleur du badge selon l'interprétation
  const getInterpretationColor = (interpretation: string) => {
    switch (interpretation) {
      case 'Potentiel élevé':
        return 'bg-green-100 text-green-800';
      case 'Bon potentiel':
        return 'bg-blue-100 text-blue-800';
      case 'Potentiel moyen':
        return 'bg-yellow-100 text-yellow-800';
      case 'Potentiel à renforcer':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des évaluations...</span>
      </div>
    );
  }

  // Show message if no evaluations found
  if (!loading && evaluations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Évaluations KPI des Stagiaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune évaluation KPI trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Il n'y a pas encore d'évaluations KPI dans le système.
            </p>
            <p className="text-sm text-muted-foreground">
              Les évaluations apparaîtront ici une fois qu'elles auront été créées.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Évaluations KPI des Stagiaires
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleExportExcel}
              disabled={exporting || evaluations.length === 0}
              variant="outline"
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Export...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filtres */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher par stagiaire ou stage..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interpretation-filter">Interprétation</Label>
              <Select value={interpretationFilter} onValueChange={setInterpretationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les interprétations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les interprétations</SelectItem>
                  <SelectItem value="Potentiel élevé">Potentiel élevé</SelectItem>
                  <SelectItem value="Bon potentiel">Bon potentiel</SelectItem>
                  <SelectItem value="Potentiel moyen">Potentiel moyen</SelectItem>
                  <SelectItem value="Potentiel à renforcer">Potentiel à renforcer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-filter">Date d'évaluation</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>{filteredEvaluations.length} évaluation(s) trouvée(s)</span>
          </div>
        </div>

        {/* Tableau des évaluations */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stagiaire</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Date d'évaluation</TableHead>
                <TableHead>Score Total</TableHead>
                <TableHead>Interprétation</TableHead>
                <TableHead>Évaluateur</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune évaluation trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-medium">
                      {evaluation.intern_name}
                    </TableCell>
                    <TableCell>
                      {evaluation.stage_title || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatDate(evaluation.evaluation_date)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{evaluation.total_score}/5</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getInterpretationColor(evaluation.interpretation_display)}>
                        {evaluation.interpretation_display}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {evaluation.evaluator_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEvaluation(evaluation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Détails de l'évaluation KPI</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Stagiaire</Label>
                                  <p className="text-sm text-muted-foreground">{evaluation.intern_name}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Stage</Label>
                                  <p className="text-sm text-muted-foreground">{evaluation.stage_title || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Date d'évaluation</Label>
                                  <p className="text-sm text-muted-foreground">{formatDate(evaluation.evaluation_date)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Score Total</Label>
                                  <p className="text-sm text-muted-foreground">{evaluation.total_score}/5</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Interprétation</Label>
                                  <Badge className={getInterpretationColor(evaluation.interpretation_display)}>
                                    {evaluation.interpretation_display}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Évaluateur</Label>
                                  <p className="text-sm text-muted-foreground">{evaluation.evaluator_name}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {/* Edit button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit?.(evaluation)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
