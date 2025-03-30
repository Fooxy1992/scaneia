'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSite } from '@/lib/firebase/firestore';
import { getSiteScanHistory } from '@/lib/firebase/firestore';
import { Site, Scan } from '@/lib/firebase/types';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

export default function SiteDetailPage() {
  const [site, setSite] = useState<Site | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const siteData = await getSite(siteId);
        if (siteData) {
          setSite(siteData);
          
          // Buscar histórico de varreduras
          const scanHistory = await getSiteScanHistory(siteId);
          setScans(scanHistory);
        } else {
          // Site não encontrado
          router.push('/sites');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do site:', error);
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      fetchSiteData();
    }
  }, [siteId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Site não encontrado</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            O site que você está procurando não existe ou foi removido.
          </p>
          <Link href="/sites" className="btn btn-primary">
            Voltar para Meus Sites
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
            <Link href="/sites" className="text-primary-600 dark:text-primary-400 hover:underline mb-2 inline-block">
              &larr; Voltar para Meus Sites
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{site.url}</h1>
          </div>
          <Link 
            href={`/scans/new?siteId=${siteId}`}
            className="btn btn-primary"
          >
            Nova Varredura
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Análise de Segurança</h2>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{site.description}</p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Histórico de Varreduras</h2>
          
          {scans.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {scans.map((scan) => (
                  <li key={scan.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Link href={`/scans/${scan.id}`} className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Varredura em {new Date(scan.timestamp.toDate()).toLocaleString('pt-BR')}
                          </span>
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            {scan.vulnerabilities.length} vulnerabilidades
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {scan.vulnerabilities.length > 0 
                            ? `Encontradas vulnerabilidades: ${scan.vulnerabilities.map(v => v.type).join(', ')}`
                            : 'Nenhuma vulnerabilidade encontrada'
                          }
                        </p>
                      </div>
                      <span className="text-primary-600 dark:text-primary-400">Ver detalhes &rarr;</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma varredura foi realizada neste site ainda.</p>
              <Link href={`/scans/new?siteId=${siteId}`} className="btn btn-primary">
                Realizar Primeira Varredura
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 