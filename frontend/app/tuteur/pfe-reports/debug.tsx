"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TuteurPFEReportsDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    const info: any = {}

    try {
      // Test 1: Vérifier le token
      const token = localStorage.getItem('token')
      info.token = token ? `${token.substring(0, 50)}...` : 'Aucun token'

      // Test 2: Test direct vers le backend
      const backendResponse = await fetch('http://localhost:8000/api/pfe-reports/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      info.backendStatus = backendResponse.status
      info.backendData = await backendResponse.text()

      // Test 3: Test via proxy Next.js
      const proxyResponse = await fetch('/api/pfe-reports/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      info.proxyStatus = proxyResponse.status
      info.proxyData = await proxyResponse.text()

      // Test 4: Test sans authentification
      const noAuthResponse = await fetch('http://localhost:8000/api/pfe-reports/')
      info.noAuthStatus = noAuthResponse.status

    } catch (error: any) {
      info.error = error.message
    }

    setDebugInfo(info)
    setLoading(false)
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Tuteur PFE Reports API</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testAPI} disabled={loading}>
            {loading ? 'Test en cours...' : 'Tester API'}
          </Button>
          
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-semibold">Token:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                {debugInfo.token || 'Non testé'}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold">Backend Direct (8000):</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                Status: {debugInfo.backendStatus || 'Non testé'}
                Data: {debugInfo.backendData || 'Non testé'}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold">Proxy Next.js (3000):</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                Status: {debugInfo.proxyStatus || 'Non testé'}
                Data: {debugInfo.proxyData || 'Non testé'}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold">Sans Auth:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                Status: {debugInfo.noAuthStatus || 'Non testé'}
              </pre>
            </div>
            
            {debugInfo.error && (
              <div>
                <h3 className="font-semibold text-red-600">Erreur:</h3>
                <pre className="bg-red-100 p-2 rounded text-sm text-red-600">
                  {debugInfo.error}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 