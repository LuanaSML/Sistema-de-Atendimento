import { useState, useEffect, useCallback } from 'react'
import './AdminArea.css'

function AdminArea({ onBack, senhas, senhasChamadas }) {
  const [currentView, setCurrentView] = useState('fila')
  const [tempoRestante, setTempoRestante] = useState({})
  const [periodo, setPeriodo] = useState('diario')
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0])

  // Atualizar tempo restante
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

  useEffect(() => {
    // Chamar uma vez após o mount usando setTimeout
    const timeout = setTimeout(() => {
      atualizarTempoRestante()
    }, 0)
    
    const interval = setInterval(() => {
      atualizarTempoRestante()
    }, 1000)
    
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [atualizarTempoRestante])

  const formatarData = (data) => {
    const d = new Date(data)
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    const ano = String(d.getFullYear()).slice(-2)
    const hora = String(d.getHours()).padStart(2, '0')
    const minuto = String(d.getMinutes()).padStart(2, '0')
    return `${dia}/${mes}/${ano} - ${hora}:${minuto}`
  }

  // Separar senhas por tipo e guichê
  const senhasPrioritarias = senhas
    .filter(s => s.tipo === 'PRIORITARIA' && !s.chamada)
    .filter(s => {
      const tempo = tempoRestante[s.id]
      return tempo && tempo.total > 0
    })
    .sort((a, b) => a.data - b.data)

  const senhasGerais = senhas
    .filter(s => s.tipo === 'GERAL' && !s.chamada)
    .filter(s => {
      const tempo = tempoRestante[s.id]
      return tempo && tempo.total > 0
    })
    .sort((a, b) => a.data - b.data)

  const senhasExames = senhas
    .filter(s => s.tipo === 'EXAMES' && !s.chamada)
    .filter(s => {
      const tempo = tempoRestante[s.id]
      return tempo && tempo.total > 0
    })
    .sort((a, b) => a.data - b.data)

  return (
    <div className="admin-app">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <svg className="admin-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
              <path d="M9 12l2 2 4-4" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <div className="admin-logo-text">
              <span>HEALTH</span>
              <span>PLAN</span>
            </div>
          </div>
          
          <div 
            className={`admin-sidebar-item ${currentView === 'fila' ? 'active' : ''}`}
            onClick={() => setCurrentView('fila')}
          >
            <svg className="admin-sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>FILA</span>
          </div>
          
          <div 
            className={`admin-sidebar-item ${currentView === 'senhas' ? 'active' : ''}`}
            onClick={() => setCurrentView('senhas')}
          >
            <svg className="admin-sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
              <circle cx="12" cy="5" r="1" fill="currentColor"/>
              <circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
            <span>SENHAS</span>
          </div>
          
          <div 
            className={`admin-sidebar-item ${currentView === 'relatorios' ? 'active' : ''}`}
            onClick={() => setCurrentView('relatorios')}
          >
            <svg className="admin-sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>RELATORIOS</span>
          </div>
          
          <div className="admin-sidebar-item" onClick={onBack}>
            <svg className="admin-sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>SAIR</span>
          </div>
        </aside>

        <main className="admin-main">
          {currentView === 'fila' && (
            <>
              <h1 className="admin-title">FILA</h1>
              <div className="admin-fila-container">
                <div className="admin-fila-column">
                  <div className="admin-fila-header">PRIORITARIA</div>
                  <div className="admin-fila-items">
                    {senhasPrioritarias.length > 0 ? (
                      senhasPrioritarias.map((senha) => (
                        <div key={senha.id} className="admin-fila-item">
                          <div className="admin-fila-codigo">{senha.codigo}</div>
                          <div className="admin-fila-data">{formatarData(senha.data)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="admin-fila-item empty">-</div>
                    )}
                  </div>
                </div>

                <div className="admin-fila-column">
                  <div className="admin-fila-header">GERAL</div>
                  <div className="admin-fila-items">
                    {senhasGerais.length > 0 ? (
                      senhasGerais.map((senha) => (
                        <div key={senha.id} className="admin-fila-item">
                          <div className="admin-fila-codigo">{senha.codigo}</div>
                          <div className="admin-fila-data">{formatarData(senha.data)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="admin-fila-item empty">-</div>
                    )}
                  </div>
                </div>

                <div className="admin-fila-column">
                  <div className="admin-fila-header">EXAMES</div>
                  <div className="admin-fila-items">
                    {senhasExames.length > 0 ? (
                      senhasExames.map((senha) => (
                        <div key={senha.id} className="admin-fila-item">
                          <div className="admin-fila-codigo">{senha.codigo}</div>
                          <div className="admin-fila-data">{formatarData(senha.data)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="admin-fila-item empty">-</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {currentView === 'senhas' && (
            <>
              <h1 className="admin-title">SENHAS</h1>
              
              {/* Gráfico de Senhas por Hora */}
              <div className="admin-chart-container">
                <h2 className="admin-chart-title">Senhas emitidas por hora</h2>
                <div className="admin-chart">
                  {(() => {
                    const horas = [8, 9, 10, 11, 12, 13, 14, 15, 17]
                    const dadosPorHora = horas.map(hora => {
                      return senhas.filter(s => {
                        const dataSenha = new Date(s.data)
                        return dataSenha.getHours() === hora
                      }).length
                    })
                    // Calcular o valor máximo dinamicamente
                    const maxValue = Math.max(...dadosPorHora, 1) // Mínimo de 1 para evitar divisão por zero
                    // Arredondar para cima para o próximo múltiplo de 2 ou 5, dependendo do valor
                    const maxYAxis = maxValue <= 10 
                      ? 10 
                      : maxValue <= 20 
                        ? Math.ceil(maxValue / 5) * 5 
                        : Math.ceil(maxValue / 10) * 10
                    const numTicks = 11 // Número de divisões no eixo Y
                    
                    return (
                      <div className="admin-chart-content">
                        <div className="admin-chart-y-axis">
                          {Array.from({ length: numTicks }, (_, i) => {
                            const val = maxYAxis - (i * (maxYAxis / (numTicks - 1)))
                            return (
                              <div key={i} className="admin-chart-y-label">
                                {Math.round(val)}
                              </div>
                            )
                          })}
                        </div>
                        <div className="admin-chart-bars">
                          {dadosPorHora.map((valor, index) => {
                            const altura = maxYAxis > 0 ? (valor / maxYAxis) * 100 : 0
                            const alturaMinima = valor > 0 ? Math.max(altura, 5) : 0 // Mínimo de 5% para barras visíveis
                            return (
                              <div key={index} className="admin-chart-bar-container">
                                <div className="admin-chart-bar-wrapper">
                                  <div 
                                    className="admin-chart-bar" 
                                    style={{ height: `${alturaMinima}%` }}
                                  >
                                    {valor > 0 && <span className="admin-chart-value">{valor}</span>}
                                  </div>
                                </div>
                                <div className="admin-chart-label">{String(horas[index]).padStart(2, '0')}:00</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Tabela de Senhas */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>SENHA</th>
                      <th>TIPO</th>
                      <th>DATA</th>
                      <th>HORA</th>
                      <th>STATUS</th>
                      <th>GUICHE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {senhas.length > 0 ? (
                      senhas.slice().reverse().map((senha) => {
                        const tipoCodigo = senha.tipo === 'PRIORITARIA' ? 'SP' : senha.tipo === 'EXAMES' ? 'SE' : 'SG'
                        const status = senha.chamada ? 'ATENDIDA' : 'AGUARDANDO'
                        const d = new Date(senha.data)
                        const dia = String(d.getDate()).padStart(2, '0')
                        const mes = String(d.getMonth() + 1).padStart(2, '0')
                        const ano = String(d.getFullYear()).slice(-2)
                        const hora = String(d.getHours()).padStart(2, '0')
                        const minuto = String(d.getMinutes()).padStart(2, '0')
                        const dataFormatada = `${dia}/${mes}/${ano}`
                        const horaFormatada = `${hora}:${minuto}`
                        const numeroGuiche = senha.guiche ? senha.guiche.replace('GUICHÊ-0', '') : '-'
                        
                        return (
                          <tr key={senha.id}>
                            <td>{senha.codigo}</td>
                            <td>{tipoCodigo}</td>
                            <td>{dataFormatada}</td>
                            <td>{horaFormatada}</td>
                            <td>{status}</td>
                            <td>{numeroGuiche}</td>
                          </tr>
                        )
                      })
                    ) : (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={`empty-${index}`}>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {currentView === 'relatorios' && (
            <>
              <h1 className="admin-title">RELATORIOS</h1>
              
              <div className="admin-relatorios-container">
                {/* Seletor de Período */}
                <div className="admin-relatorio-box">
                  <div className="admin-relatorio-header">SELETOR DE PERIODO</div>
                  <div className="admin-relatorio-content">
                    <label className="admin-radio-label">
                      <input
                        type="radio"
                        name="periodo"
                        value="diario"
                        checked={periodo === 'diario'}
                        onChange={() => setPeriodo('diario')}
                        className="admin-radio"
                      />
                      <span>DIARIO</span>
                      {periodo === 'diario' && (
                        <input
                          type="date"
                          value={dataSelecionada}
                          onChange={(e) => setDataSelecionada(e.target.value)}
                          className="admin-date-input"
                        />
                      )}
                    </label>
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={periodo === 'mensal'}
                        onChange={(e) => setPeriodo(e.target.checked ? 'mensal' : 'diario')}
                        className="admin-checkbox"
                      />
                      <span>MENSAL</span>
                    </label>
                  </div>
                </div>

                {/* Resumo Geral */}
                <div className="admin-relatorio-box">
                  <div className="admin-relatorio-header">RESUMO GERAL</div>
                  <div className="admin-relatorio-content">
                    <div className="admin-resumo-item">
                      <span className="admin-resumo-label">Total de Atendimentos:</span>
                      <span className="admin-resumo-value">{senhasChamadas.length}</span>
                    </div>
                    <div className="admin-resumo-item">
                      <span className="admin-resumo-label">Total de Finalizados:</span>
                      <span className="admin-resumo-value">
                        {senhasChamadas.filter(sc => sc.finalizada).length}
                      </span>
                    </div>
                    <div className="admin-resumo-item">
                      <span className="admin-resumo-label">Total Pendentes:</span>
                      <span className="admin-resumo-value">
                        {senhas.filter(s => !s.chamada && new Date(s.dataExpiracao) > new Date()).length}
                      </span>
                    </div>
                    <div className="admin-resumo-item">
                      <span className="admin-resumo-label">Media de Atendimento:</span>
                      <span className="admin-resumo-value">
                        {(() => {
                          const atendimentos = senhasChamadas.filter(sc => sc.dataChamada && sc.data)
                          if (atendimentos.length === 0) return '0 min'
                          const tempos = atendimentos.map(sc => {
                            const tempoChamada = sc.dataFinalizacao 
                              ? (new Date(sc.dataFinalizacao) - new Date(sc.dataChamada)) / 60000
                              : (new Date() - new Date(sc.dataChamada)) / 60000
                            return tempoChamada
                          }).filter(t => t > 0)
                          if (tempos.length === 0) return '0 min'
                          const media = tempos.reduce((a, b) => a + b, 0) / tempos.length
                          return `${Math.round(media)} min`
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminArea

