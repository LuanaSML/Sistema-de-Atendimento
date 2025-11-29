import { useState } from 'react'
import './App.css'
import fotoMain from './assets/foto-main.png'
import ClienteArea from './ClienteArea'
import AtendenteArea from './AtendenteArea'
import AdminArea from './AdminArea'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [senhaLogin, setSenhaLogin] = useState('')
  const [senhas, setSenhas] = useState([])
  const [senhasChamadas, setSenhasChamadas] = useState([])
  const [senhaChamandoAgora, setSenhaChamandoAgora] = useState(null)
  const [guicheAtual, setGuicheAtual] = useState(null)

  const gerarSenha = (tipo) => {
    const prefixo = tipo === 'PRIORITARIA' ? 'SP' : tipo === 'EXAMES' ? 'SE' : 'SG'
    
    // Obter data atual
    const agora = new Date()
    const ano = String(agora.getFullYear()).slice(-2)
    const mes = String(agora.getMonth() + 1).padStart(2, '0')
    const dia = String(agora.getDate()).padStart(2, '0')
    const dataStr = `${ano}${mes}${dia}`
    
    // Contar senhas do mesmo tipo geradas hoje
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const senhasHoje = senhas.filter(s => {
      const dataSenha = new Date(s.data)
      const diaSenha = new Date(dataSenha.getFullYear(), dataSenha.getMonth(), dataSenha.getDate())
      return s.tipo === tipo && diaSenha.getTime() === hoje.getTime()
    })
    
    const novoNumero = senhasHoje.length + 1
    const numeroFormatado = String(novoNumero).padStart(3, '0')
    
    // Tempos em minutos
    const tempoLimiteMinutos = tipo === 'PRIORITARIA' ? 15 : tipo === 'EXAMES' ? 1 : 5
    const dataCriacao = new Date()
    const tempoLimiteMs = tempoLimiteMinutos * 60 * 1000
    
    // Atribuir guichê aleatório (1 a 5)
    const guicheNumero = Math.floor(Math.random() * 5) + 1
    const guiche = `GUICHÊ-0${guicheNumero}`
    
    const novaSenha = {
      id: Date.now(),
      codigo: `${dataStr}-${prefixo}${numeroFormatado}`,
      tipo: tipo,
      numero: novoNumero,
      data: dataCriacao,
      dataExpiracao: new Date(dataCriacao.getTime() + tempoLimiteMs),
      tempoLimiteMinutos: tempoLimiteMinutos,
      prioridade: tipo === 'PRIORITARIA' ? 1 : 2,
      chamada: false,
      guiche: guiche
    }
    
    setSenhas([...senhas, novaSenha])
    return novaSenha
  }

  const chamarSenha = (senhaId, guicheAtendente = null) => {
    setSenhas(prevSenhas => {
      const senha = prevSenhas.find(s => s.id === senhaId)
      if (!senha || senha.chamada) return prevSenhas
      
      const dataChamada = new Date()
      // Usar o guichê do atendente se fornecido, senão usar o guichê da senha
      const guicheUsado = guicheAtendente || senha.guiche
      const senhaAtualizada = { ...senha, chamada: true, dataChamada, guiche: guicheUsado }
      
      // Definir como senha sendo chamada agora
      setSenhaChamandoAgora(senhaAtualizada)
      
      // Adicionar às senhas chamadas
      setSenhasChamadas(prev => {
        // Evitar duplicatas
        if (prev.some(s => s.id === senhaId)) return prev
        const nova = [...prev, senhaAtualizada]
        // Manter apenas as últimas 5
        return nova.slice(-5)
      })
      
      return prevSenhas.map(s => s.id === senhaId ? senhaAtualizada : s)
    })
  }

  const removerSenhasExpiradas = () => {
    setSenhas(prevSenhas => prevSenhas.filter(senha => {
      const agora = new Date()
      return senha.dataExpiracao > agora
    }))
  }

  const finalizarSenha = (senhaId) => {
    setSenhas(prevSenhas => {
      const senha = prevSenhas.find(s => s.id === senhaId)
      if (senha) {
        // Marcar como finalizada antes de remover
        const senhaFinalizada = { ...senha, finalizada: true, dataFinalizacao: new Date() }
        setSenhasChamadas(prev => prev.map(s => s.id === senhaId ? senhaFinalizada : s))
      }
      return prevSenhas.filter(s => s.id !== senhaId)
    })
    setSenhaChamandoAgora(null)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const senha = senhaLogin.toLowerCase().trim()
    
    if (senha === 'admin') {
      setShowLoginModal(false)
      setSenhaLogin('')
      setGuicheAtual(null)
      setCurrentPage('admin')
    } else if (senha.startsWith('guiche') && ['1', '2', '3', '4', '5'].includes(senha.slice(-1))) {
      const numeroGuiche = senha.slice(-1)
      setShowLoginModal(false)
      setSenhaLogin('')
      setGuicheAtual(`GUICHÊ-0${numeroGuiche}`)
      setCurrentPage('atendente')
    } else {
      alert('Senha incorreta!')
      setSenhaLogin('')
    }
  }

  if (currentPage === 'cliente') {
    return (
      <ClienteArea 
        onBack={() => setCurrentPage('home')}
        senhas={senhas}
        senhasChamadas={senhasChamadas}
        senhaChamandoAgora={senhaChamandoAgora}
        gerarSenha={gerarSenha}
        chamarSenha={chamarSenha}
        removerSenhasExpiradas={removerSenhasExpiradas}
      />
    )
  }

  if (currentPage === 'atendente') {
    return (
      <AtendenteArea 
        onBack={() => {
          setCurrentPage('home')
          setGuicheAtual(null)
        }}
        senhas={senhas}
        senhasChamadas={senhasChamadas}
        senhaChamandoAgora={senhaChamandoAgora}
        guicheAtual={guicheAtual}
        chamarSenha={chamarSenha}
        finalizarSenha={finalizarSenha}
      />
    )
  }

  if (currentPage === 'admin') {
    return (
      <AdminArea 
        onBack={() => {
          setCurrentPage('home')
          setGuicheAtual(null)
        }}
        senhas={senhas}
        senhasChamadas={senhasChamadas}
      />
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo-container">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
            <path d="M9 12l2 2 4-4" stroke="#1a365d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <div className="logo-text">
            <span>HEALTH</span>
            <span>PLAN</span>
          </div>
        </div>
        <h1 className="header-title">SISTEMA DE ATENDIMENTO</h1>
      </header>

      <main className="main-content">
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="image-container">
              <img src={fotoMain} alt="Atendimento" className="main-image" />
            </div>
          </div>

          <div className="panel right-panel">
            <div className="option-area">
              <div className="option" onClick={() => setCurrentPage('cliente')}>AREA DO CLIENTE</div>
              <div className="divider"></div>
              <div className="option" onClick={() => setShowLoginModal(true)}>AREA DE ATENDENTE</div>
            </div>
          </div>
      </div>
      </main>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="login-modal-header">INSIRA O CODIGO:</div>
            <form onSubmit={handleLogin} className="login-modal-form">
              <input
                type="password"
                className="login-input"
                value={senhaLogin}
                onChange={(e) => setSenhaLogin(e.target.value)}
                placeholder="Digite o código"
                autoFocus
              />
              <div className="login-modal-buttons">
                <button type="submit" className="login-button">ENTRAR</button>
                <button type="button" className="login-button-cancel" onClick={() => {
                  setShowLoginModal(false)
                  setSenhaLogin('')
                }}>
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
  )
}

export default App
