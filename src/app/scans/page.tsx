'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Scan, Site } from '@/lib/firebase/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

export default function ScansPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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
    const fetchScans = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Primeiro buscar os sites do usuário
        const sitesRef = collection(db, 'sites');
        const sitesQuery = query(sitesRef, where('ownerId', '==', user.uid));
        const sitesSnapshot = await getDocs(sitesQuery);
        
        const sites: Site[] = [];
        sitesSnapshot.forEach((doc) => {
          sites.push({ id: doc.id, ...doc.data() } as Site);
        });

        // Se o usuário não tem sites, não precisa buscar varreduras
        if (sites.length === 0) {
          setScans([]);
          setLoading(false);
          return;
        }

        // Buscar as varreduras para todos os sites do usuário
        const siteIds = sites.map(site => site.id);
        const scansRef = collection(db, 'scans');
        
        // Como não podemos usar operador IN com array vazia
        if (siteIds.length === 0) {
          setScans([]);
          return;
        }

        const scansQuery = query(
          scansRef, 
          where('siteId', 'in', siteIds),
          orderBy('timestamp', 'desc')
        );
        
        const scansSnapshot = await getDocs(scansQuery);
        
        const scansList: any[] = [];
        scansSnapshot.forEach((doc) => {
          const scanData = doc.data();
          const site = sites.find(s => s.id === scanData.siteId);
          
          scansList.push({
            id: doc.id,
            siteId: scanData.siteId,
            timestamp: scanData.timestamp,
            vulnerabilities: scanData.vulnerabilities,
            report: scanData.report,
            siteUrl: site ? site.url : 'Site Desconhecido',
          });
        });

        setScans(scansList);
      } catch (error) {
        console.error('Erro ao carregar varreduras:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchScans();
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Todas as Varreduras</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Histórico de todas as varreduras realizadas em seus sites
          </p>
        </div>

        {scans.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {scans.map((scan) => (
                <li key={scan.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Link href={`/scans/${scan.id}`} className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {scan.siteUrl}
                        </span>
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                          {scan.vulnerabilities.length} vulnerabilidades
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Varredura em {new Date(scan.timestamp.toDate()).toLocaleString('pt-BR')}
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
            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma varredura encontrada.</p>
            <Link href="/sites" className="btn btn-primary">
              Ir para Meus Sites
            </Link>
          </div>
        )}
      </div>
    </AuthGuard>
  );
} 