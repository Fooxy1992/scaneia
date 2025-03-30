'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { getSite } from '@/lib/firebase/firestore';
import { addScan } from '@/lib/firebase/firestore';
import { generateVulnerabilityReport } from '@/lib/openai/api';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

// Lista de exemplo de vulnerabilidades comuns (em produção, isso viria de um scanner real)
const COMMON_VULNERABILITIES = [
  {
    type: 'XSS',
    severity: 'Alta',
    description: 'Vulnerabilidade Cross-Site Scripting (XSS) detectada em formulários de entrada'
  },
  {
    type: 'SQL Injection',
    severity: 'Alta',
    description: 'Possível vulnerabilidade de injeção SQL em parâmetros de consulta'
  },
  {
    type: 'Outdated SSL/TLS',
    severity: 'Média',
    description: 'Versões desatualizadas de SSL/TLS em uso'
  },
  {
    type: 'Cross-Site Request Forgery (CSRF)',
    severity: 'Média',
    description: 'Proteção contra CSRF ausente em formulários críticos'
  },
  {
    type: 'Information Disclosure',
    severity: 'Baixa',
    description: 'Divulgação de informações sensíveis em cabeçalhos HTTP'
  },
  {
    type: 'Insecure Cookies',
    severity: 'Baixa',
    description: 'Cookies sem flags de segurança (HttpOnly, Secure)'
  },
  {
    type: 'Missing HTTP Security Headers',
    severity: 'Baixa',
    description: 'Cabeçalhos de segurança HTTP ausentes (Content-Security-Policy, X-XSS-Protection)'
  }
];

export default function NewScanPage() {
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [error, setError] = useState('');
  const [scanId, setScanId] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get('siteId');

  useEffect(() => {
    const fetchSiteData = async () => {
      if (!siteId) {
        router.push('/sites');
        return;
      }

      try {
        const site = await getSite(siteId);
        if (!site) {
          router.push('/sites');
          return;
        }

        setSiteData(site);
      } catch (error) {
        console.error('Erro ao carregar dados do site:', error);
        setError('Erro ao carregar dados do site.');
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();
  }, [siteId, router]);

  const startScan = async () => {
    if (!siteData || !auth.currentUser) return;

    setScanning(true);
    setScanProgress(0);
    setError('');

    try {
      // Em um app real, aqui você iniciaria um serviço de varredura de vulnerabilidades
      // Para o exemplo, vamos simular um processo de varredura

      // Simular progresso
      const timer = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return prev;
          }
          return prev + Math.floor(Math.random() * 10) + 1;
        });
      }, 1000);

      // Simular um tempo de varredura (5 segundos)
      await new Promise((resolve) => setTimeout(resolve, 5000));
      clearInterval(timer);
      setScanProgress(100);

      // Escolher algumas vulnerabilidades aleatórias para o exemplo
      const numVulnerabilities = Math.floor(Math.random() * 4); // 0 a 3 vulnerabilidades
      const vulnerabilities = [];
      
      for (let i = 0; i < numVulnerabilities; i++) {
        const randomIndex = Math.floor(Math.random() * COMMON_VULNERABILITIES.length);
        vulnerabilities.push(COMMON_VULNERABILITIES[randomIndex]);
      }

      // Gerar relatório usando IA
      const report = await generateVulnerabilityReport(vulnerabilities, siteData.url);

      // Salvar resultado no Firestore
      const newScanId = await addScan({
        siteId,
        vulnerabilities,
        report,
      });

      setScanId(newScanId);
      setScanComplete(true);
    } catch (error) {
      console.error('Erro durante a varredura:', error);
      setError('Ocorreu um erro durante a varredura. Por favor, tente novamente.');
    } finally {
      setScanning(true); // Mantém true para mostrar o resultado
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link 
              href={siteId ? `/sites/${siteId}` : '/sites'} 
              className="text-primary-600 dark:text-primary-400 hover:underline mb-2 inline-block"
            >
              &larr; Voltar
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nova Varredura</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Informações do Site</h2>
            {siteData && (
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  <span className="font-medium">URL:</span> {siteData.url}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Descrição:</span> {siteData.description}
                </p>
              </div>
            )}
          </div>

          {!scanning && (
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                A varredura irá analisar o site em busca de vulnerabilidades conhecidas e gerar um relatório detalhado com recomendações de mitigação.
              </p>
              <button
                onClick={startScan}
                className="btn btn-primary"
              >
                Iniciar Varredura
              </button>
            </div>
          )}

          {scanning && !scanComplete && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Progresso da Varredura</h3>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200 dark:bg-gray-700">
                  <div 
                    style={{ width: `${scanProgress}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{scanProgress}%</span>
                </div>
              </div>
              <div className="mt-4 text-gray-600 dark:text-gray-400">
                {scanProgress < 30 && "Iniciando varredura..."}
                {scanProgress >= 30 && scanProgress < 60 && "Analisando a estrutura do site..."}
                {scanProgress >= 60 && scanProgress < 90 && "Verificando vulnerabilidades conhecidas..."}
                {scanProgress >= 90 && scanProgress < 100 && "Finalizando análise..."}
                {scanProgress === 100 && "Gerando relatório..."}
              </div>
            </div>
          )}

          {scanComplete && scanId && (
            <div>
              <div className="mb-6 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-md">
                <p className="font-medium">Varredura concluída com sucesso!</p>
                <p className="mt-2">Seu relatório está pronto para visualização.</p>
              </div>
              <Link 
                href={`/scans/${scanId}`}
                className="btn btn-primary"
              >
                Ver Relatório
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 