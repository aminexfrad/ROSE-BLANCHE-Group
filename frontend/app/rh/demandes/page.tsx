/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, Application } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  X as XCloseIcon,
  Clock,
  Download,
  Building,
  Calendar,
  User,
  AlertCircle,
  Briefcase,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FaFilePdf, FaFileAlt, FaFileImage } from "react-icons/fa";
import { useToast } from '@/components/ui/use-toast'
import { ScheduleInterviewModal } from '@/components/schedule-interview-modal'

// FilePreviewCard component for document display
function FilePreviewCard({ label, url }: { label: string; url?: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isPDF = url && url.toLowerCase().endsWith(".pdf");
  const isImage = url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  // Handle preview generation
  const generatePreview = async () => {
    if (!url) return;
    
    try {
      setLoading(true);
      setError(false);
      
      // For PDFs and images, we'll use the direct URL
      if (isPDF || isImage) {
        setPreviewUrl(url);
        return;
      }
      
      // For other file types, we'll show a placeholder
      setPreviewUrl(null);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Generate preview when component mounts or URL changes
  useEffect(() => {
    generatePreview();
  }, [url]);

  // Handle iframe load events
  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  // Check if URL is valid
  const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'));

  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-4 mb-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isPDF ? 'bg-red-100' : isImage ? 'bg-green-100' : 'bg-blue-100'}`}>
            {isPDF ? <FaFilePdf className="text-red-600 h-5 w-5" /> : 
             isImage ? <FaFileImage className="text-green-600 h-5 w-5" /> : 
             <FaFileAlt className="text-red-600 h-5 w-5" />}
          </div>
          <div>
            <h4 className="font-semibold text-red-900">{label}</h4>
            <p className="text-sm text-red-600">
              {isPDF ? 'Document PDF' : isImage ? 'Image' : 'Document'}
            </p>
          </div>
        </div>
        {url && (
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white border-0 transition-all duration-200 hover:scale-105"
            onClick={() => window.open(url, '_blank')}
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        )}
      </div>
      
      {/* File Preview Section */}
      {url && isValidUrl ? (
        <div className="relative bg-white rounded-lg overflow-hidden min-h-[200px] border border-red-100">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="text-sm text-red-600">Chargement...</span>
              </div>
            </div>
          )}
          
          {!loading && !error && previewUrl && (
            <>
              {isPDF ? (
                <div className="relative">
                  <iframe
                    src={previewUrl}
                    width="100%"
                    height="300px"
                    title={`${label} Preview`}
                    className="rounded-lg"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              ) : isImage ? (
                <div className="p-4">
                  <img
                    src={previewUrl}
                    alt={label}
                    className="max-w-full h-auto rounded-lg shadow-sm"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                  />
                </div>
              ) : (
                <div className="p-6 text-center">
                  <FileText className="h-16 w-16 text-red-400 mx-auto mb-3" />
                  <p className="text-red-600 text-sm mb-2">Aperçu non disponible</p>
                  <p className="text-red-500 text-xs">Cliquez sur Télécharger pour voir le fichier</p>
                </div>
              )}
            </>
          )}
          
          {error && (
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 text-sm font-medium">Erreur de prévisualisation</p>
              <p className="text-red-500 text-xs mt-1">Le fichier ne peut pas être affiché</p>
              <div className="mt-3 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 mr-2"
                  onClick={generatePreview}
                >
                  Réessayer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => window.open(url, '_blank')}
                >
                  Ouvrir dans un nouvel onglet
                </Button>

              </div>
            </div>
          )}
        </div>
      ) : url ? (
        <div className="p-6 text-center bg-red-50 rounded-lg border border-red-100">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 text-sm font-medium">URL de fichier invalide</p>
          <p className="text-red-500 text-xs mt-1">Le lien vers le fichier n'est pas valide</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => window.open(url, '_blank')}
          >
            Essayer d'ouvrir le lien
          </Button>
        </div>
      ) : (
        <div className="p-6 text-center bg-red-50 rounded-lg border border-red-100">
          <FileText className="h-12 w-12 text-red-300 mx-auto mb-2" />
          <p className="text-red-500 text-sm italic">Aucun document fourni</p>
        </div>
      )}
    </div>
  );
}

export default function RHDemandesPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [interviewModalOpen, setInterviewModalOpen] = useState(false)
  const [selectedDemandeForInterview, setSelectedDemandeForInterview] = useState<Application | null>(null)
  const { toast } = useToast();
  // Track loading state for each offer action
  const [loadingOffers, setLoadingOffers] = useState<{ [key: string]: boolean }>({});

  const breadcrumbs = [{ label: "Responsable RH", href: "/rh" }, { label: "Demandes de stage" }]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [applicationsResponse, statsResponse] = await Promise.all([
          apiClient.getApplications(),
          apiClient.getDashboardStats()
        ])
        
        setApplications(applicationsResponse.results || [])
        setStats({
          total: applicationsResponse.count || 0,
          pending: applicationsResponse.results?.filter(app => app.status === 'pending').length || 0,
          approved: applicationsResponse.results?.filter(app => app.status === 'approved').length || 0,
          rejected: applicationsResponse.results?.filter(app => app.status === 'rejected').length || 0
        })
      } catch (err: any) {
        console.error('Error fetching applications:', err)
        setError(err.message || 'Failed to load applications')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-red-100 text-red-800",
      interview_scheduled: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-red-600" />
      case "interview_scheduled":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await apiClient.approveApplication(id)
      // Refresh data
      const response = await apiClient.getApplications()
      setApplications(response.results || [])
    } catch (err: any) {
      console.error('Error approving application:', err)
      setError(err.message || 'Failed to approve application')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await apiClient.rejectApplication(id, 'Rejeté par RH')
      // Refresh data
      const response = await apiClient.getApplications()
      setApplications(response.results || [])
    } catch (err: any) {
      console.error('Error rejecting application:', err)
      setError(err.message || 'Failed to reject application')
    }
  }

  const handleShowDetails = (application: Application) => {
    setSelectedApplication(application)
    setDetailsOpen(true)
  }

  const handleDownloadDocuments = (application: Application) => {
    // Open all available documents in new tabs (including binôme)
    const files = [
      { url: application.cv, name: 'CV.pdf' },
      { url: application.lettre_motivation, name: 'LettreMotivation.pdf' },
      { url: application.demande_stage, name: 'DemandeStage.pdf' },
      { url: application.cv_binome, name: 'CV_Binome.pdf' },
      { url: application.lettre_motivation_binome, name: 'LettreMotivation_Binome.pdf' },
      { url: application.demande_stage_binome, name: 'DemandeStage_Binome.pdf' },
    ].filter(f => f.url)
    files.forEach(file => {
      window.open(file.url, '_blank')
    })
  }

  const handleApproveOffer = async (demandeId: number, offerId: number) => {
    const key = `${demandeId}-${offerId}`;
    setLoadingOffers((prev) => ({ ...prev, [key]: true }));
    try {
      await apiClient.updateDemandeOffreStatus(demandeId, offerId, 'accepted');
      const response = await apiClient.getApplications();
      setApplications(response.results || []);
      toast({ title: 'Succès', description: 'Offre acceptée et autres offres rejetées.' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Erreur lors de l\'acceptation de l\'offre', variant: 'destructive' });
    } finally {
      setLoadingOffers((prev) => ({ ...prev, [key]: false }));
    }
  }
  
  const handleRejectOffer = async (demandeId: number, offerId: number) => {
    const key = `${demandeId}-${offerId}`;
    setLoadingOffers((prev) => ({ ...prev, [key]: true }));
    try {
      await apiClient.updateDemandeOffreStatus(demandeId, offerId, 'rejected');
      const response = await apiClient.getApplications();
      setApplications(response.results || []);
      toast({ title: 'Succès', description: 'Offre rejetée.' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Erreur lors du rejet de l\'offre', variant: 'destructive' });
    } finally {
      setLoadingOffers((prev) => ({ ...prev, [key]: false }));
    }
  }

  const handleScheduleInterview = (application: Application) => {
    setSelectedDemandeForInterview(application);
    setInterviewModalOpen(true);
  }

  const handleInterviewScheduled = () => {
    // Refresh the applications list to show updated status
    const fetchData = async () => {
      try {
        const response = await apiClient.getApplications();
        setApplications(response.results || []);
      } catch (err: any) {
        console.error('Error refreshing applications:', err);
      }
    };
    fetchData();
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["rh"]} breadcrumbs={breadcrumbs}>
      {/* Interview Scheduling Modal */}
      {selectedDemandeForInterview && (
        <ScheduleInterviewModal
          isOpen={interviewModalOpen}
          onClose={() => {
            setInterviewModalOpen(false);
            setSelectedDemandeForInterview(null);
          }}
          demandeId={selectedDemandeForInterview.id}
          candidateName={`${selectedDemandeForInterview.prenom} ${selectedDemandeForInterview.nom}`}
          onSuccess={handleInterviewScheduled}
          mode="propose"
        />
      )}

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 bg-white shadow-2xl border-0">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white p-8 rounded-t-xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-3xl font-bold tracking-tight mb-2">
                    Détails de la demande
                  </DialogTitle>
                  <p className="text-red-100 text-lg font-medium">
                    Informations complètes du candidat
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {selectedApplication && (
            <div className="p-8 space-y-8">
              {/* Enhanced Status and Actions Section */}
              <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className={`px-6 py-3 rounded-full text-sm font-bold shadow-lg ${
                    selectedApplication.status === 'approved' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-400' 
                      : selectedApplication.status === 'rejected'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-400'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-2 border-yellow-400'
                  }`}>
                    {selectedApplication.status === 'approved' && <CheckCircle className="h-5 w-5 mr-2 inline" />}
                    {selectedApplication.status === 'rejected' && <AlertCircle className="h-5 w-5 mr-2 inline" />}
                    {selectedApplication.status === 'pending' && <Clock className="h-5 w-5 mr-2 inline" />}
                    {selectedApplication.status === 'approved' ? 'Approuvée' : 
                     selectedApplication.status === 'rejected' ? 'Rejetée' : 'En attente'}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">ID:</span> #{selectedApplication.id}
                  </div>
                </div>
                
                {/* Enhanced Download Button */}
                <Button
                  onClick={() => {
                    const urls = [
                      selectedApplication.cv,
                      selectedApplication.lettre_motivation,
                      selectedApplication.demande_stage,
                      selectedApplication.cv_binome,
                      selectedApplication.lettre_motivation_binome,
                      selectedApplication.demande_stage_binome,
                    ].filter(Boolean);
                    urls.forEach(url => {
                      if (url) window.open(url, '_blank');
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
                >
                  <Download className="h-6 w-6 mr-3" />
                  Télécharger tous les documents
                </Button>
              </div>

              {/* Enhanced Candidate Information Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 via-white to-red-50 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-red-600 to-red-700 text-white">
                    <CardTitle className="flex items-center gap-3 text-white text-xl">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <User className="h-6 w-6" />
                      </div>
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                      <span className="font-semibold text-gray-700">Nom complet</span>
                      <span className="text-gray-900 font-bold text-lg">{selectedApplication.prenom} {selectedApplication.nom}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                      <span className="font-semibold text-gray-700">Email</span>
                      <span className="text-red-600 font-semibold hover:text-red-700 transition-colors cursor-pointer">{selectedApplication.email}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                      <span className="font-semibold text-gray-700">Téléphone</span>
                      <span className="text-gray-900 font-medium">{selectedApplication.telephone || 'Non renseigné'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 via-white to-red-50 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-red-600 to-red-700 text-white">
                    <CardTitle className="flex items-center gap-3 text-white text-xl">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Building className="h-6 w-6" />
                      </div>
                      Informations académiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                      <span className="font-semibold text-gray-700">Institut</span>
                      <span className="text-gray-900 font-bold text-lg">{selectedApplication.institut}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                      <span className="font-semibold text-gray-700">Spécialité</span>
                      <span className="text-gray-900 font-semibold">{selectedApplication.specialite}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                      <span className="font-semibold text-gray-700">Niveau</span>
                      <span className="text-gray-900 font-semibold">{selectedApplication.niveau}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Stage Information */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 via-white to-green-50 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
                  <CardTitle className="flex items-center gap-3 text-white text-xl">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Calendar className="h-6 w-6" />
                    </div>
                    Informations du stage
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                      <span className="font-semibold text-gray-700">Type de stage</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2 text-sm font-semibold border border-green-200">
                        {selectedApplication.type_stage}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                      <span className="font-semibold text-gray-700">Période</span>
                      <div className="text-right">
                        <div className="text-gray-900 font-bold text-lg">
                          {new Date(selectedApplication.date_debut).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-gray-500 text-sm font-medium">au {new Date(selectedApplication.date_fin).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Documents Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200">
                  <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-red-900">Documents du candidat principal</h3>
                    <p className="text-red-600 text-sm">Tous les documents soumis par le candidat</p>
                  </div>
                </div>
                <FilePreviewCard label="CV" url={selectedApplication.cv} />
                <FilePreviewCard label="Lettre de motivation" url={selectedApplication.lettre_motivation} />
                <FilePreviewCard label="Demande de stage" url={selectedApplication.demande_stage} />
              </div>

              {selectedApplication.stage_binome && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200">
                    <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full"></div>
                    <div>
                      <h3 className="text-2xl font-bold text-red-900">Documents du binôme</h3>
                      <p className="text-red-600 text-sm">Documents soumis par le partenaire de stage</p>
                    </div>
                  </div>
                  <FilePreviewCard label="CV binôme" url={selectedApplication.cv_binome} />
                  <FilePreviewCard label="Lettre de motivation binôme" url={selectedApplication.lettre_motivation_binome} />
                  <FilePreviewCard label="Demande de stage binôme" url={selectedApplication.demande_stage_binome} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Demandes de stage</h1>
            <p className="text-gray-600 mt-1">Gérez les nouvelles candidatures reçues</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              <FileText className="mr-2 h-4 w-4" />
              Traitement en lot
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600">Ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-blue-600">À traiter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-green-600">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% du total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux d'acceptation</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</div>
              <p className="text-xs text-gray-600">Moyenne mensuelle</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres et recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input placeholder="Rechercher par nom, email, institut..." className="pl-10" />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer par statut
              </Button>
              <Button variant="outline">
                <Building className="mr-2 h-4 w-4" />
                Filtrer par institut
              </Button>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Filtrer par période
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table des demandes */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des demandes</CardTitle>
            <CardDescription>Gérez les candidatures reçues</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Institut</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Type de stage</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Offres sélectionnées</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {application.prenom || ''} {application.nom || ''}
                        </div>
                        <div className="text-sm text-gray-600">{application.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {application.institut || ''}
                      </div>
                    </TableCell>
                    <TableCell>{application.specialite || ''}</TableCell>
                    <TableCell>{application.type_stage || ''}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(application.date_debut).toLocaleDateString()}</div>
                        <div className="text-gray-500">au {new Date(application.date_fin).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {Array.isArray(application.offres) && application.offres.length > 0 ? (
                        <ul className="list-disc ml-4">
                          {application.offres.map((offre: any) => (
                            <li key={offre.id} className="text-xs text-gray-800 flex items-center gap-2">
                              {offre.title} <span className="text-gray-400">({offre.reference})</span>
                              {/* Status badge */}
                              <span className={
                                offre.status === 'accepted' ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded' :
                                offre.status === 'rejected' ? 'bg-red-100 text-red-700 px-2 py-0.5 rounded' :
                                'bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded'
                              }>
                                {offre.status === 'accepted' ? 'Acceptée' : offre.status === 'rejected' ? 'Rejetée' : 'En attente'}
                              </span>
                              {/* Per-offer actions */}
                              {offre.status === 'pending' && <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-0" onClick={() => handleApproveOffer(application.id, offre.id)} disabled={loadingOffers[`${application.id}-${offre.id}`]}>
                                  {loadingOffers[`${application.id}-${offre.id}`] ? '...' : 'Accepter'}
                                </Button>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white border-0" onClick={() => handleRejectOffer(application.id, offre.id)} disabled={loadingOffers[`${application.id}-${offre.id}`]}>
                                  {loadingOffers[`${application.id}-${offre.id}`] ? '...' : 'Rejeter'}
                                </Button>
                              </>}
                            </li>
                          ))}
                        </ul>
                      ) : application.pfe_reference ? (
                        <div className="text-xs text-gray-800 flex items-center gap-2">
                          <Briefcase className="h-3 w-3 text-blue-500" />
                          <span className="font-medium">PFE: {application.pfe_reference}</span>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Référence PFE
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        <Badge className={getStatusBadge(application.status)}>
                          {application.status === 'pending' ? 'En attente' :
                           application.status === 'approved' ? 'Acceptée' :
                           application.status === 'rejected' ? 'Rejetée' : application.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {application.cv && <Badge variant="outline" className="text-xs">CV</Badge>}
                        {application.lettre_motivation && <Badge variant="outline" className="text-xs">LM</Badge>}
                        {application.demande_stage && <Badge variant="outline" className="text-xs">DS</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleShowDetails(application)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>
                          {application.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleScheduleInterview(application)} className="text-blue-700 hover:text-blue-800 hover:bg-blue-50">
                                <Calendar className="mr-2 h-4 w-4" />
                                Planifier un entretien
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleApprove(application.id)} className="text-green-700 hover:text-green-800 hover:bg-green-50">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Accepter
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(application.id)} className="text-red-700 hover:text-red-800 hover:bg-red-50">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Rejeter
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleDownloadDocuments(application)} className="text-red-700 hover:text-red-800 hover:bg-red-50">
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger documents
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
