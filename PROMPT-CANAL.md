Você vai trabalhar comigo em um canal do YouTube em português do Brasil, feito em dupla. O canal publica documentários que explicam e reconstroem acontecimentos reais: acidentes, crimes, política, guerras e temas parecidos. A referência de formato é o canal @Reconstructednews: reconstrução em 3D, material real e narração séria.

Responda sempre em português. Antes de qualquer coisa, leia este documento inteiro e siga a seção "Primeira tarefa" no final.

## O que recebi

A pasta `meu-video-tiktok`, sem `node_modules`, `out` e `.env`. Ela contém o projeto Remotion, as skills em `.claude/skills` e o primeiro documentário completo, o voo 2283 da Voepass, em `src/voepass`. Use esse vídeo como modelo do padrão esperado. O código ainda não está em um repositório remoto.

## Decisões já tomadas

- **Formato:** 1920×1080, 30 fps, mais de 10 minutos. O Voepass tem cerca de 22.
- **Voz:** ElevenLabs, modelo `eleven_multilingual_v2`, voz **Victor Power** (`YNOujSUmHtgN6anjqXPf`), com `quem: "victor"` no roteiro. Ajustes: `stability 0.55`, `similarity_boost 0.75`, `style 0.15`, enviando `previous_text` e `next_text`. Já está em `scripts/voz.mjs`. Vozes prontas em inglês foram rejeitadas por sotaque estrangeiro; use vozes nativas pt-BR da biblioteca.
- **Conta ElevenLabs:** plano Starter, cerca de 35 mil créditos por ciclo. O Voepass, com 16 mil caracteres, coube com folga. A chave de API precisa das permissões de texto para fala, leitura de vozes e leitura do usuário.
- **Monetização:** os vídeos serão monetizados. Todo material precisa permitir uso comercial. Modelos de voz não comerciais estão descartados, como OmniVoice (CC-BY-NC). Antes de publicar, confirme nos termos atuais da ElevenLabs o uso comercial de vozes da biblioteca, porque isso ainda não foi verificado.
- **Legendas:** nada gravado na imagem. O arquivo `.srt` vai para o YouTube.
- **Efeitos sonoros:** discretos.
- **Encerramento:** depois da homenagem ou conclusão, nunca misturado a ela, entra a cena `Canal` em `src/voepass/Cenas.tsx`: botões no estilo YouTube com cursor animado para inscrever-se, ativar o sino, curtir e comentar.

## Regras de trabalho

- Faça a menor mudança completa que resolve o pedido. Reaproveite o que já existe antes de escrever código novo. Termine cada resposta com uma ou duas linhas sobre o que não foi verificado e os riscos.
- O `.env` guarda as chaves (`ELEVENLABS_API_KEY`, opcionalmente `GEMINI_API_KEY`) e fica fora do Git. Nunca mostre, repita ou envie os valores das chaves. Cada pessoa usa as próprias.
- Commit somente quando eu pedir. Renderização final somente quando eu pedir.
- Downloads precisam da minha aprovação, informando nome do arquivo, origem e tamanho.
- Não contorne verificações anti-robô. Se um site bloquear, peça para eu baixar o arquivo.
- Tarefas pesadas uma de cada vez. Um PC de 16 GB e 4 núcleos já congelou ao rodar renderização e transcrição juntas. Veja o espaço em disco antes de renderizar.

## Fluxo de produção

1. **Pesquisa.** Procure primeiro o documento primário: relatório oficial, sentença, inquérito público, ata, documento de governo. A imprensa serve para contexto.
2. **Fontes.** Registre em `src/<projeto>/fontes.md` cada afirmação, a fonte e o crédito e a licença de cada mídia. Marque o que depende de fonte única.
3. **Arco narrativo.** O roteiro é uma história única, com um fio condutor que a abertura propõe e o final retoma. Nunca junte blocos soltos. No Voepass, o fio foi "o que não foi escrito no diário de bordo". Comece pela pergunta central e faça cada capítulo responder uma parte dela.
4. **Aprovação.** Escreva o texto em `src/<projeto>/roteiro-novo.md`, com números em algarismos, e me mostre antes de gerar qualquer áudio. Marque o que vem só da imprensa.
5. **Confronto com a fonte primária.** Compare o texto com o documento original. No Voepass, o relatório oficial corrigiu vários erros da imprensa, inclusive o horário do alarme de estol.
6. **Conversão.** Gere `src/<projeto>/roteiro.json`, com um item por parágrafo. O campo `legenda` tem os algarismos e o campo `texto` tem tudo por extenso. `scripts/voepass-md2json.py` é o exemplo; ajuste a lista de capítulos para cada projeto. Depois de converter, verifique que não sobrou dígito nem caractere de controle no `texto`.
7. **Voz.** Gere uma amostra curta e peça minha aprovação. Depois: `node scripts/voz.mjs --projeto=<projeto> --faltando`. Para refazer falas específicas, passe os ids. Isso também atualiza o `voz.json`.
8. **Cenas.** Use `src/voepass/Cenas.tsx` como base. O componente `Telas` troca a imagem conforme a fala. Todo o tempo vem do áudio medido, por `montar()` em `src/panama/timeline.ts`. `pausa` adiciona frames depois de uma fala, útil para áudio real, e `cauda` estende o fim da cena.
9. **Conferência.** Rode `npx tsc --noEmit`. Depois renderize um quadro por fala com `COMP=<composição> SCALE=0.25 node scripts/stills.cjs <prefixo> <frames>` e olhe a folha de contato. Transcreva as falas com Whisper (`scripts/confere-voz.py`). O Whisper encontra palavras faltando, mas não encontra pronúncia ruim, por isso eu sempre ouço o vídeo no Studio antes de renderizar.
10. **Legendas e render.** `npx tsx scripts/srt.mts <projeto>` gera `out/<projeto>.srt`. Para renderizar, quando eu pedir, use `--concurrency=2`. Se o disco principal tiver pouco espaço, aponte `TEMP` e `TMP` para outro disco, porque os quadros temporários ocupam vários GB. A renderização não retoma de onde parou.

## Regras de texto para a voz

- Números, anos e horários por extenso no campo `texto`, com concordância: "sessenta e duas pessoas", "duzentas e sessenta e seis páginas".
- Siglas soletradas com espaço quando precisarem: "A T R", "A P M", "P S V P B".
- Número de voo dígito por dígito: "voo dois dois oito três".
- Se a voz errar uma palavra, primeiro verifique se o `texto` está correto. Se estiver, reescreva a frase com outra palavra. "Inflam" e "Airbus" soaram mal e foram trocadas.
- Essa voz é pausada: conte cerca de 0,08 segundo por caractere para estimar a duração.

## Imagem e materiais

- **Pilha:** Remotion 4.0.541, `@remotion/three`, `three` 0.187, `@react-three/fiber` 9.8.2. Renderize com `gl: "angle"`. Fontes Oswald e Inter.
- **3D:** `src/voepass/Palco.tsx` tem céu, nuvens e chão de satélite. `Aviao.tsx` normaliza um GLB. Modelos com licença CC BY vêm do Sketchfab, com crédito.
- **Satélite:** EOX Sentinel-2 cloudless 2016, CC BY 4.0, montado por `scripts/sat.py`. `Satelite` e `merc` em `Real.tsx` posicionam marcadores por longitude e latitude.
- **Fotos:** prefira Wikimedia Commons, com autor e licença na tela e na descrição.
- **Vídeo e áudio reais:** trechos curtos que circularam publicamente são um risco de direitos autorais que o canal aceitou conscientemente. Registre como "risco assumido", corte logotipos e legendas gravadas e use só o necessário.
- **Créditos** ficam na tela e na descrição do YouTube.
- Texto sobre cenas 3D precisa de faixa escura para ficar legível.

## Padrão editorial

Isto vale para todos os temas e é tão importante quanto a parte técnica.

- Separe fato comprovado, alegação e interpretação, e diga no texto qual é qual. Atribua: "segundo o relatório", "a acusação sustenta".
- Dê o lado de quem é acusado ou criticado, como a nota da empresa no vídeo da Voepass.
- **Crimes:** indiciado ou réu não é culpado. Só afirme culpa com condenação definitiva, e diga em que fase está o processo. Não publique nomes de vítimas de crimes sexuais, de menores ou de familiares. Sem instruções que ensinem a cometer o crime.
- **Política:** relate com o mesmo critério para todos os lados. Sem adjetivos de torcida, sem chamada de voto. Confira dados em fonte oficial e cite a data deles.
- **Guerra:** diga quem afirma cada número, e deixe claro quando não há confirmação independente. Vale desconfiar de imagens sem origem verificada.
- **Respeito às vítimas:** sem áudio de gritos, sem imagem de corpos, sem descrição do sofrimento. Nomeie apenas as pessoas relevantes, uma vez e com dignidade, mostrando quem eram. Falhas são descritas como o documento descreve, sem linguagem de julgamento. No Voepass, o texto diz "os pilotos" e "a tripulação" ao tratar dos erros.
- Estes vídeos podem expor pessoas e empresas a dano real. Se uma afirmação grave tiver fonte única ou fraca, corte ou me avise.

## Erros já cometidos, para não repetir

- Dados técnicos da imprensa estavam errados. Priorize o documento primário.
- Um bug de conversão apagou a palavra "voo" e fez a voz dizer "dobro". Valide o texto final antes de pagar pela geração.
- Gemini TTS lê em voz alta instruções de estilo e tem cota gratuita de 10 pedidos por dia.
- Modelos locais foram descartados: PocketTTS e Supertonic-3 tiveram fluidez ruim, e VoxCPM2 levaria cerca de 6 horas no processador.

## Primeira tarefa

1. Confirme que entendeu o projeto, em no máximo dez linhas.
2. Verifique o ambiente sem instalar nada: versão do Node, `ffmpeg` e `ffprobe` no PATH, existência de `.env` (sem mostrar o conteúdo) e de `node_modules`, espaço em disco e RAM.
3. Crie um `CLAUDE.md` na raiz com o conteúdo deste documento, para valer nas próximas sessões.
4. Me diga o que falta. Com minha aprovação, rode `npm install` e abra `npx remotion studio` na composição `Voepass2283`.
5. Pare e pergunte qual será o próximo tema. Não comece pesquisa, geração de voz nem renderização antes disso.
