# Sistema de Atendimento - Como rodar

Pré-requisitos:
- Node.js 16+ instalado
- PowerShell no Windows (usuário já tem)

Passos (PowerShell):

```powershell
cd "D:\TRABALHO DE SISTEMA DE ATENDIMENTO\Sistema-de-Atendimento"
npm install
npm run dev   # ou npm start
```

- Abra `http://localhost:3000/` no navegador.
- `Tire sua senha` -> página para o cliente pegar a senha.
- `Painel do Atendente` -> botão para chamar o próximo; o painel atualiza em tempo real via Socket.IO.

Observações e próximos passos:
- O sistema usa apenas memória (reiniciar o servidor limpa filas e contadores).
- Para produção: persistir em banco, adicionar autenticação para atendentes e proteger endpoints.
