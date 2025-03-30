'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserSites, deleteSite } from '@/lib/firebase/firestore';
import { Site } from '@/lib/firebase/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
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
    const fetchSites = async () => {
      if (user) {
        try {
          const userSites = await getUserSites(user.uid);
          setSites(userSites);
        } catch (error) {
          console.error('Erro ao carregar sites:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchSites();
    }
  }, [user]);

  const handleDeleteSite = async (siteId: string) => {
    if (confirm('Tem certeza que deseja excluir este site? Esta ação não pode ser desfeita.')) {
      setDeleteLoading(siteId);
      try {
        await deleteSite(siteId);
        setSites((prev) => prev.filter((site) => site.id !== siteId));
      } catch (error) {
        console.error('Erro ao excluir site:', error);
        alert('Erro ao excluir site. Tente novamente.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

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
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Sites</h1>
          <Link href="/sites/add" className="btn btn-primary">
            Adicionar Site
          </Link>
        </div>

        {sites.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {sites.map((site) => (
                <li key={site.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">{site.url}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{site.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/sites/${site.id}`}
                        className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500"
                      >
                        Detalhes
                      </Link>
                      <Link 
                        href={`/scans/new?siteId=${site.id}`}
                        className="btn btn-secondary"
                      >
                        Escanear
                      </Link>
                      <button
                        onClick={() => handleDeleteSite(site.id)}
                        disabled={deleteLoading === site.id}
                        className="btn btn-danger"
                      >
                        {deleteLoading === site.id ? (
                          <span className="animate-pulse">Excluindo...</span>
                        ) : (
                          'Excluir'
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">Você ainda não possui sites cadastrados.</p>
            <Link href="/sites/add" className="mt-4 inline-flex btn btn-primary">
              Adicionar Primeiro Site
            </Link>
          </div>
        )}
      </div>
    </AuthGuard>
  );
} 