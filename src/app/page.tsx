export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary-600 dark:text-primary-400 sm:text-5xl md:text-6xl">
          ScaneIA
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-lg md:mt-5 md:text-xl lg:mx-0">
          Varredura de vulnerabilidades impulsionada por Inteligência Artificial
        </p>
        
        <div className="mt-12 space-y-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Proteção para seu site</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Nossa plataforma utiliza tecnologia avançada para encontrar vulnerabilidades em seus sites e aplicações web, 
              fornecendo recomendações precisas geradas por IA para mitigar riscos de segurança.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="/auth/signup"
                className="btn btn-primary text-center text-base font-medium"
              >
                Começar agora
              </a>
              <a
                href="/auth/login"
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 text-center text-base font-medium"
              >
                Fazer login
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Varredura inteligente</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Identifique vulnerabilidades com varreduras automatizadas e relatórios detalhados
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Análise com IA</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receba recomendações personalizadas geradas por IA para mitigar riscos
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Monitoramento contínuo</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Mantenha seu site protegido com alertas e monitoramento em tempo real
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 