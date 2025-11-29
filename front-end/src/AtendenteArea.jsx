import { useState, useEffect, useCallback } from 'react'
import './AtendenteArea.css'

function AtendenteArea({ onBack, senhas, senhasChamadas, senhaChamandoAgora, guicheAtual, chamarSenha, finalizarSenha }) {
  const [tempoRestante, setTempoRestante] = useState({})
  const [proximaSenha, setProximaSenha] = useState(null)

  // Função para ordenar senhas seguindo o padrão: SP -> SE/SG (mais antiga) -> SP -> SE/SG -> etc.
  const ordenarSenhas = useCallback((senhasValidas) => {
    // Filtrar apenas senhas do guichê atual
    const senhasDoGuiche = senhasValidas.filter(s => s.guiche === guicheAtual)
    
    const senhasAtivas = senhasDoGuiche.filter(senha => {
      if (senha.chamada) return false
      const agora = new Date()
      return senha.dataExpiracao > agora
    })

    const spList = senhasAtivas
      .filter(s => s.tipo === 'PRIORITARIA')
      .sort((a, b) => a.data - b.data)
    
    const seList = senhasAtivas
      .filter(s => s.tipo === 'EXAMES')
      .sort((a, b) => a.data - b.data)
    
    const sgList = senhasAtivas
      .filter(s => s.tipo === 'GERAL')
      .sort((a, b) => a.data - b.data)

    const filaOrdenada = []
    let spIndex = 0
    const seSgCombinada = [...seList, ...sgList].sort((a, b) => a.data - b.data)
    let seSgIndex = 0

    while (spIndex < spList.length || seSgIndex < seSgCombinada.length) {
      if (spIndex < spList.length) {
        filaOrdenada.push(spList[spIndex])
        spIndex++
      }
      if (seSgIndex < seSgCombinada.length) {
        filaOrdenada.push(seSgCombinada[seSgIndex])
        seSgIndex++
      }
    }

    return filaOrdenada
  }, [guicheAtual])

  const senhasOrdenadas = ordenarSenhas(senhas)

  useEffect(() => {
    if (senhasOrdenadas.length > 0) {
      setProximaSenha(senhasOrdenadas[0])
    } else {
      setProximaSenha(null)
    }
  }, [senhasOrdenadas])

  // Filtrar senha chamando agora apenas se for do guichê atual
  const senhaChamandoFiltrada = senhaChamandoAgora && senhaChamandoAgora.guiche === guicheAtual 
    ? senhaChamandoAgora 
    : null

  // Atualizar tempo restante
  const atualizarTempoRestante = useCallback(() => {
    const agora = new Date()
    const novosTempos = {}
    
    senhas.forEach(senha => {
      const diff = senha.dataExpiracao - agora
      if (diff > 0) {
        const minutos = Math.floor(diff / 60000)
        const segundos = Math.floor((diff % 60000) / 1000)
        novosTempos[senha.id] = { minutos, segundos, total: diff }
      } else {
        novosTempos[senha.id] = { minutos: 0, segundos: 0, total: 0 }
      }
    })
    
    setTempoRestante(novosTempos)
  }, [senhas])

  useEffect(() => {
    atualizarTempoRestante()
    const interval = setInterval(() => {
      atualizarTempoRestante()
    }, 1000)
    return () => clearInterval(interval)
  }, [atualizarTempoRestante])

  const formatarTempoRestante = (senha) => {
    if (!senha) return '00:00'
    const tempo = tempoRestante[senha.id]
    if (!tempo || tempo.total <= 0) return '00:00'
    return `${String(tempo.minutos).padStart(2, '0')}:${String(tempo.segundos).padStart(2, '0')}`
  }

  const handleChamar = () => {
    if (proximaSenha) {
      chamarSenha(proximaSenha.id, guicheAtual)
    }
  }

  const handleFinalizar = () => {
    if (senhaChamandoFiltrada) {
      finalizarSenha(senhaChamandoFiltrada.id)
    }
  }

  return (
    <div className="atendente-app">
      <div className="atendente-top-bar">
        <span className="atendente-top-text">GUICHE (ATENDENTE) TEM QUE TER TIPO 4 GUICHES</span>
      </div>

      <div className="atendente-layout">
        <aside className="atendente-sidebar">
          <div className="atendente-logo">
            <svg className="atendente-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
              <path d="M9 12l2 2 4-4" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="atendente-logo-text">HEALTH PLAN</span>
          </div>
          
          <div className="atendente-sidebar-item active">
            <svg className="atendente-sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 8h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1m0 0V6a4 4 0 1 1 8 0v2m-8 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>GUICHE</span>
          </div>
          
          <div className="atendente-sidebar-item" onClick={onBack}>
            <svg className="atendente-sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>SAIR</span>
          </div>
        </aside>

        <main className="atendente-main">
          <h1 className="atendente-title">{guicheAtual || 'GUICHÊ'}</h1>
          
          <div className="atendente-cards">
            <div className="atendente-card">
              <div className="atendente-card-header">Proxima Senha:</div>
              <div className="atendente-card-buttons">
                <button className="atendente-button" onClick={handleChamar} disabled={!proximaSenha}>
                  CHAMAR
                </button>
                <button className="atendente-button" onClick={handleFinalizar} disabled={!senhaChamandoFiltrada}>
                  FINALIZAR
                </button>
              </div>
              <div className="atendente-chamando">
                <div className="atendente-chamando-label">Chamando Agora:</div>
                <div className="atendente-chamando-senha">
                  {senhaChamandoFiltrada ? senhaChamandoFiltrada.codigo : '-'}
                </div>
              </div>
            </div>

            <div className="atendente-card">
              <div className="atendente-card-header">Fila Atual:</div>
              <div className="atendente-fila">
                {senhasOrdenadas.length > 0 ? (
                  senhasOrdenadas.slice(0, 5).map((senha, index) => (
                    <div 
                      key={senha.id}
                      className={`atendente-fila-item ${index % 2 === 0 ? 'fila-odd' : 'fila-even'}`}
                    >
                      {senha.codigo} ({formatarTempoRestante(senha)})
                    </div>
                  ))
                ) : (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div 
                      key={`empty-${index}`}
                      className={`atendente-fila-item ${index % 2 === 0 ? 'fila-odd' : 'fila-even'}`}
                    >
                      -
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AtendenteArea

