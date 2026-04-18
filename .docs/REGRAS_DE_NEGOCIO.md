# Regras de negócio e estrutura — Pedidos SaaS

Documento gerado a partir do código e do schema Supabase do repositório. Objetivo: alinhar o que **já está implementado**, **como os dados se relacionam** e **onde há divergências** entre documentação implícita (comentários/types) e o comportamento real.

---

## 1. Visão geral do produto

O projeto é um **SaaS de pedidos para restaurantes** em Next.js (App Router) + Supabase (Postgres, Auth, Storage, Realtime). Há três frentes principais:

| Área | Rota / canal | Público |
|------|----------------|---------|
| **Marketing do SaaS** | `/` | Visitantes (landing) |
| **Painel do restaurante** | `/dashboard/*` | Dono autenticado (`owner_id` = `auth.users`) |
| **Loja pública do restaurante** | `/lp/[slug]/*` | Cliente final (sem conta obrigatória; identificação por telefone) |

Fluxo de valor: o restaurante configura cardápio e identidade visual; o cliente monta o carrinho, finaliza o checkout e o pedido é gravado no banco; o admin acompanha em um **quadro Kanban** com atualização em tempo real; opcionalmente há **agente de IA** atendendo via WhatsApp (Evolution API).

---

## 2. Modelo de negócio: multi-tenant por restaurante

- **Tenant** = registro em `restaurants`.
- Cada restaurante possui `slug` **único** (URL pública `/lp/{slug}`).
- **Propriedade**: `restaurants.owner_id` referencia `auth.users`. O middleware protege `/dashboard/*` exigindo usuário logado; o restaurante ativo é obtido por `owner_id = user.id` (`getOwnerRestaurant`).
- **Assinatura (campo, não fluxo Stripe completo no código analisado)**: `subscription_status` com valores esperados `active | trialing | past_due | canceled`; no onboarding o restaurante nasce em `trialing`. `stripe_customer_id` existe para integração futura ou externa.

### 2.1 Entidades principais (domínio)

| Entidade | Papel de negócio |
|----------|------------------|
| `restaurants` | Dados do estabelecimento, taxa de entrega, horários, cores, banner, fonte, métodos de pagamento aceitos, status “aberto/fechado”, endereço detalhado, configuração de IA (`ai_config`), método de preço **meio a meio** (`half_and_half_pricing_method`), onboarding. |
| `categories` | Agrupamento do menu; `display_order`; opcional `allows_half_and_half`. |
| `products` | Item vendável; `base_price`; `is_active`; pertence a uma categoria; opcional `allows_half_and_half`. |
| `product_option_groups` | Grupos de personalização (ex.: Tamanho, Borda): `type` = `single` ou `multiple`, `min_selection`, `max_selection`, `price_rule` = `sum | highest | average`. |
| `product_options` | Opções dentro do grupo com `price_modifier` e `is_available`. |
| `customers` | Cliente identificado principalmente por **telefone** (`phone` único no schema de migração); nome, e-mail; no app também é usado `restaurant_id` para vínculo com o restaurante atual. |
| `customer_addresses` | Endereços salvos do cliente; um pode ser `is_default`. |
| `orders` | Pedido: valor total, tipo entrega/retirada, endereço, forma de pagamento, status operacional, `customer_id`. |
| `order_items` | Linha do pedido: quantidade, preços, `options_selected` (JSON snapshot), opcional `half_and_half` (JSON), opcional `observations`. |
| `chat_messages` | Mensagens (contexto WhatsApp/agente) — ver migrações. |
| `ai_agent_configs`, `ai_conversations` | Configuração e conversas do agente por `restaurant_id`. |

---

## 3. Regras por domínio (implementadas)

### 3.1 Restaurante e configurações

- **Slug**: deve ser único; `checkSlugAvailability` e `createRestaurantBasicInfo` bloqueiam slug já usado.
- **Endereço**: pode ser composto (CEP, rua, número, complemento, bairro, cidade, estado) além do campo legado `address` (string concatenada).
- **Taxa de entrega** (`delivery_fee`): valor numérico; no checkout soma ao total **somente** se `delivery_type === 'delivery'`.
- **Valor mínimo do pedido** (`minimum_order_value`): persistido no onboarding; **não foi localizada validação obrigatória no checkout** no trecho analisado (regra de produto a confirmar na UI).
- **Loja aberta** (`is_open`): controla disponibilidade; atualização via settings com revalidação da página pública.
- **Horários** (`opening_hours`): objeto JSON por dia com `open`, `close`, `enabled`.
- **Métodos de pagamento do restaurante** (`payment_methods`): flags `cash`, `credit`, `debit`, `pix`, `voucher` — usados para o restaurante definir o que aceita; o checkout do cliente usa um conjunto próximo (ver 3.4).
- **Personalização visual**: cores, `logo_url`, `banner_url`, `font_family` — atualizáveis pelo admin/customização.
- **Meio a meio (nível restaurante)**: `half_and_half_pricing_method` define como combinar preço das duas metades: `highest` (padrão se vazio), `average` ou `sum`.

### 3.2 Cardápio (menu público)

- `getMenu` retorna categorias ordenadas por `display_order` e apenas produtos `is_active = true`, com grupos e opções aninhados.
- **Produto inativo** não aparece no menu público.
- **Upsert de produto** (`upsertProduct`): ao editar, grupos de opções existentes do produto são **apagados e recriados** (comentário no código: seguro porque pedidos guardam snapshot em JSON, não FK para opções).
- **Categoria**: pode marcar `allows_half_and_half`; produto também pode ter `allows_half_and_half`.
- **Ordem de categorias**: `updateCategoryOrder` atualiza `display_order` por lista.

### 3.3 Carrinho (cliente)

- Persistência local (Zustand + `persist`): chave `pedidos-cart-storage`.
- **Um carrinho por restaurante**: ao adicionar item de outro `restaurantId`, o fluxo pede confirmação e limpa o carrinho.
- **Mesclagem de linhas**: itens “idênticos” (mesmo produto, mesmas opções ou mesmo par meio-a-meio com mesmas opções nas duas metades) **incrementam quantidade** e recalculam `totalPrice` proporcionalmente.
- **Observação em item simples**: pode ser anexada como opção sintética `group_name: 'Observação'` (não aplica da mesma forma em meio a meio no store — observação no builder é separada).
- **Total do carrinho**: soma dos `totalPrice` dos itens (sem taxa de entrega; taxa entra no checkout).

### 3.4 Meio a meio (regra de preço)

- Disponível em fluxo dedicado (`HalfAndHalfBuilder`) para categorias/produtos habilitados.
- Preço de cada metade: `base_price` + acréscimos das opções respeitando `price_rule` do grupo (`sum`, `highest`, `average`).
- Preço final da pizza meio a meio (antes da quantidade): conforme `restaurant.half_and_half_pricing_method`.
- Validação de opções obrigatórias: em `config_options`, todos os grupos com `min_selection > 0` precisam ter seleção suficiente para avançar.

### 3.5 Checkout e pedido

**Etapas do checkout (UI):**

1. Dados: telefone (mínimo 10 dígitos numéricos), nome (mín. 2 caracteres), e-mail opcional. Busca cliente por telefone com variações (com/sem DDI 55).
2. Entrega: `delivery` ou `pickup`. Se entrega: endereço salvo **ou** novo (rua, número, bairro, cidade obrigatórios); opcional salvar endereço como padrão.
3. Pagamento: `pix | card_machine | money`; em dinheiro pode informar “troco para”.
4. Confirmação e envio.

**Criação de pedido (`createOrder`):**

- Exige `customerId` (cliente já criado/atualizado por `findOrCreateCustomer`).
- Gera `orderId` e timestamps no servidor.
- **Status inicial** gravado como `'pending'` (diferente do default comentado no schema base `'new'` — ver seção 6).
- `total_amount` = total informado pelo cliente (checkout usa `carrinho + taxa de entrega` quando delivery).
- Itens: `unit_price` recebe `item.product.base_price` (para meio a meio o preço “de exibição” no card pode ser o calculado no item; vale validar consistência com `total_price`).
- `options_selected` = opções do carrinho; meio a meio vai em coluna `half_and_half`; observação em `observations` se houver.

**Pós-sucesso:**

- Monta mensagem formatada e abre WhatsApp Web (`wa.me/{whatsapp_number}`) com o resumo do pedido.
- Limpa carrinho e redireciona para `/lp/[slug]/my-orders`.

**Cliente (`findOrCreateCustomer`):**

- Busca por `phone` único; se existe, atualiza nome/e-mail e pode **atualizar `restaurant_id`** para o restaurante atual (cliente “último restaurante” — implicação: cliente global por telefone, não isolado por tenant no banco).

### 3.6 Pedidos — ciclo de vida (admin)

**Colunas do quadro:** `pending` (rótulo “Novos”), `preparing`, `delivery`, `completed`.

**Mapeamento na listagem:**

- Coluna “Novos”: `status === 'pending' || status === 'new'`.

**Transições nos botões do card:**

- `new` ou `pending` → botão “Aceitar” → `preparing`
- `preparing` → “Enviar” → `delivery`
- `delivery` → “Concluir” → `completed`

**Realtime:** inscrição Postgres em `orders` filtrada por `restaurant_id`; em INSERT busca o pedido completo com itens e cliente.

### 3.7 Dashboard (métricas)

- Contagens e receita do dia vs. ontem; novos clientes hoje vs. ontem.
- “Entregas ativas”: query usa status `preparing` e **`out_for_delivery`** — **não coincide** com o Kanban que usa `delivery` (ver seção 6).
- Gráfico de 7 dias: soma `total_amount` excluindo `canceled`.

### 3.8 Clientes (admin)

- Lista por restaurante com busca por nome/telefone; contagem de pedidos agregada.
- Detalhe: perfil + histórico de pedidos com itens.

### 3.9 Onboarding do restaurante (wizard)

Sequência e persistência de `onboarding_step` / `onboarding_completed`:

1. Dados básicos + endereço + slug + WhatsApp → `onboarding_step: 1`, `subscription_status: trialing`
2. Customização (logo, cores) → step 2
3. Pagamento/entrega (métodos, taxa, mínimo) → step 3
4. Horário de funcionamento → step 4
5. Primeira categoria → step 5
6. Primeiro produto (sem opções avançadas no passo) → conclusão com `onboarding_completed: true`, step 6

**Regra de slug** repetida: indisponível se já existir.

### 3.10 Agente de IA e WhatsApp

- **API** `/api/agent`: processa mensagem + `restaurantId` (+ telefone para contexto do cliente).
- **Funções do agente** (`agent-functions.ts`): listar produtos, criar/atualizar **rascunho** de pedido (`create_draft_order`), **confirmar** pedido (`confirm_order`) — o prompt enfatiza que sem `confirm_order` o pedido não persiste.
- **Webhook** `/api/webhooks/whatsapp`: Evolution API; exige `?restaurantId=`; encaminha texto para o agente e, se configurado, responde via API Evolution (`EVOLUTION_*`).

### 3.11 Histórico do cliente (público)

- `getCustomerOrders` usa RPC `get_customer_orders` (definida nas migrações/Supabase) para contornar RLS na leitura dos pedidos do cliente.

---

## 4. Estrutura técnica ligada à regra de negócio

| Camada | Responsabilidade |
|--------|------------------|
| **Server Actions** (`src/actions/*`) | CRUD restaurante/menu/pedidos/config, onboarding, cliente, dashboard stats, agente. |
| **Stores** (`cart-store`, `customer-store`) | Estado de carrinho e sessão do cliente no browser (persistido). |
| **Supabase RLS** | Leitura pública ampla para cardápio; políticas amplas em `orders` / `order_items` em migração de correção (“Anyone can …”) para permitir checkout e agente — **implica risco de segurança em produção** se anon key for exposta. Dono: políticas por `owner_id` em `restaurants` e políticas de menu para owner (migrações `fix_menu_rls`). |
| **Middleware** | Protege apenas rotas que batem com o matcher (inclui `/dashboard`). |

---

## 5. O que está fora de escopo ou incompleto no código analisado

- **Pagamento online**: Stripe aparece como dependência e campo `stripe_customer_id`, mas **não há fluxo completo de cobrança** descrito nas actions lidas.
- **Valor mínimo do pedido**: campo existe; validação no checkout não foi encontrada nesta análise.
- **Consistência de status**: schema comenta `new, confirmed, preparing, delivery, …`; app usa `pending` na criação e trata `new` no quadro; dashboard usa `out_for_delivery` para “entregas ativas”.
- **Segurança RLS**: políticas permissivas em pedidos/itens facilitam MVP mas não implementam isolamento forte por tenant na escrita anônima.

---

## 6. Inconsistências e riscos (para alinhamento de produto)

1. **`orders.status`**: criação com `'pending'` vs. default `'new'` no SQL inicial vs. tipo TypeScript que lista `confirmed`, etc.
2. **Entregas ativas no dashboard**: filtro `out_for_delivery` vs. Kanban usando `delivery`.
3. **`unit_price` em `order_items`**: sempre `product.base_price` na inserção; para meio a meio o `total_price` vem do carrinho — conferir se `unit_price` deveria refletir preço unitário real da linha.
4. **Cliente multi-restaurante**: telefone único + `restaurant_id` atualizável pode misturar contexto entre tenants.
5. **RLS “anyone”** em pedidos: adequado só com outros controles (service role, edge functions, ou chave não pública).
6. **Schema vs. migrações**: `supabase/schema.sql` documenta `customers.restaurant_id`, mas a migração `20260118091112_create_customers_tables.sql` cria `customers` só com `phone` único global — se o banco foi criado só por migrações, pode ser necessário alinhar colunas com o que o código (`findOrCreateCustomer`, seeds) espera.

---

## 7. Referências rápidas de arquivos

| Tema | Arquivo(s) |
|------|------------|
| Schema base | `supabase/schema.sql` |
| Migrações (clientes, meio a meio, RLS pedidos, IA, etc.) | `supabase/migrations/*.sql` |
| Tipos de domínio | `src/types/index.ts` |
| Pedido + menu público | `src/actions/restaurant.ts` |
| Admin menu/pedidos/clientes | `src/actions/admin.ts` |
| Config loja | `src/actions/settings.ts` |
| Onboarding | `src/actions/onboarding-actions.ts` |
| Cliente/checkout | `src/actions/customer.ts`, `src/components/public/checkout-form.tsx` |
| Carrinho | `src/store/cart-store.ts` |
| Meio a meio | `src/components/public/half-and-half-builder.tsx` |
| Kanban + realtime | `src/app/(admin)/dashboard/orders/orders-board.tsx` |
| Métricas | `src/actions/dashboard.ts` |
| Agente | `src/lib/agent-functions.ts`, `src/app/api/agent/route.ts`, `src/app/api/webhooks/whatsapp/route.ts` |

---

*Este documento reflete o estado do repositório na data da análise. Após alterações em schema ou actions, revise as seções 3 e 6.*
