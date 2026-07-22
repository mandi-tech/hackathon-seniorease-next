# Changelog e Regras de Versionamento

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado no
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto
adere ao [Semantic Versioning (SemVer)](https://semver.org/lang/pt-BR/).

---

## 📐 Regras de Versionamento Por Tag

As tags de versão seguem estritamente o formato **`vMAJOR.MINOR.PATCH`**
(Exemplo: `v1.2.3`):

1. **`MAJOR` (Versão Principal):** Incrementado quando há mudanças incompatíveis
   com versões anteriores (_Breaking Changes_) ou reestruturações completas de
   arquitetura.
   - _Exemplo:_ `v1.0.0` ➡️ `v2.0.0`
2. **`MINOR` (Versão Secundária):** Incrementado quando novas funcionalidades
   são adicionadas sem quebrar a compatibilidade com a versão atual.
   - _Exemplo:_ `v1.1.0` ➡️ `v1.2.0`
3. **`PATCH` (Correções):** Incrementado para correções de bugs, ajustes de
   layout/UI, atualizações de segurança ou pequenas otimizações de código.
   - _Exemplo:_ `v1.0.1` ➡️ `v1.0.2`

---

## 🏷️ Categorias de Mudança

Para cada versão lançada, categorize as alterações nos seguintes tópicos:

- `Adicionado`: Para novas funcionalidades.
- `Modificado`: Para alterações em funcionalidades já existentes.
- `Obsoleto`: Para funcionalidades que serão removidas em versões futuras.
- `Removido`: Para funcionalidades que foram removidas nesta versão.
- `Corrigido`: Para correção de falhas ou bugs.
- `Segurança`: Em caso de correção de vulnerabilidades.

---

## [Unreleased] - (Em Desenvolvimento)

### Adicionado

- Dockerfile multi-stage configurado para build standalone de Next.js.
- Script de automação `deploy.sh` para publicação no Docker Hub.
- Definição do padronizador de versionamento no `CHANGELOG.md`.

## [v1.0.1] - 2026-07-22

### Corrigido

- Loop infinito de re-renderizações e requisições HTTP no AuthProvider (`AuthContext.tsx`).
- Adicionado deploy automático via SSH na AWS EC2 no GitHub Actions.

---

## [v1.0.0] - 2026-07-20

### Adicionado

- Versão inicial estável pronta para deploy na AWS (ECS, App Runner ou EC2).
