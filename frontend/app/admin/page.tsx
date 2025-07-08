"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, User } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  Settings,
  AlertTriangle,
  Database,
  Shield,
  Monitor,
  BarChart3,
  BookOpen,
  Cog,
} from "lucide-react"

interface DashboardStats {
  total_users: number;
  total_applications: number;
  total_stages: number;
  recent_applications: number;
  active_stages: number;
  completed_stages: number;
  avg_progression: number;
  current_progression: number;
  status_stats: Array<{ status: string; count: number }>;
  role_stats: Array<{ role: string; count: number }>;
}

interface RecentUser extends User {
  // Extends the User interface which already has the correct field names
}

const quickActions = [
  {
    title: "User Management",
    description: "Manage users and permissions",
    icon: Users,
    href: "/admin/utilisateurs",
    color: "bg-blue-500",
  },
  {
    title: "System Monitoring",
    description: "Monitor system performance",
    icon: Monitor,
    href: "/admin/monitoring",
    color: "bg-green-500",
  },
  {
    title: "Database Management",
    description: "Manage database and backups",
    icon: Database,
    href: "/admin/database",
    color: "bg-purple-500",
  },
  {
    title: "Security Settings",
    description: "Configure security settings",
    icon: Shield,
    href: "/admin/security",
    color: "bg-red-500",
  },
  {
    title: "Analytics",
    description: "View system analytics",
    icon: BarChart3,
    href: "/admin/statistiques",
    color: "bg-orange-500",
  },
  {
    title: "PFE Book",
    description: "Manage PFE documents",
    icon: BookOpen,
    href: "/admin/pfe-book",
    color: "bg-indigo-500",
  },
  {
    title: "Offres de Stage",
    description: "Manage internship offers",
    icon: FileText,
    href: "/admin/offres-stage",
    color: "bg-emerald-500",
  },
]

const systemActions = [
  {
    title: "System Configuration",
    description: "Configure system settings",
    icon: Cog,
    href: "/admin/configuration",
    color: "bg-gray-500",
  },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const breadcrumbs = [{ label: "Administration" }]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsResponse, usersResponse] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getUsers({ limit: 5 }),
        ])

        setStats({
          total_users: statsResponse.stats.total_users ?? 0,
          total_applications: statsResponse.stats.total_applications ?? 0,
          total_stages: statsResponse.stats.total_stages ?? 0,
          recent_applications: statsResponse.stats.recent_applications ?? 0,
          active_stages: statsResponse.stats.active_stages ?? 0,
          completed_stages: statsResponse.stats.completed_stages ?? 0,
          avg_progression: statsResponse.stats.avg_progression ?? 0,
          current_progression: statsResponse.stats.current_progression ?? 0,
          status_stats: statsResponse.stats.status_stats ?? [],
          role_stats: statsResponse.stats.role_stats ?? [],
        });
        setRecentUsers(usersResponse.results || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'rh':
        return 'bg-blue-100 text-blue-800';
      case 'tuteur':
        return 'bg-green-100 text-green-800';
      case 'stagiaire':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout allowedRoles={["admin"]} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.prenom || ''}!</h1>
            <p className="text-gray-600">Here's your system overview</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Activity className="mr-2 h-4 w-4" />
              System Status
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_applications}</div>
                <p className="text-xs text-muted-foreground">
                  Internship applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_stages}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                <Progress className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avg_progression}%</div>
                <p className="text-xs text-muted-foreground">
                  Overall completion
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users
              </CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users</h3>
                  <p className="text-gray-600">No users found at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {(user.prenom?.charAt(0) || '')}{(user.nom?.charAt(0) || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {user.prenom || ''} {user.nom || ''}
                          </h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(user.date_joined).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>Current system health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Services</span>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">File Storage</span>
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Service</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access frequently used administrative functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow"
                  onClick={() => window.location.href = action.href}
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Actions */}
        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>Advanced system configuration and maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow"
                  onClick={() => window.location.href = action.href}
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
