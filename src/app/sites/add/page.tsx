'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addSite } from '@/lib/firebase/firestore';
import { analyzeUrl } from '@/lib/openai/api';
import { auth } from '@/lib/firebase/config';
import AuthGuard from '@/components/AuthGuard';

export default function AddSitePage() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verificar se o usuário está logado
    const user = auth.currentUser;
    if (!user) {
      setError('Você precisa estar logado para adicionar um site.');
      return;
    }

    // Validar URL
    if (!validateUrl(url)) {
      setError('Por favor, insira uma URL válida, incluindo http:// ou https://');
      return;
    }

    setAnalyzing(true);

    try {
      // Analisar a URL com a API da OpenAI
      const description = await analyzeUrl(url);

      // Adicionar site ao Firestore
      await addSite({
        ownerId: user.uid,
        url,
        description,
      });

      // Redirecionar para a lista de sites
      router.push('/sites');
    } catch (err) {
      console.error('Erro ao adicionar site:', err);
      setError('Ocorreu um erro ao adicionar o site. Tente novamente.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Adicionar Novo Site</h1>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL do Site
              </label>
              <input
                id="url"
                name="url"
                type="text"
                placeholder="https://exemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input mt-1"
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Insira a URL completa do site que deseja escanear.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={analyzing}
                className="w-full btn btn-primary"
              >
                {analyzing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analisando...
                  </span>
                ) : (
                  'Adicionar Site'
                )}
              </button>
            </div>
          </form>

          {analyzing && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">
              <p className="text-sm">
                Estamos analisando seu site e identificando potenciais riscos de segurança. Isso pode levar alguns segundos...
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 