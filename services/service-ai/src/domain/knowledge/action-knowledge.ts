/** Base de conhecimento para RAG — padrões de intenção e execução de ações. */
export interface KnowledgeChunk {
  id: string;
  category: string;
  keywords: string[];
  content: string;
}

export const ACTION_KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'open-browser',
    category: 'browser',
    keywords: ['navegador', 'browser', 'chrome', 'nova aba', 'aba', 'google chrome'],
    content: `ABRIR NAVEGADOR / NOVA ABA:
- Comandos: "abra o navegador", "nova aba", "abrir Google Chrome", "abra uma aba em branco"
- Ferramenta: open_url com url "about:blank" ou open_application com app "browser"
- Execução: window.open() no cliente — abre nova aba no navegador atual
- Resposta: confirme brevemente e execute imediatamente quando o usuário pedir explicitamente (abre/abra)`,
  },
  {
    id: 'open-youtube',
    category: 'youtube',
    keywords: ['youtube', 'yt', 'vídeo', 'video', 'música', 'musica', 'tocar', 'reproduzir'],
    content: `YOUTUBE — ABRIR OU TOCAR MÚSICA:
- "Abra o YouTube" / "Entre no YouTube" → open_application app=youtube, url=https://www.youtube.com
- "Toque/coloque a música X no YouTube" → video_search query=X, depois abrir URL do resultado
- "Abra o YouTube na música chamada X banda Y" → video_search query="X Y"
- Sempre use video_search quando houver nome de música/cantor/banda
- Com pedido explícito (abra, toque, coloque): execute sem pedir confirmação extra
- Fallback URL: https://www.youtube.com/results?search_query=QUERY`,
  },
  {
    id: 'google-search',
    category: 'search',
    keywords: ['google', 'busca', 'pesquisa', 'pesquisar', 'encontrar', 'procurar', 'internet'],
    content: `BUSCA NO GOOGLE / WEB:
- "Busque X no Google" / "Encontre X" / "Pesquise sobre X" → web_search query=X
- "Abra o Google com X" → open_url url=https://www.google.com/search?q=X
- Após web_search: resuma o resultado mais relevante e ofereça abrir no navegador
- Comando explícito "abra no google": abrir URL de busca diretamente`,
  },
  {
    id: 'music-spotify',
    category: 'music',
    keywords: ['spotify', 'música', 'musica', 'playlist', 'som', 'tocar', 'play'],
    content: `MÚSICA E SPOTIFY:
- "Toque música X" sem app específico → video_search (YouTube) como padrão
- "Abra no Spotify" → open_application app=spotify, url=https://open.spotify.com/search/QUERY
- Após encontrar vídeo: oferecer play_embed (reproduzir na interface) OU abrir no YouTube/Spotify`,
  },
  {
    id: 'gmail',
    category: 'gmail',
    keywords: ['gmail', 'email', 'e-mail', 'correio'],
    content: `GMAIL:
- "Abra o Gmail" → open_application app=gmail, url=https://mail.google.com
- Execute imediatamente em pedidos explícitos`,
  },
  {
    id: 'response-patterns',
    category: 'response',
    keywords: ['resposta', 'jarvis', 'senhor', 'executar', 'ação'],
    content: `PADRÕES DE RESPOSTA JARVIS:
- SEMPRE formule texto de resposta mesmo ao chamar ferramentas — nunca retorne conteúdo vazio
- Ao usar tools: escreva 1-2 frases confirmando a ação ("Certamente, senhor. Localizando...")
- Pedido explícito de abrir/tocar: execute a ação, não apenas pergunte se deseja
- Idioma: português do usuário, tom britânico elegante
- Não repita opções duplicadas (ex.: dois botões "YouTube")`,
  },
  {
    id: 'explicit-execute',
    category: 'execute',
    keywords: ['faça', 'faz', 'preciso', 'execute', 'agora', 'immediately', 'exactamente'],
    content: `EXECUÇÃO IMEDIATA:
- Verbos imperativos: abre, abra, abrir, toque, coloque, reproduza, play, entre, entre no, faça, faça exatamente
- Quando o usuário repete ou corrige ("você não abriu", "faça o que fez antes"): executar a ação diretamente
- Referência a ação anterior: abrir nova aba com URL do resultado da busca anterior
- requiresConfirmation=false para comandos imperativos claros`,
  },
];
