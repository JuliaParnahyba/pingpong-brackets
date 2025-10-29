# 🏓 PingPong Brackets

Sisteminha PWA (React + TS) para campeonatos de ping pong entre amigas:
- Cadastro de jogadoras e modelo (jogo único / sets)
- Geração de chaves (eliminação simples)
- Placar ao vivo com vitória por 2 pontos
- Avanço automático nas chaves

## Dev com Docker
```bash
# criar o app (primeira vez)
docker compose run --rm web sh -lc "npm create vite@latest . -- --template react-ts && npm i"

# subir ambiente de desenvolvimento
docker compose up

# build de produção
docker compose run --rm web npm run build
# preview do build
docker compose run --rm --service-ports web sh -lc "npm run preview -- --host 0.0.0.0 --port 4173"
```

### Commit inicial
```bash
git add .
git commit -m "chore(repo): bootstrap repository with Docker Compose, ignore files and basic README"
```