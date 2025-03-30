import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analisar um URL e gerar uma descrição resumida dos potenciais riscos
export async function analyzeUrl(url: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em segurança da informação. Analise o URL fornecido e identifique potenciais vulnerabilidades conhecidas ou riscos associados. Forneça uma descrição resumida em português dos riscos potenciais (máximo 150 palavras).'
        },
        {
          role: 'user',
          content: `Analise este URL: ${url}`
        }
      ],
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || 'Não foi possível analisar o URL.';
  } catch (error) {
    console.error('Erro ao analisar URL com OpenAI:', error);
    return 'Ocorreu um erro ao analisar o URL. Tente novamente mais tarde.';
  }
}

// Gerar relatório completo sobre vulnerabilidades encontradas
export async function generateVulnerabilityReport(vulnerabilities: any[], url: string): Promise<string> {
  try {
    const vulnerabilitiesText = JSON.stringify(vulnerabilities);
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em segurança da informação que escreve relatórios detalhados sobre vulnerabilidades encontradas em sites. Forneça um relatório estruturado e detalhado em português sobre as vulnerabilidades detectadas, incluindo recomendações específicas para mitigação.'
        },
        {
          role: 'user',
          content: `Estas são as vulnerabilidades encontradas no site ${url}:\n${vulnerabilitiesText}\n\nGere um relatório detalhado com recomendações de mitigação.`
        }
      ],
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'Não foi possível gerar o relatório.';
  } catch (error) {
    console.error('Erro ao gerar relatório com OpenAI:', error);
    return 'Ocorreu um erro ao gerar o relatório. Tente novamente mais tarde.';
  }
}

// Analisar logs em busca de padrões suspeitos
export async function analyzeLogs(logs: any[]): Promise<string> {
  try {
    const logsText = JSON.stringify(logs);
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em segurança da informação especializado em análise de logs. Analise os logs fornecidos e identifique padrões suspeitos ou indicadores de possíveis incidentes de segurança. Forneça um resumo em português dos achados.'
        },
        {
          role: 'user',
          content: `Analise estes logs:\n${logsText}`
        }
      ],
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'Não foi possível analisar os logs.';
  } catch (error) {
    console.error('Erro ao analisar logs com OpenAI:', error);
    return 'Ocorreu um erro ao analisar os logs. Tente novamente mais tarde.';
  }
} 