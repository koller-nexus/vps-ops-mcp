# vps-ops-mcp

Servidor [MCP](https://modelcontextprotocol.io) (stdio) que opera uma VPS por SSH. O Cursor e o Codex sobem o processo com `bun` e chamam ferramentas de leitura (saúde do host, debug Unix, Docker, Compose, Swarm, firewall) e de mutação (restart, stop, start, prune), com confirmação explícita nas mutações.

O transporte é stdio. Não abra o servidor como um processo longo na mão: o cliente (Cursor ou Codex) é quem o inicia.

## Contribuição

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) (branches, pull requests, verificação) e [ISSUE.md](./ISSUE.md) (como abrir uma issue).

## Requisitos

- [Bun](https://bun.sh)
- Python 3 (usado pelos scripts de registro)
- Cliente OpenSSH (`ssh` no `PATH`)
- Chave privada SSH legível, com acesso ao usuário remoto
- No host remoto: Docker (e `sudo -n` para `ufw`, `fail2ban`, `sshd -T`, `ss` e `dmesg`, se for usar essas ferramentas)

## Configuração

```bash
cp .env.example .env
```

Edite `.env`. O arquivo está no `.gitignore`.

| Variável | Obrigatória | Padrão | Função |
| --- | --- | --- | --- |
| `VPS_SSH_KEY_PATH` | sim | — | Caminho absoluto da chave privada. O processo recusa subir se o arquivo não existir ou não for legível. |
| `VPS_HOST` | não | `vps.example.invalid` | Host SSH (placeholder; set your own host). |
| `VPS_USER` | não | `ubuntu` | Usuário SSH. |
| `VPS_PORT` | não | `22` | Porta SSH. |
| `VPS_COMPOSE_DIR` | não | — | Diretório absoluto do Compose **na VPS**. Sem isso, as ferramentas de Compose exigem o argumento `dir`. |
| `VPS_COMMAND_TIMEOUT_MS` | não | `30000` | Timeout do comando remoto. Estouro devolve `exit_code` 124. |
| `VPS_LOG_MAX_BYTES` | não | `200000` | Teto de `stdout`/`stderr`. O excesso é cortado e `truncated` fica `true`. |
| `VPS_ALLOW_MUTATIONS` | não | `true` | `false`, `0`, `no` ou `off` desliga todas as mutações. |
| `VPS_SSH_KEY_PASSPHRASE` | não | — | Evite. Prefira `ssh-agent`. Os scripts de registro **não** copiam esta variável para o cliente. |

`VPS_COMPOSE_DIR` precisa ser absoluto e casar com `/^[a-zA-Z0-9/_.-]+$/` (começa com `/`).

## Instalação

```bash
bun install
```

Pacote npm (requer [Bun](https://bun.sh); o registry MCP aponta para este artefato):

```bash
bunx @kollernexus/vps-ops-mcp
```

Nome no MCP Registry: `io.github.koller-nexus/vps-ops-mcp`. O registry só publica metadados depois do pacote existir no npm público.

## Registrar nos clientes

Os scripts gravam a configuração do MCP com as variáveis **já exportadas no shell**. Eles não leem `.env` sozinhos. Sem exportar, entram os padrões do script (host, usuário, porta e um caminho de chave local).

Faça isto uma vez, na raiz do repositório, antes de cada script:

```bash
set -a
source .env
set +a
```

Cada execução faz backup do arquivo de destino (`*.bak.YYYYMMDDHHMMSS`) e substitui só o servidor `vps-ops`. Os outros servidores MCP permanecem.

Variáveis opcionais dos scripts:

| Variável | Padrão | Função |
| --- | --- | --- |
| `MCP_PROJECT_DIR` | raiz deste repositório | De onde sai o caminho de `src/index.ts`. |
| `CURSOR_MCP_JSON` | `~/.cursor/mcp.json` | Arquivo do Cursor a atualizar. |
| `CODEX_CONFIG` | `~/.codex/config.toml` | Arquivo do Codex a atualizar. |

`VPS_COMPOSE_DIR` só entra na config do cliente se estiver definida e não vazia.

### Cursor

Registro global (vale em qualquer workspace):

```bash
./scripts/register-cursor-mcp.sh
```

O script escreve em `~/.cursor/mcp.json`, no formato:

```json
{
  "mcpServers": {
    "vps-ops": {
      "command": "bun",
      "args": ["/caminho/absoluto/vps-ops-mcp/src/index.ts"],
      "env": {
        "VPS_HOST": "seu.host",
        "VPS_USER": "ubuntu",
        "VPS_PORT": "22",
        "VPS_SSH_KEY_PATH": "/caminho/absoluto/chave",
        "VPS_COMMAND_TIMEOUT_MS": "30000",
        "VPS_LOG_MAX_BYTES": "200000",
        "VPS_ALLOW_MUTATIONS": "true"
      }
    }
  }
}
```

Para limitar a um projeto, aponte o script para o `mcp.json` desse projeto:

```bash
CURSOR_MCP_JSON="/caminho/do/projeto/.cursor/mcp.json" ./scripts/register-cursor-mcp.sh
```

Depois: recarregue a janela do Cursor (Command Palette → **Developer: Reload Window**) ou reinicie o servidor em **Settings → MCP**. O servidor aparece como `vps-ops`.

### Codex

```bash
./scripts/register-codex-mcp.sh
```

O script escreve em `~/.codex/config.toml`:

```toml
[mcp_servers.vps-ops]
command = "bun"
args = ["/caminho/absoluto/vps-ops-mcp/src/index.ts"]

[mcp_servers.vps-ops.env]
VPS_HOST = "seu.host"
VPS_USER = "ubuntu"
VPS_PORT = "22"
VPS_SSH_KEY_PATH = "/caminho/absoluto/chave"
VPS_COMMAND_TIMEOUT_MS = "30000"
VPS_LOG_MAX_BYTES = "200000"
VPS_ALLOW_MUTATIONS = "true"
```

Feche e abra a sessão do Codex para ele reler o `config.toml`. Se o CLI estiver no `PATH`, `codex mcp list` deve mostrar `vps-ops`.

## Verificar

Teste o SSH fora do MCP (os mesmos flags que o servidor usa):

```bash
ssh -i "$VPS_SSH_KEY_PATH" \
  -o BatchMode=yes \
  -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=accept-new \
  -p "${VPS_PORT:-22}" \
  "${VPS_USER}@${VPS_HOST}" \
  'uname -a'
```

No Cursor ou no Codex, peça para chamar `vps_ping`. A resposta é JSON:

```json
{
  "exit_code": 0,
  "stdout": "...",
  "stderr": "",
  "duration_ms": 0,
  "truncated": false
}
```

`exit_code` diferente de 0 marca a chamada como erro no MCP. Se o processo sair na hora com `VPS_SSH_KEY_PATH is required` ou `missing or unreadable`, a variável não chegou no `env` do cliente — rode o script de registro de novo com o `.env` exportado.

## Ferramentas

Toda chamada devolve `exit_code`, `stdout`, `stderr`, `duration_ms` e `truncated`.

### Leitura

| Ferramenta | Argumentos | O que faz |
| --- | --- | --- |
| `vps_ping` | — | `uname -a`, `uptime`, `hostname`. |
| `vps_resources` | — | `df -h`, `free -h`, load average. |
| `vps_journal` | `unit`, `n?` (1–500, padrão 100) | `journalctl -u`. Unidade da lista (`docker`, `sshd`, `fail2ban`, `ufw`, `cron`, com ou sem `.service`) ou um nome seguro terminado em `.service`. |
| `docker_ps` | — | `docker ps -a` em JSON lines. |
| `docker_inspect` | `name` | `docker inspect`. |
| `docker_logs` | `name`, `n?` (1–1000, padrão 200), `since?` | `docker logs --tail --timestamps`. |
| `docker_stats` | — | `docker stats --no-stream`. |
| `docker_service_ls` | — | `docker service ls` em JSON lines (Swarm). |
| `docker_node_ls` | — | `docker node ls` em JSON lines (Swarm). |
| `compose_ps` | `dir?` | `docker compose ps` em `dir` ou `VPS_COMPOSE_DIR`. |
| `host_listen` | — | `ss -lntup` (`sudo -n`, senão sem sudo). |
| `host_failed_units` | — | `systemctl --failed --no-pager --full`. |
| `host_top` | — | Top 30 processos por memória (`ps aux --sort=-%mem`). |
| `host_dmesg` | `n?` (1–200, padrão 100) | `dmesg -T` + `tail` (`sudo -n`, senão sem sudo). |
| `host_firewall` | — | `ufw status verbose` (`sudo -n`, senão sem sudo). |
| `host_fail2ban` | `jail?` | `fail2ban-client status` (`sudo -n`). |
| `ssh_hardening_check` | — | `sshd -T` filtrado: porta, password, root login, pubkey. |

Nomes de container, serviço, imagem e jail precisam casar com `^[a-zA-Z0-9][a-zA-Z0-9_.-]*$`.

### Mutação

Exigem `confirm: true`. Com `VPS_ALLOW_MUTATIONS=false`, todas são recusadas.

| Ferramenta | Argumentos extra | Comando remoto |
| --- | --- | --- |
| `docker_restart` | `name` | `docker restart` |
| `docker_stop` | `name` | `docker stop` |
| `docker_start` | `name` | `docker start` |
| `compose_up` | `dir?`, `services?` | `docker compose up -d` |
| `compose_restart` | `dir?`, `services?` | `docker compose restart` |
| `compose_pull_up` | `dir?`, `services?` | `docker compose pull` e depois `up -d` |
| `docker_rm` | `name`, `force_name` | `docker rm -f`. `force_name` tem de ser igual a `name`. |
| `disk_cleanup_docker` | `confirm_volumes?` | `docker system prune -f`. Volumes só com `confirm_volumes: true`. |

## Segurança

- Comandos remotos são fixos. Não existe ferramenta de shell livre.
- Argumentos de nome e caminho passam por allowlist e são citados no shell.
- SSH usa `BatchMode=yes`, `IdentitiesOnly=yes` e `StrictHostKeyChecking=accept-new`.
- Mutação sem `confirm: true` é recusada. `docker_rm` pede o nome duas vezes. Prune de volumes pede `confirm_volumes: true`.
- Para um cliente só de leitura, registre com `VPS_ALLOW_MUTATIONS=false`.
