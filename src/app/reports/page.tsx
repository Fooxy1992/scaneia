'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Vulnerability } from '@/lib/firebase/types';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [statistics, setStatistics] = useState({
    totalSites: 0,
    totalScans: 0,
    totalVulnerabilities: 0,
    vulnerabilitiesBySeverity: {
      Crítica: 0,
      Alta: 0,
      Média: 0,
      Baixa: 0,
    },
    vulnerabilitiesByType: {} as Record<string, number>,
    recentScans: [] as any[],
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Buscar sites do usuário
        const sitesRef = collection(db, 'sites');
        const sitesQuery = query(sitesRef, where('ownerId', '==', user.uid));
        const sitesSnapshot = await getDocs(sitesQuery);
        
        const sites: any[] = [];
        sitesSnapshot.forEach((doc) => {
          sites.push({ id: doc.id, ...doc.data() });
        });

        // Se não há sites, não precisamos continuar
        if (sites.length === 0) {
          setStatistics({
            totalSites: 0,
            totalScans: 0,
            totalVulnerabilities: 0,
            vulnerabilitiesBySeverity: {
              Crítica: 0,
              Alta: 0,
              Média: 0,
              Baixa: 0,
            },
            vulnerabilitiesByType: {},
            recentScans: [],
          });
          setLoading(false);
          return;
        }

        // Buscar todas as varreduras para esses sites
        const siteIds = sites.map(site => site.id);
        const scansRef = collection(db, 'scans');
        
        let allScans: any[] = [];
        let totalVulnerabilities = 0;
        let vulnerabilitiesBySeverity = {
          Crítica: 0,
          Alta: 0,
          Média: 0,
          Baixa: 0,
        };
        let vulnerabilitiesByType: Record<string, number> = {};

        // Buscar varreduras por site (já que 'in' tem limite de 10 valores)
        for (const siteId of siteIds) {
          const siteScansQuery = query(scansRef, where('siteId', '==', siteId));
          const siteScansSnapshot = await getDocs(siteScansQuery);
          
          siteScansSnapshot.forEach((doc) => {
            const scanData = doc.data();
            const vulnerabilities = scanData.vulnerabilities || [];
            
            totalVulnerabilities += vulnerabilities.length;
            
            // Contar por severidade e tipo
            vulnerabilities.forEach((vuln: Vulnerability) => {
              if (vuln.severity) {
                vulnerabilitiesBySeverity[vuln.severity as keyof typeof vulnerabilitiesBySeverity]++;
              }
              
              if (vuln.type) {
                vulnerabilitiesByType[vuln.type] = (vulnerabilitiesByType[vuln.type] || 0) + 1;
              }
            });
            
            // Adicionar site URL para usar nos relatórios recentes
            const site = sites.find(s => s.id === scanData.siteId);
            
            allScans.push({
              id: doc.id,
              timestamp: scanData.timestamp,
              vulnerabilitiesCount: vulnerabilities.length,
              siteUrl: site ? site.url : 'Site Desconhecido',
            });
          });
        }

        // Ordenar os scans por data (mais recentes primeiro)
        allScans.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        
        // Pegar apenas os 5 mais recentes para exibição
        const recentScans = allScans.slice(0, 5);

        setStatistics({
          totalSites: sites.length,
          totalScans: allScans.length,
          totalVulnerabilities,
          vulnerabilitiesBySeverity,
          vulnerabilitiesByType,
          recentScans,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStatistics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Relatórios & Estatísticas</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sites Monitorados</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{statistics.totalSites}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Varreduras Realizadas</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{statistics.totalScans}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vulnerabilidades Encontradas</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{statistics.totalVulnerabilities}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vulnerabilidades Críticas</p>
            <p className="mt-2 text-3xl font-semibold text-red-600 dark:text-red-400">{statistics.vulnerabilitiesBySeverity.Crítica}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vulnerabilidades por Severidade</h2>
            
            <div className="space-y-4">
              {Object.entries(statistics.vulnerabilitiesBySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{severity}</div>
                  <div className="flex-1 ml-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          severity === 'Crítica' ? 'bg-red-500' : 
                          severity === 'Alta' ? 'bg-orange-500' : 
                          severity === 'Média' ? 'bg-yellow-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ width: `${statistics.totalVulnerabilities ? (count / statistics.totalVulnerabilities) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-2 w-10 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{count}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tipos de Vulnerabilidades</h2>
            
            <div className="space-y-2">
              {Object.entries(statistics.vulnerabilitiesByType)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
            </div>
            
            {Object.keys(statistics.vulnerabilitiesByType).length > 5 && (
              <div className="mt-4 text-center">
                <Link href="/scans" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  Ver todos os tipos
                </Link>
              </div>
            )}
            
            {Object.keys(statistics.vulnerabilitiesByType).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Nenhuma vulnerabilidade encontrada ainda.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Varreduras Recentes</h2>
            <Link href="/scans" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Ver todas
            </Link>
          </div>
          
          {statistics.recentScans.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {statistics.recentScans.map((scan) => (
                <li key={scan.id} className="py-3">
                  <Link href={`/scans/${scan.id}`} className="flex justify-between hover:bg-gray-50 dark:hover:bg-gray-700 p-2 -mx-2 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{scan.siteUrl}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(scan.timestamp.toDate()).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {scan.vulnerabilitiesCount} vulnerabilidades
                      </span>
                      <svg className="ml-2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Nenhuma varredura realizada ainda.
            </p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 