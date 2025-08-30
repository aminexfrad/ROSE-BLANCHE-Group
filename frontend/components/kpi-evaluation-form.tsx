"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface Stagiaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  specialite?: string;
  institut?: string;
}



interface KpiEvaluationFormData {
  intern_id: number;
  evaluation_date: string;
  delivery_satisfaction_rate: number;
  deadline_respect_rate: number;
  learning_capacity: number;
  initiative_taking: number;
  professional_behavior: number;
  adaptability: number;
  comments: string;
}

interface KpiEvaluationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const KPI_WEIGHTS = {
  delivery_satisfaction_rate: 0.25,  // 25%
  deadline_respect_rate: 0.20,        // 20%
  learning_capacity: 0.15,            // 15%
  initiative_taking: 0.10,            // 10%
  professional_behavior: 0.15,        // 15%
  adaptability: 0.15                  // 15%
};

const KPI_LABELS = {
  delivery_satisfaction_rate: 'Taux de Satisfaction des Livrables',
  deadline_respect_rate: 'Respect des Délais',
  learning_capacity: 'Capacité d\'Apprentissage',
  initiative_taking: 'Prise d\'Initiatives',
  professional_behavior: 'Comportement en Entreprise et Conduite',
  adaptability: 'Adaptabilité au Changement'
};

const KPI_DESCRIPTIONS = {
  delivery_satisfaction_rate: '% des livrables validés sans corrections majeures',
  deadline_respect_rate: '% des tâches terminées dans les délais prévus',
  learning_capacity: 'Temps nécessaire pour maîtriser de nouvelles compétences ou outils',
  initiative_taking: 'Nombre d\'initiatives ou propositions d\'amélioration soumises',
  professional_behavior: 'Respect des normes professionnelles, éthique, communication',
  adaptability: 'Capacité à s\'adapter aux changements de tâches ou de priorités'
};

export default function KpiEvaluationForm({ onSuccess, onCancel }: KpiEvaluationFormProps) {
  const [formData, setFormData] = useState<KpiEvaluationFormData>({
    intern_id: 0,
    evaluation_date: new Date().toISOString().split('T')[0],
    delivery_satisfaction_rate: 0,
    deadline_respect_rate: 0,
    learning_capacity: 0,
    initiative_taking: 0,
    professional_behavior: 0,
    adaptability: 0,
    comments: ''
  });

  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Calculer le score total pondéré
  const calculateTotalScore = () => {
    const total = Object.entries(KPI_WEIGHTS).reduce((sum, [key, weight]) => {
      const score = formData[key as keyof typeof KPI_WEIGHTS] || 0;
      return sum + (score * weight);
    }, 0);
    return Math.round(total * 100) / 100;
  };

  // Déterminer l'interprétation
  const getInterpretation = (score: number) => {
    if (score >= 4.5) return { label: 'Potentiel élevé', color: 'bg-green-100 text-green-800' };
    if (score >= 3.5) return { label: 'Bon potentiel', color: 'bg-blue-100 text-blue-800' };
    if (score >= 2.5) return { label: 'Potentiel moyen', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Potentiel à renforcer', color: 'bg-red-100 text-red-800' };
  };

  const totalScore = calculateTotalScore();
  const interpretation = getInterpretation(totalScore);

  // Charger les stagiaires
  useEffect(() => {
    const fetchStagiaires = async () => {
      try {
        setLoading(true);
        console.log('Chargement des stagiaires...');
        
        // Utiliser l'API client approprié
        const response = await apiClient.getRHStagiaires();
        const stagiairesData = response.results || [];
        
        setStagiaires(stagiairesData);
        console.log('Stagiaires chargés:', stagiairesData);
        
        if (stagiairesData.length === 0) {
                      toast({
              title: "Attention",
              description: "Aucun stagiaire trouvé dans votre filiale. Vérifiez que vous avez des stagiaires assignés à votre entreprise.",
              variant: "destructive"
            });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stagiaires:', error);
                  toast({
            title: "Erreur",
            description: "Impossible de charger la liste des stagiaires. Vérifiez votre connexion et vos permissions.",
            variant: "destructive"
          });
      } finally {
        setLoading(false);
      }
    };

    fetchStagiaires();
  }, []);



  const handleInputChange = (field: keyof KpiEvaluationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSliderChange = (field: keyof KpiEvaluationFormData, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.intern_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un stagiaire",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Debug: Log the data being sent
      console.log('Submitting KPI evaluation data:', formData);
      
      // Check if intern already has an evaluation
      const existingEvaluation = await apiClient.checkExistingKpiEvaluation(formData.intern_id);
      if (existingEvaluation) {
        toast({
          title: "Évaluation existante",
          description: `Ce stagiaire a déjà une évaluation KPI. Vous pouvez la modifier au lieu d'en créer une nouvelle.`,
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }
      
      // Test if server is running first
      try {
        console.log('Testing server connectivity...');
        const testResponse = await apiClient.getKpiEvaluations();
        console.log('Server is running, KPI evaluations endpoint accessible:', testResponse);
      } catch (serverError) {
        console.error('Server connectivity test failed:', serverError);
        toast({
          title: "Erreur de connexion",
          description: "Le serveur n'est pas accessible. Vérifiez que le serveur Django est démarré.",
          variant: "destructive"
        });
        return;
      }
      
      // Test JSON parsing
      try {
        const testResponse = await apiClient.testKpiJsonParsing({ test: 'data' });
        console.log('JSON parsing test successful:', testResponse);
      } catch (testError) {
        console.error('JSON parsing test failed:', testError);
        toast({
          title: "Erreur de test",
          description: "Le test de parsing JSON a échoué. Vérifiez que le serveur fonctionne.",
          variant: "destructive"
        });
        return;
      }
      
      // Utiliser l'API client pour créer l'évaluation KPI
      await apiClient.createKpiEvaluation(formData);
      
      toast({
        title: "Succès",
        description: "Évaluation KPI créée avec succès",
      });
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      console.error('Error details:', error.message, error.response);
      
      // Handle duplicate evaluation error specifically
      if (error.message && error.message.includes('existe déjà')) {
        toast({
          title: "Évaluation existante",
          description: "Ce stagiaire a déjà une évaluation KPI. Vous pouvez la modifier au lieu d'en créer une nouvelle.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: error.message || "Erreur lors de la soumission de l'évaluation",
          variant: "destructive"
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderKpiField = (key: keyof typeof KPI_WEIGHTS) => (
    <div key={key} className="space-y-3">
      <div className="flex justify-between items-center">
        <Label htmlFor={key} className="text-sm font-medium">
          {KPI_LABELS[key]}
        </Label>
        <Badge variant="secondary" className="text-xs">
          {KPI_WEIGHTS[key] * 100}%
        </Badge>
      </div>
      
      <div className="space-y-2">
        <Slider
          id={key}
          min={0}
          max={5}
          step={0.1}
          value={[formData[key] || 0]}
          onValueChange={(value) => handleSliderChange(key, value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span className="font-medium">{formData[key] || 0}/5</span>
          <span>5</span>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {KPI_DESCRIPTIONS[key]}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des stagiaires...</span>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Évaluation KPI - Stagiaire
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Fermer</span>
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du stagiaire */}
          <div className="space-y-2">
            <Label htmlFor="intern_id">Stagiaire *</Label>
            <Select
              value={formData.intern_id.toString()}
              onValueChange={(value) => handleInputChange('intern_id', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un stagiaire" />
              </SelectTrigger>
              <SelectContent>
                {stagiaires.map((stagiaire) => (
                  <SelectItem key={stagiaire.id} value={stagiaire.id.toString()}>
                    {stagiaire.prenom} {stagiaire.nom} - {stagiaire.specialite || 'N/A'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluation_date">Date d'évaluation</Label>
            <Input
              id="evaluation_date"
              type="date"
              value={formData.evaluation_date}
              onChange={(e) => handleInputChange('evaluation_date', e.target.value)}
            />
          </div>

          {/* Score total et interprétation en temps réel */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Score Total Calculé</h4>
                <p className="text-sm text-muted-foreground">
                  Basé sur les poids définis pour chaque KPI
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{totalScore}/5</div>
                <Badge className={interpretation.color}>
                  {interpretation.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Champs KPI */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Évaluation des KPIs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderKpiField('delivery_satisfaction_rate')}
              {renderKpiField('deadline_respect_rate')}
              {renderKpiField('learning_capacity')}
              {renderKpiField('initiative_taking')}
              {renderKpiField('professional_behavior')}
              {renderKpiField('adaptability')}
            </div>
          </div>

          {/* Commentaires */}
          <div className="space-y-2">
            <Label htmlFor="comments">Commentaires additionnels</Label>
            <Textarea
              id="comments"
              placeholder="Ajoutez des commentaires ou observations sur l'évaluation..."
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              rows={4}
            />
          </div>

          {/* Informations sur les poids */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Répartition des poids :</strong> Taux de Satisfaction des Livrables (25%), 
              Respect des Délais (20%), Capacité d'Apprentissage (15%), Prise d'Initiatives (10%), 
              Comportement Professionnel (15%), Adaptabilité (15%)
            </AlertDescription>
          </Alert>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.intern_id}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer l\'évaluation'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
