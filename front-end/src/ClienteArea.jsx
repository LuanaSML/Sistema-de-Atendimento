import { useState, useEffect, useCallback } from 'react'
import './ClienteArea.css'

function ClienteArea({ onBack, senhas, senhasChamadas, senhaChamandoAgora, gerarSenha, chamarSenha, removerSenhasExpiradas }) {
  const [currentView, setCurrentView] = useState('senha')
  const [senhaGerada, setSenhaGerada] = useState(null)
  const [tempoRestante, setTempoRestante] = useState({})
  const [, setUpdateTime] = useState(0)

  // Atualizar tempo restante de todas as senhas
  const atualizarTempoRestante = useCallback(() => {
    const agora = new Date()
    const novosTempos = {}
    
    senhas.forEach(senha => {
      if (!senha.chamada) {
        const diff = senha.dataExpiracao - agora
        if (diff > 0) {
          const minutos = Math.floor(diff / 60000)
          const segundos = Math.floor((diff % 60000) / 1000)
          novosTempos[senha.id] = { minutos, segundos, total: diff }
        } else {
          novosTempos[senha.id] = { minutos: 0, segundos: 0, total: 0 }
        }
      }
    })
    
    setTempoRestante(novosTempos)
  }, [senhas])

  // Verificar senhas expiradas e atualizar tempo restante a cada segundo
  useEffect(() => {
    atualizarTempoRestante()
    
    const interval = setInterval(() => {
      removerSenhasExpiradas()
      atualizarTempoRestante()
      // Forçar atualização para mostrar tempos das senhas chamadas em tempo real
      setUpdateTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senhas.length, removerSenhasExpiradas, senhasChamadas.length])

  const handleGerarSenha = (tipo) => {
    const novaSenha = gerarSenha(tipo)
    setSenhaGerada(novaSenha)
    setTimeout(() => {
      setSenhaGerada(null)
    }, 3000)
  }


  // Função para ordenar senhas seguindo o padrão: SP -> SE/SG (mais antiga) -> SP -> SE/SG -> etc.
  const ordenarSenhas = (senhasValidas) => {
    // Filtrar senhas válidas (não expiradas e não chamadas)
    const senhasAtivas = senhasValidas.filter(senha => {
      if (senha.chamada) return false
      const tempo = tempoRestante[senha.id]
      return tempo && tempo.total > 0
    })

    // Separar por tipo e ordenar por data (mais antiga primeiro)
    const spList = senhasAtivas
      .filter(s => s.tipo === 'PRIORITARIA')
      .sort((a, b) => a.data - b.data)
    
    const seList = senhasAtivas
      .filter(s => s.tipo === 'EXAMES')
      .sort((a, b) => a.data - b.data)
    
    const sgList = senhasAtivas
      .filter(s => s.tipo === 'GERAL')
      .sort((a, b) => a.data - b.data)

    // Criar fila intercalada seguindo o padrão: SP -> SE/SG -> SP -> SE/SG -> etc.
    const filaOrdenada = []
    let spIndex = 0

    // Combinar SE e SG em uma lista ordenada por data
    const seSgCombinada = [...seList, ...sgList].sort((a, b) => a.data - b.data)
    let seSgIndex = 0

    // Alternar entre SP e SE/SG
    while (spIndex < spList.length || seSgIndex < seSgCombinada.length) {
      // Adicionar SP se houver
      if (spIndex < spList.length) {
        filaOrdenada.push(spList[spIndex])
        spIndex++
      }

      // Adicionar SE ou SG (a mais antiga disponível) se houver
      if (seSgIndex < seSgCombinada.length) {
        filaOrdenada.push(seSgCombinada[seSgIndex])
        seSgIndex++
      }
    }

    return filaOrdenada
  }

  const senhasOrdenadas = ordenarSenhas(senhas)

  const formatarTempoRestante = (senha) => {
    if (!senha) return '00:00'
    
    const agora = new Date()
    const diff = senha.dataExpiracao - agora
    
    if (diff <= 0) return '00:00'
    
    const minutos = Math.floor(diff / 60000)
    const segundos = Math.floor((diff % 60000) / 1000)
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
  }

  const handleChamarSenha = (senha) => {
    if (!senha.chamada && senhasOrdenadas.length > 0) {
      chamarSenha(senhasOrdenadas[0].id)
    }
  }

  return (
    <div className="cliente-app">
      <header className="cliente-header">
        <div className="logo-container">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
            <path d="M9 12l2 2 4-4" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <div className="logo-text">
            <span>HEALTH</span>
            <span>PLAN</span>
          </div>
        </div>
        <h1 className="header-title">TIRE SUA SENHA</h1>
      </header>

      <div className="cliente-layout">
        <aside className="sidebar">
          <div 
            className={`sidebar-item ${currentView === 'senha' ? 'active' : ''}`}
            onClick={() => setCurrentView('senha')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 8h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1m0 0V6a4 4 0 1 1 8 0v2m-8 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>SENHA</span>
          </div>
          <div 
            className={`sidebar-item ${currentView === 'chamadas' ? 'active' : ''}`}
            onClick={() => setCurrentView('chamadas')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>CHAMADAS</span>
          </div>
          <div className="sidebar-item" onClick={onBack}>
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>SAIR</span>
          </div>
        </aside>

        <main className="cliente-main">
          {currentView === 'senha' ? (
            <>
              {senhaGerada && (
                <div className="senha-gerada-modal">
                  <div className="senha-gerada-content">
                    <h2>Senha Gerada!</h2>
                    <div className="senha-codigo">{senhaGerada.codigo}</div>
                    <div className="senha-tipo">{senhaGerada.tipo}</div>
                  </div>
                </div>
              )}
              <div className="buttons-container">
                <button 
                  className="cliente-button" 
                  onClick={() => handleGerarSenha('PRIORITARIA')}
                >
                  PRIORITARIA
                </button>
                <button 
                  className="cliente-button" 
                  onClick={() => handleGerarSenha('EXAMES')}
                >
                  EXAMES
                </button>
                <button 
                  className="cliente-button" 
                  onClick={() => handleGerarSenha('GERAL')}
                >
                  GERAL
                </button>
              </div>
            </>
          ) : (
            <div className="chamadas-display-container">
              {/* Painel "Chamando Agora" */}
              <div className="chamadas-panel">
                <div className="chamadas-panel-header">Chamando Agora:</div>
                <div className="chamadas-table">
                  {senhaChamandoAgora ? (
                    <div className="chamadas-row chamadas-row-odd">
                      <div className="chamadas-cell chamadas-cell-senha">
                        {senhaChamandoAgora.codigo}
                        <span className="chamadas-tempo"> ({formatarTempoRestante(senhaChamandoAgora)})</span>
                      </div>
                      <div className="chamadas-cell chamadas-cell-guiche">{senhaChamandoAgora.guiche || 'GUICHÊ-2'}</div>
                    </div>
                  ) : senhasOrdenadas.length > 0 ? (
                    <div 
                      className="chamadas-row chamadas-row-odd chamadas-row-clickable"
                      onClick={() => handleChamarSenha(senhasOrdenadas[0])}
                    >
                      <div className="chamadas-cell chamadas-cell-senha">
                        {senhasOrdenadas[0].codigo}
                        <span className="chamadas-tempo"> ({formatarTempoRestante(senhasOrdenadas[0])})</span>
                      </div>
                      <div className="chamadas-cell chamadas-cell-guiche">GUICHÊ-2</div>
                    </div>
                  ) : (
                    <div className="chamadas-row chamadas-row-odd">
                      <div className="chamadas-cell chamadas-cell-senha">-</div>
                      <div className="chamadas-cell chamadas-cell-guiche">-</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Painel "Últimas 5 Chamadas" */}
              <div className="chamadas-panel">
                <div className="chamadas-panel-header">Ultimas 5 Chamadas:</div>
                <div className="chamadas-table">
                  {senhasChamadas && senhasChamadas.length > 0 ? (
                    senhasChamadas.slice().reverse().slice(0, 5).map((senha, index) => {
                      return (
                        <div 
                          key={`chamada-${senha.id}-${index}`} 
                          className={`chamadas-row ${index % 2 === 0 ? 'chamadas-row-odd' : 'chamadas-row-even'}`}
                        >
                          <div className="chamadas-cell chamadas-cell-senha">
                            {senha.codigo}
                            <span className="chamadas-tempo"> ({formatarTempoRestante(senha)})</span>
                          </div>
                          <div className="chamadas-cell chamadas-cell-guiche">{senha.guiche || 'GUICHÊ-2'}</div>
                        </div>
                      )
                    })
                  ) : (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div 
                        key={`empty-${index}`}
                        className={`chamadas-row ${index % 2 === 0 ? 'chamadas-row-odd' : 'chamadas-row-even'}`}
                      >
                        <div className="chamadas-cell chamadas-cell-senha">-</div>
                        <div className="chamadas-cell chamadas-cell-guiche">-</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ClienteArea

