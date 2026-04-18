🔥 ATUALIZAÇÃO — REGRAS DE NEGÓCIO (VERSÃO MULTI-SEGMENTO)
1. Nova visão do produto

O sistema deixa de ser:

“SaaS de pedidos para restaurantes”

E passa a ser:

Plataforma de catálogo digital com pedidos para múltiplos segmentos de negócio

Segmentos suportados (fase 1)
🍕 Alimentação (restaurantes, pizzarias, hamburguerias)
👕 Moda (roupas, calçados)
🎁 Artesanato
🛍️ Varejo geral (produtos simples, cosméticos, perfumaria, etc.)
2. Novo conceito central: SEGMENTO
2.1 Definição

Cada tenant (restaurant) passa a ter um:

segment: 'food' | 'fashion' | 'handcraft' | 'retail'
2.2 Regra principal

O segmento define quais regras de negócio estão ativas no sistema

Isso impacta diretamente:

Criação de produto
Opções e customizações
Checkout
UI do catálogo
Regras de preço
3. Mudanças no modelo de dados
3.1 Tabela restaurants

Adicionar:

segment TEXT NOT NULL DEFAULT 'food'
3.2 Produtos — generalização

Hoje:

Muito orientado a comida (preço base + adicionais)

Novo modelo:

type ProductType = 'simple' | 'customizable' | 'variant' | 'composed'
Tipo	Uso
simple	Produto direto (perfume, roupa simples)
customizable	Produto com adicionais (hambúrguer)
variant	Produto com variações (tamanho, cor)
composed	Produto complexo (pizza meio a meio)
4. Engine de regras por segmento

Criar uma camada lógica (não só banco):

segmentRules = {
  food: {...},
  fashion: {...},
  handcraft: {...},
  retail: {...}
}
5. Regras por segmento
🍕 FOOD (restaurantes)

Mantém comportamento atual + ajustes:

Ativo:

Meio a meio ✅
Adicionais (extras) ✅
Grupos de opções ✅
Entrega / retirada ✅
Taxa de entrega ✅

Exclusivo:

half_and_half
delivery_fee
preparation workflow
👕 FASHION (roupas)

Novo comportamento:

❌ Meio a meio
❌ Observações complexas
✅ Variações (tamanho, cor)
✅ Controle de estoque por variação
✅ Imagens múltiplas por produto

Estrutura:

variants: [
  { size: 'P', color: 'Preto', stock: 10 },
  { size: 'M', color: 'Branco', stock: 5 }
]
🎁 ARTESANATO
Produtos únicos ou sob encomenda
Pode ter personalização simples (nome, cor, texto)
custom_fields: [
  { name: 'Nome para gravação', required: true }
]
❌ Sem estoque tradicional (opcional)
❌ Sem meio a meio
🛍️ RETAIL (genérico, inclui cosméticos / perfumaria)
Produtos simples
Variações opcionais
Checkout padrão
6. Mudanças no sistema de produtos
6.1 Substituir lógica atual por:
product_config = {
  type: 'simple' | 'variant' | 'customizable' | 'composed',
  allow_half_and_half: boolean,
  allow_variants: boolean,
  allow_custom_fields: boolean
}
7. Meio a meio (refatoração)

Hoje: hardcoded para pizza

Novo:

enabled_if:
  segment === 'food'
  AND product.type === 'composed'
8. Checkout adaptativo
8.1 Food
Entrega / retirada
Endereço obrigatório
Taxa de entrega
WhatsApp forte
8.2 Outros segmentos
Pode remover:
entrega obrigatória
taxa de entrega
Adicionar:
envio manual (combinar via WhatsApp)
retirada agendada
9. UI dinâmica por segmento
Dashboard
FOOD → Kanban
OUTROS → Lista simples + status
Página pública
Segmento	Layout
Food	Cardápio
Fashion	Loja estilo e-commerce
Artesanato	Catálogo + destaque visual
Beauty	Grid com kits
Retail	Loja simples
10. Onboarding (ALTERAÇÃO CRÍTICA)

Novo passo 1:

Escolha de segmento
Qual o tipo do seu negócio?

( ) Restaurante / Delivery
( ) Loja de roupas
( ) Artesanato
( ) Varejo / outros (inclui cosméticos, perfumaria, etc.)
Impacto imediato:
Define:
UI inicial
tipos de produto
regras habilitadas
11. Compatibilidade com base atual
Restaurantes existentes:
segment = 'food'

Nenhuma quebra.

12. Refatorações necessárias (técnicas)
Backend

Criar camada:

getSegmentRules(restaurant.segment)
Adaptar:
createOrder
getMenu
upsertProduct
Frontend
Condicionar:
Half builder
Product builder
Checkout steps
Banco
Adicionar:
segment
product_type
variants (json ou tabela)
custom_fields
13. Roadmap sugerido
Fase 1 (rápido)
Adicionar segment
Esconder meio a meio fora de food
Criar product_type
Fase 2
Variantes (roupa)
Custom fields (artesanato)
Fase 3
UI adaptativa completa
Checkout dinâmico
14. Novo posicionamento do produto

Antes:

“Sistema de pedidos para restaurantes”

Agora:

Plataforma de catálogo digital com pedidos para qualquer tipo de negócio

15. O maior ganho estratégico

Você deixa de ser:

❌ nichado (restaurantes)

E vira:

✅ plataforma escalável
✅ muito maior mercado
✅ mais SaaS de verdade
16. Insight importante (arquitetura)

Evite isso:

❌ if (segment === 'food') espalhado no código

Prefira:

rules = getSegmentRules(segment)

if (rules.allowHalfAndHalf) { ... }

Isso evita virar um monstro impossível de manter.

---

## 17. Fase 1 no repositório (implementado)

- **Banco:** migrações `20260418120000_multi_segment_product_type.sql` e `20260418210000_remove_beauty_segment.sql` — `restaurants.segment` com CHECK em `food | fashion | handcraft | retail` (valor legado `beauty` migra para `retail`). `products.product_type` inalterado. Aplicar no Supabase (SQL Editor, CLI ou MCP).
- **Regras centralizadas:** `src/lib/segment-rules.ts` — `getSegmentRules`, `canShowHalfAndHalf`.
- **Onboarding:** passo 1 inclui escolha de segmento; `createRestaurantBasicInfo` persiste `segment`.
- **UI / admin:** meio a meio e método de cobrança só com `allowHalfAndHalf` (segmento `food`); menu e produto respeitam segmento; formulário de produto com `product_type` limitado por segmento.
- **Compatibilidade:** tenants existentes recebem `segment = 'food'` pelo default SQL.