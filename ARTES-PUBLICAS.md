# Padrao de artes publicas

Este guia define os arquivos de referencia para criar artes no Figma para a home publica da organizacao e para a pagina publica de evento. As dimensoes sao telas recomendadas para exportacao; o layout continua responsivo e pode recortar imagens conforme o dispositivo.

## Home publica da organizacao

| Arte / campo | Tela recomendada no Figma | Como aparece | Orientacao |
| --- | --- | --- | --- |
| Imagem do banner principal (Hero) | 1600 x 1200 px, 4:3 | Imagem em proporcao 4:3, com `object-fit: cover` | Nao inclua texto essencial na imagem; titulo, descricao e botao sao campos separados. O limite de processamento e 1920 px no lado maior. |
| Capa de evento ou noticia exibida na home | 1600 x 1000 px, 16:10 | Cards em proporcao 16:10, com recorte para preencher | O mesmo arquivo pode aparecer na pagina do evento. O limite de processamento e 1600 px no lado maior. |
| Logotipo da organizacao | 512 x 512 px, quadrado | Area de 40 x 40 px, imagem inteira em `contain` | Centralize o logo e deixe margem interna. Prefira PNG ou WebP com transparencia. O limite de processamento e 512 px no lado maior. |
| Favicon | 512 x 512 px, quadrado | Icone do navegador, reduzido para varios tamanhos | Use simbolo simples, centralizado e com bom contraste; evite textos pequenos. Prefira PNG ou WebP. O limite de processamento e 512 px no lado maior. |
| Imagem de compartilhamento (SEO / Open Graph) | 1200 x 630 px, 1,91:1 | Previa em redes sociais e mensageiros; nao aparece no corpo da home | Mantenha marca e texto importante na area central. O limite de processamento e 1200 px no lado maior. |
| Logotipo de parceiro | 600 x 300 px, 2:1 | Caixa de no maximo 160 x 56 px, imagem inteira em `contain` | Use fundo transparente e preserve a proporcao original. O limite de processamento e 1200 px no lado maior. |

## Pagina publica de evento

| Arte / campo | Tela recomendada no Figma | Como aparece | Orientacao |
| --- | --- | --- | --- |
| Capa do evento | 1600 x 1000 px, 16:10 | Pode ser fundo do cabecalho e imagem de apresentacao abaixo dele; a home tambem a usa em cards 16:10 | Evite texto essencial nas bordas: no cabecalho a imagem e ampliada e cortada para preencher. O limite de processamento e 1600 px no lado maior. |
| Banner do evento (opcional) | 1600 x 700 px, aproximadamente 2,29:1 | Fundo de largura total no cabecalho, com escurecimento e recorte responsivo | Deixe detalhes importantes na regiao central e nao aplique titulo/botao na arte; a pagina sobrepoe essas informacoes. O limite de processamento e 1600 px no lado maior. |
| Mapa do local | Exportar com proporcao original; lado maior de ate 1600 px | Largura disponivel, altura proporcional, sem recorte | Nao force uma proporcao 16:9. Exporte o mapa legivel, com margens e textos em tamanho confortavel. |
| Arte / logotipo de patrocinador | 600 x 250 px, aproximadamente 2,4:1 | Ate 192 x 80 px, imagem inteira em `contain` | Prefira logo sem fundo ou com fundo transparente; nao coloque informacao que dependa de leitura pequena. |

## Exportacao e limites tecnicos

- Exporte imagens em PNG, JPEG ou WebP. SVG nao e aceito pelo envio atual.
- Para logos com transparencia, use PNG ou WebP; para fotografias, prefira JPEG ou WebP.
- Cada imagem e comprimida no navegador para no maximo 2 MB e redimensionada pelo limite de lado maior indicado na tabela. Isso nao define a proporcao visual do slot.
- O sistema nao faz crop nem valida a proporcao. `cover` pode cortar partes da arte, enquanto `contain` mostra a imagem inteira e pode deixar espacos vazios.
- Use estas dimensoes como padrao de producao; confira a previa em desktop e celular antes de publicar, especialmente para o banner do evento.