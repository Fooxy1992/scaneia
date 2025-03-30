'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserSites } from '@/lib/firebase/firestore';
import { Site } from '@/lib/firebase/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchSites = async () => {
      if (user) {
        try {
          const userSites = await getUserSites(user.uid);
          setSites(userSites);
        } catch (error) {
          console.error('Erro ao carregar sites:', error);
        }
      }
    };

    if (user) {
      fetchSites();
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
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <Link href="/sites/add" className="btn btn-primary">
            Adicionar Site
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resumo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sites Cadastrados</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{sites.length}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Varreduras Realizadas</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">0</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vulnerabilidades Encontradas</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Seus Sites</h2>
          
          {sites.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {sites.map((site) => (
                  <li key={site.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Link href={`/sites/${site.id}`} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{site.url}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{site.description}</p>
                      </div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Ativo
                      </span>
                    </Link>
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
      </div>
    </AuthGuard>
  );
} 