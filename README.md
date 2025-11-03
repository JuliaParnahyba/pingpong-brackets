# 🏓 PaddleUp!  

![Build Status](https://img.shields.io/github/actions/workflow/status/JuliaParnahyba/pingpong-brackets/deploy-pages.yml?branch=main&style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)
![Tech: Vite](https://img.shields.io/badge/Vite-^5.0-646CFF?logo=vite&style=for-the-badge)
![Tech: TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&style=for-the-badge)
![Tech: Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&style=for-the-badge)

> 🎮 Projeto em construção — novas funcionalidades e ajustes visuais estão a caminho!

<br>

## 🏓 Sobre o projeto  

**PaddleUp!** é um sistema leve e divertido para organizar **campeonatos de ping pong** entre amigos, colegas de trabalho ou qualquer grupo competitivo o bastante para disputar até o último ponto 😎  

Feito com **Vite + TypeScript + Tailwind**, o app gera e gerencia **chaves de torneio (brackets)** de forma rápida, visual e responsiva — direto do navegador!  

<br>

## 🎯 Objetivo  

Facilitar a criação e acompanhamento de torneios eliminatórios de ping pong, com design simples e navegação fluida.  
Ideal para encontros entre amigos, eventos corporativos ou torneios recreativos.

<br>

## 💻 Tecnologias utilizadas  

| Stack | Descrição |
|-------|------------|
| ⚡ **Vite** | Build rápido e moderno |
| 🧠 **TypeScript** | Tipagem estática e segurança no código |
| 🎨 **Tailwind CSS** | Estilo rápido e responsivo |
| 🐳 **Docker** | Ambiente padronizado e fácil de subir |
| ☁️ **GitHub Actions** | Deploy automático no GitHub Pages |

<br>

## 🚀 Como rodar localmente  

```bash
# Clone o repositório
git clone https://github.com/JuliaParnahyba/pingpong-brackets.git

# Acesse a pasta do projeto
cd pingpong-brackets

# Instale as dependências
npm install

# Execute o projeto localmente
npm run dev
```
_Acesse: [http://localhost:5173](http://localhost:5173)_

<br>

## 🐳 Rodando com Docker

```bash
# Subir o container
docker compose up -d
```
_Acesse: [http://localhost:5173](http://localhost:5173)_

<br>

## 🌍 Deploy
O deploy é realizado automaticamente via **GitHub Actions** sempre que um push é feito na branch `main`.
O workflow está em: `.github/workflows/deploy-pages.yml`.

<br> 

## 🌱 Contribuindo

Quer ajudar a melhorar o projeto? Ótimo! 💪
1. Faça um fork do repositório
2. Crie sua branch de feature baseada em `development`:
    ```bash
    git checkout -b feature/nome-da-feature development
    ```
3. Faça suas alterações
4. Faça commit seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/)
5. Envie um PR para a branch `development`
    > ⚠️ A branch `main` é protegida e recebe apenas merges revisados.

<br> 

## 🧑‍💻 Autoria e colaboração

Projeto mantido por [Julia Parnaíba](https://github.com/JuliaParnahyba) e aberto a contribuições da comunidade!

<br>

## ⚖️ Licença
Este projeto está sob a licença **MIT** — veja o arquivo `LICENSE` para mais detalhes.