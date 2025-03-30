# ScaneIA - Varredura de Vulnerabilidades com IA

Esta aplicação web permite que os usuários cadastrem seus sites e realizem varreduras automatizadas em busca de vulnerabilidades conhecidas. Ela integra a API da OpenAI para analisar os resultados dos scans e gerar relatórios detalhados com recomendações de mitigação, armazenando todos os dados no Firebase. O código é versionado no GitHub e o deploy em produção é realizado via Vercel.

## Ambiente de Produção

A aplicação está disponível em produção através do seguinte link:
- [ScaneIA na Vercel](https://scaneia.vercel.app)

---

## Funcionalidades

- **Cadastro e Autenticação de Usuários:**  
  Registro e login com autenticação multifator utilizando Firebase Auth.

- **Gerenciamento de Sites:**  
  Interface para adicionar, editar e remover sites. Cada site é validado, analisado e armazenado no Firebase, com uma descrição resumida dos potenciais riscos gerada pela API da OpenAI.

- **Varredura Automatizada de Vulnerabilidades:**  
  Módulo integrado para executar scans de segurança nos sites cadastrados. Os resultados são interpretados pela API da OpenAI, que gera um resumo dos riscos identificados e sugestões de correção.

- **Dashboard e Relatórios:**  
  Dashboard interativo para visualizar os resultados dos scans, históricos e gráficos de desempenho. Relatórios dinâmicos são gerados com a API da OpenAI com recomendações de mitigação.

- **Integração com APIs de Vulnerabilidades:**  
  Conexão com fontes externas (como CVE/NVD) para manter os dados de vulnerabilidades atualizados e correlacionados.

- **Monitoramento Contínuo:**  
  Sistema que utiliza a API da OpenAI para analisar logs e métricas, alertando os administradores sobre possíveis incidentes de segurança.

---

## Tecnologias Utilizadas

- **Frontend:**  
  Next.js, React

- **Backend:**  
  Next.js API Routes

- **Banco de Dados:**  
  Firebase Firestore

- **Autenticação:**  
  Firebase Auth

- **Inteligência Artificial:**  
  API da OpenAI (GPT-4)

- **Estilização:**  
  Tailwind CSS

- **Versionamento:**  
  GitHub

- **Deploy:**  
  Vercel

---

## Estrutura da Base de Dados (Firebase Firestore)

A estrutura de dados foi planejada para facilitar o gerenciamento dos usuários, sites cadastrados e os resultados das varreduras de vulnerabilidades. Abaixo, descrevemos a estrutura completa das coleções necessárias:

### 1. Coleção `users`

Armazena os dados dos usuários cadastrados.

- **Document ID:** _UID (gerado pelo Firebase Auth)_
- **Campos:**
  - `name` (string): Nome do usuário.
  - `email` (string): Email do usuário.
  - `createdAt` (timestamp): Data de criação da conta.

**Exemplo de Documento:**
```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "createdAt": "2025-03-30T20:00:00Z"
}
```

### 2. Coleção `sites`

Cada documento representa um site cadastrado por um usuário.

- **Document ID:** _siteId (gerado automaticamente ou definido pelo sistema)_
- **Campos:**
  - `ownerId` (string): UID do usuário proprietário (referência à coleção `users`).
  - `url` (string): URL do site.
  - `description` (string): Descrição ou análise resumida dos riscos, gerada pela API da OpenAI.
  - `createdAt` (timestamp): Data de cadastro do site.
  - `updatedAt` (timestamp): Data da última atualização do documento.

**Exemplo de Documento:**
```json
{
  "ownerId": "abc123uid",
  "url": "https://exemplo.com",
  "description": "Análise inicial: Site sem HTTPS e presença de potenciais falhas XSS.",
  "createdAt": "2025-03-30T20:05:00Z",
  "updatedAt": "2025-03-30T20:05:00Z"
}
```

### 3. Coleção `scans`

Armazena os resultados de cada varredura (scan) realizada em um site.

- **Document ID:** _scanId (gerado automaticamente)_
- **Campos:**
  - `siteId` (string): Referência ao site analisado (ID da coleção `sites`).
  - `timestamp` (timestamp): Data e hora da execução do scan.
  - `vulnerabilities` (array): Lista de vulnerabilidades identificadas.
    - Cada item do array inclui:
      - `type` (string): Tipo de vulnerabilidade (ex: "SQL Injection", "XSS", "CSRF").
      - `severity` (string): Nível de severidade (ex: "Baixa", "Média", "Alta").
      - `description` (string): Descrição detalhada da vulnerabilidade.
  - `report` (string): Relatório completo gerado pela API da OpenAI.

**Exemplo de Documento:**
```json
{
  "siteId": "site123",
  "timestamp": "2025-03-30T21:00:00Z",
  "vulnerabilities": [
    {
      "type": "XSS",
      "severity": "Alta",
      "description": "Injeção de script em campos de entrada sem sanitização adequada."
    },
    {
      "type": "SQL Injection",
      "severity": "Média",
      "description": "Possível injeção de código SQL nos parâmetros de consulta."
    }
  ],
  "report": "Relatório detalhado: Foram identificadas 2 vulnerabilidades críticas. Recomenda-se a sanitização dos inputs e atualização dos parâmetros de consulta."
}
```

### 4. (Opcional) Coleção `logs`

Para armazenar logs e métricas de monitoramento que podem ser analisados pela API da OpenAI para alertas e diagnósticos.

- **Document ID:** _logId (gerado automaticamente)_
- **Campos:**
  - `timestamp` (timestamp): Data e hora do log.
  - `level` (string): Nível do log (ex: "INFO", "WARNING", "ERROR").
  - `message` (string): Mensagem detalhada do log.
  - `scanId` (string, opcional): Referência ao scan relacionado (se aplicável).

**Exemplo de Documento:**
```json
{
  "timestamp": "2025-03-30T21:05:00Z",
  "level": "ERROR",
  "message": "Falha ao conectar ao scanner de vulnerabilidades para o site https://exemplo.com",
  "scanId": "scan123"
}
```

> **Observação:**  
> A estrutura pode ser ajustada conforme as necessidades do projeto. Dependendo dos padrões de leitura e gravação do Firebase, pode ser vantajoso criar subcoleções (por exemplo, `sites` como subcoleção de `users`) para otimizar o desempenho e a organização dos dados.

---

## Configuração e Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/scaneia.git
   cd scaneia
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configuração do Firebase:**

   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
   - Configure o Firebase Auth e o Firestore conforme a documentação.
   - Crie um arquivo `.env.local` na raiz do projeto e adicione suas credenciais:

     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
     ```

4. **Configuração da API da OpenAI:**

   - A chave da API da OpenAI já está configurada no ambiente de produção.
   - Para desenvolvimento local, adicione sua chave no arquivo `.env.local`:

     ```env
     OPENAI_API_KEY=your_openai_api_key_here
     ```

5. **Execute o projeto localmente:**

   ```bash
   npm run dev
   ```

   A aplicação estará disponível em http://localhost:3000

---

## Deploy para Vercel

O projeto está configurado para deploy automático na Vercel. Quando você envia alterações para o repositório principal, o Vercel inicia automaticamente um novo deploy.

Para configurar um novo deploy:

1. Crie uma conta na [Vercel](https://vercel.com/)
2. Importe o repositório do GitHub
3. Configure as variáveis de ambiente necessárias:
   - Todas as variáveis do Firebase (NEXT_PUBLIC_FIREBASE_*)
   - OPENAI_API_KEY

A Vercel irá detectar automaticamente o projeto Next.js e configurar as opções de build apropriadas.

---

## Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature ou correção:
   ```bash
   git checkout -b minha-feature
   ```
3. Faça commit das suas alterações:
   ```bash
   git commit -am 'Adiciona nova feature'
   ```
4. Envie a branch para o repositório remoto:
   ```bash
   git push origin minha-feature
   ```
5. Abra um Pull Request.

---

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

## Contato

Para dúvidas ou sugestões, entre em contato via [e-mail](mailto:seu-email@exemplo.com) ou abra uma issue neste repositório.