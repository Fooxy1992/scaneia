'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getScan } from '@/lib/firebase/firestore';
import { getSite } from '@/lib/firebase/firestore';
import { Scan, Site, Vulnerability } from '@/lib/firebase/types';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

export default function ScanDetailPage() {
  const [scan, setScan] = useState<Scan | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  useEffect(() => {
    const fetchScanData = async () => {
      try {
        const scanData = await getScan(scanId);
        if (!scanData) {
          router.push('/scans');
          return;
        }
        
        setScan(scanData);
        
        // Buscar dados do site associado
        const siteData = await getSite(scanData.siteId);
        setSite(siteData);
      } catch (error) {
        console.error('Erro ao carregar dados da varredura:', error);
      } finally {
        setLoading(false);
      }
    };

    if (scanId) {
      fetchScanData();
    }
  }, [scanId, router]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Crítica':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Alta':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Baixa':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Varredura não encontrada</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            A varredura que você está procurando não existe ou foi removida.
          </p>
          <Link href="/scans" className="btn btn-primary">
            Voltar para Varreduras
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            {site && (
              <Link href={`/sites/${site.id}`} className="text-primary-600 dark:text-primary-400 hover:underline mb-2 inline-block">
                &larr; Voltar para {site.url}
              </Link>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatório de Varredura</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {site?.url} - {new Date(scan.timestamp.toDate()).toLocaleString('pt-BR')}
            </p>
          </div>
          <Link href={`/scans/new?siteId=${scan.siteId}`} className="btn btn-primary">
            Nova Varredura
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sumário</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300">Total de Vulnerabilidades</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{scan.vulnerabilities.length}</p>
                </div>
                
                {['Crítica', 'Alta', 'Média', 'Baixa'].map((severity) => {
                  const count = scan.vulnerabilities.filter(v => v.severity === severity).length;
                  return (
                    <div key={severity} className="flex justify-between items-center">
                      <p className="text-gray-700 dark:text-gray-300">Severidade {severity}</p>
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getSeverityColor(severity)}`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {scan.vulnerabilities.length === 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md">
                  <p className="text-sm font-medium">Nenhuma vulnerabilidade encontrada!</p>
                  <p className="text-sm mt-1">Este site parece estar seguro com base na nossa varredura.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {scan.vulnerabilities.length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vulnerabilidades Encontradas</h2>
                  
                  <ul className="space-y-4">
                    {scan.vulnerabilities.map((vuln: Vulnerability, index: number) => (
                      <li key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">{vuln.type}</h3>
                          <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getSeverityColor(vuln.severity)}`}>
                            {vuln.severity}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{vuln.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Análise e Recomendações</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {scan.report}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Esta varredura foi realizada em {new Date(scan.timestamp.toDate()).toLocaleString('pt-BR')} utilizando ScaneIA.</p>
          <p className="mt-1">Lembre-se que ferramentas automatizadas podem não detectar todas as vulnerabilidades. Recomendamos testes periódicos e uma abordagem de segurança em camadas.</p>
        </div>
      </div>
    </AuthGuard>
  );
} 