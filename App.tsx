
import React, { useState, useEffect } from 'react';
import { SpecieType, Region, SimulationState, ResultSummary, MarketQuote, ManagementType } from './types';
import { SPECIE_DEFAULTS, BRAZILIAN_STATES, MANAGEMENT_DEFAULTS, MANAGEMENT_OPTIONS } from './constants';
import { fetchMarketData } from './services/geminiService';

const Header = () => (
  <header className="bg-emerald-800 text-white py-6 px-4 shadow-lg sticky top-0 z-50 no-print">
    <div className="max-w-5xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-lg text-emerald-800">
          <i className="fas fa-seedling text-2xl"></i>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">BoiZap <span className="font-light text-emerald-200 text-lg ml-1">Market</span></h1>
      </div>
    </div>
  </header>
);

const PrintHeader = () => (
  <div className="hidden print:block mb-8 pb-4 border-b-2 border-emerald-800">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-2xl font-black text-emerald-800 uppercase tracking-tighter">Relatório de Simulação Pecuária</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Plataforma BoiZap Market</p>
      </div>
      <div className="text-right">
        <p className="text-[9px] text-slate-400 font-black uppercase">Simulado em: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 py-8 px-4 mt-auto no-print">
    <div className="max-w-5xl mx-auto text-center text-sm">
      <p>&copy; 2024 BoiZap Market - Inteligência em Proteína Animal.</p>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<SimulationState>({
    specie: SpecieType.BOVINO,
    region: 'SP',
    management: 'Confinamento',
    yieldPercent: 54,
    mode: 'batch',
    batchSize: 50,
    initialWeight: 420,
    gmd: 1.5,
    periodDays: 90,
    useManualPrice: false,
    manualPrice: 0
  });
  const [results, setResults] = useState<ResultSummary | null>(null);

  useEffect(() => {
    const availableManagements = MANAGEMENT_OPTIONS[state.specie];
    const newManagement = availableManagements[0];
    const defaults = MANAGEMENT_DEFAULTS[state.specie][newManagement]!;
    
    setState(prev => ({
      ...prev,
      management: newManagement,
      yieldPercent: defaults.yield,
      gmd: defaults.gmd,
      initialWeight: defaults.initialWeight
    }));
  }, [state.specie]);

  useEffect(() => {
    const defaults = MANAGEMENT_DEFAULTS[state.specie][state.management];
    if (defaults) {
      setState(prev => ({
        ...prev,
        yieldPercent: defaults.yield,
        gmd: defaults.gmd,
        initialWeight: defaults.initialWeight
      }));
    }
  }, [state.management, state.specie]);

  const currentDefaults = MANAGEMENT_DEFAULTS[state.specie][state.management]!;
  const projectedFinalWeight = state.initialWeight + (state.gmd * state.periodDays);

  const calculateResults = async () => {
    setLoading(true);
    try {
      const marketData = await fetchMarketData(state.specie, state.region);
      const quote: MarketQuote = state.useManualPrice 
        ? { ...marketData, price: state.manualPrice, isManual: true, source: 'Manual' }
        : marketData;

      const totalInitialWeight = state.batchSize * state.initialWeight;
      const totalFinalWeight = state.batchSize * projectedFinalWeight;
      const totalCarcassWeight = totalFinalWeight * (state.yieldPercent / 100);
      const weightGain = totalFinalWeight - totalInitialWeight;

      let totalUnits = totalCarcassWeight;
      if (quote.unit === '@') totalUnits = totalCarcassWeight / 15;

      const totalValue = totalUnits * quote.price;

      setResults({
        totalInitialWeight,
        totalFinalWeight,
        totalCarcassWeight,
        totalUnits,
        totalValue,
        weightGain,
        quote
      });
      setStep(3);
    } catch (err) {
      alert("Erro ao simular. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        
        <PrintHeader />

        <div className="flex items-center justify-between mb-8 max-w-md mx-auto no-print">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-300 border'}`}>
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-400 uppercase tracking-widest text-[10px]">Espécie Animal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(SpecieType).map(sp => (
                      <button
                        key={sp}
                        onClick={() => setState(prev => ({ ...prev, specie: sp }))}
                        className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center h-16 ${state.specie === sp ? 'border-emerald-500 bg-emerald-50 shadow-inner' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                      >
                        <span className={`text-xs font-black uppercase tracking-tighter ${state.specie === sp ? 'text-emerald-700' : 'text-slate-500'}`}>{sp}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-400 uppercase tracking-widest text-[10px]">Sistema Produtivo</label>
                  <div className={`grid gap-3 ${MANAGEMENT_OPTIONS[state.specie].length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {MANAGEMENT_OPTIONS[state.specie].map((m) => (
                      <button
                        key={m}
                        onClick={() => setState(prev => ({ ...prev, management: m }))}
                        className={`p-4 rounded-xl border-2 transition-all font-bold ${state.management === m ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <label className="block text-sm font-semibold mb-3 text-slate-400 uppercase tracking-widest text-[10px]">Mercado de Referência</label>
                <select 
                  value={state.region}
                  onChange={(e) => setState(prev => ({ ...prev, region: e.target.value as Region }))}
                  className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 appearance-none font-medium"
                >
                  {BRAZILIAN_STATES.map(st => <option key={st} value={st}>{st} - Mercado Regional</option>)}
                </select>
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 flex gap-4 text-sm text-emerald-800">
                  <i className="fas fa-info-circle text-lg"></i>
                  <p>Manejo: <b>{state.management}</b>. Os parâmetros de ganho de peso e rendimento foram pré-ajustados para a espécie <b>{state.specie}</b>.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button onClick={() => setStep(2)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-12 rounded-xl shadow-lg transition-all uppercase tracking-wider text-sm">
                Configurar Lote <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Cabeças/Indivíduos</label>
                    <input type="number" value={state.batchSize} onChange={e => setState(p => ({...p, batchSize: +e.target.value}))} className="w-full p-4 bg-slate-50 rounded-xl border font-black text-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest text-emerald-600">Peso Inicial (kg)</label>
                    <input type="number" value={state.initialWeight} onChange={e => setState(p => ({...p, initialWeight: +e.target.value}))} className="w-full p-4 bg-emerald-50 border-emerald-200 text-emerald-900 rounded-xl border font-black text-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">GMD (kg/dia)</label>
                    <input type="number" step="0.001" value={state.gmd} onChange={e => setState(p => ({...p, gmd: +e.target.value}))} className="w-full p-4 bg-slate-50 rounded-xl border font-black text-lg text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest text-blue-600">{currentDefaults.periodLabel}</label>
                    <input type="number" value={state.periodDays} onChange={e => setState(p => ({...p, periodDays: +e.target.value}))} className="w-full p-4 bg-blue-50 border-blue-100 text-blue-900 rounded-xl border font-black text-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-xl">
                <div className="absolute -bottom-10 -right-10 opacity-5"><i className="fas fa-weight-scale text-[200px]"></i></div>
                <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-2 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                   Projeção de Abate
                </p>
                <h3 className="text-5xl font-black mb-1 tracking-tighter">
                  {projectedFinalWeight.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} 
                  <span className="text-xl font-normal text-slate-500 ml-2">kg</span>
                </h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Média por animal</p>
                
                <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">Ganho de Peso</p>
                    <p className="text-xl font-black text-emerald-400">+{ (state.gmd * state.periodDays).toFixed(1) } kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">Rendimento (%)</p>
                    <div className="flex items-center gap-1">
                      <input type="number" value={state.yieldPercent} onChange={e => setState(p => ({...p, yieldPercent: +e.target.value}))} className="w-12 bg-transparent border-b border-slate-700 text-white font-black text-xl outline-none focus:border-emerald-500" />
                      <span className="text-slate-500 text-xl">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow">
                  <p className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-1">Cotação p/ Venda</p>
                  <p className="text-xs text-slate-500">Valor projetado para o momento da venda.</p>
                </div>
                <div className="flex bg-white p-1 rounded-lg border shadow-sm">
                  <button onClick={() => setState(p => ({...p, useManualPrice: false}))} className={`px-4 py-1.5 rounded-md font-black text-[9px] uppercase transition-all ${!state.useManualPrice ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400'}`}>Automático</button>
                  <button onClick={() => setState(p => ({...p, useManualPrice: true}))} className={`px-4 py-1.5 rounded-md font-black text-[9px] uppercase transition-all ${state.useManualPrice ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400'}`}>Manual</button>
                </div>
              </div>
              {state.useManualPrice && (
                <div className="mt-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                   <div className="relative flex-grow max-w-[200px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                      <input type="number" value={state.manualPrice || ''} onChange={e => setState(p => ({...p, manualPrice: +e.target.value}))} className="w-full p-3 pl-10 bg-white border border-emerald-100 rounded-lg font-black text-emerald-900 text-sm" placeholder="0,00" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 font-black uppercase text-[8px]">/{SPECIE_DEFAULTS[state.specie].unit}</span>
                   </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between items-center no-print">
              <button onClick={() => setStep(1)} className="text-slate-400 font-black px-4 py-2 hover:bg-slate-100 rounded-lg transition-all text-xs tracking-widest uppercase">Voltar</button>
              <button onClick={calculateResults} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-10 rounded-xl shadow-lg flex items-center gap-2 transition-all uppercase tracking-widest text-xs">
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-calculator"></i> Simular Mercado</>}
              </button>
            </div>
          </div>
        )}

        {step === 3 && results && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col print-full">
              {/* Header de Resultado */}
              <div className="bg-emerald-800 p-8 text-white relative">
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Receita Bruta Estimada</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-light text-emerald-400">R$</span>
                      <h2 className="text-5xl font-black tracking-tighter">
                        {results.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-white/10 px-4 py-2 rounded-lg text-[9px] font-black uppercase border border-white/10">
                      {state.batchSize} {state.specie}s
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-lg text-[9px] font-black uppercase border border-white/10">
                      {state.management}
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-lg text-[9px] font-black uppercase border border-white/10">
                      {state.region}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de métricas */}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white">
                {[
                  { label: 'Peso Final/Indiv.', value: (results.totalFinalWeight / state.batchSize).toLocaleString('pt-BR', { maximumFractionDigits: 1 }), unit: 'kg', color: 'text-slate-800' },
                  { label: 'Peso Total Lote', value: results.totalFinalWeight.toLocaleString('pt-BR', { maximumFractionDigits: 0 }), unit: 'kg', color: 'text-slate-800' },
                  { label: 'Produção Líquida', value: results.totalUnits.toLocaleString('pt-BR', { maximumFractionDigits: 1 }), unit: results.quote.unit, color: 'text-emerald-600', highlight: true },
                  { label: 'Ganho Total', value: `+${results.weightGain.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, unit: 'kg', color: 'text-slate-800' }
                ].map((stat, idx) => (
                  <div key={idx} className={`p-5 rounded-xl border ${stat.highlight ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detalhes Técnicos */}
              <div className="px-6 pb-6 pt-2">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-6 text-[10px]">
                   <div>
                     <span className="text-slate-400 uppercase font-black block mb-2 tracking-widest">Rendimento</span>
                     <span className="font-black text-slate-700 text-sm">{state.yieldPercent}%</span>
                   </div>
                   <div>
                     <span className="text-slate-400 uppercase font-black block mb-2 tracking-widest">Peso Entrada</span>
                     <span className="font-black text-slate-700 text-sm">{state.initialWeight} kg</span>
                   </div>
                   <div>
                     <span className="text-slate-400 uppercase font-black block mb-2 tracking-widest">GMD Diário</span>
                     <span className="font-black text-slate-700 text-sm">{state.gmd} kg/dia</span>
                   </div>
                   <div>
                     <span className="text-slate-400 uppercase font-black block mb-2 tracking-widest">Cotação Ref.</span>
                     <span className="font-black text-emerald-600 text-sm">R$ {results.quote.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /{results.quote.unit}</span>
                   </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-white border-t text-[8px] flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <i className="fas fa-database opacity-50"></i>
                  <span>Fonte: {results.quote.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-clock opacity-50"></i>
                  <span>Ref: {results.quote.date}</span>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 no-print pb-20">
              <button onClick={() => setStep(1)} className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 font-black py-4 px-10 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <i className="fas fa-rotate-left"></i> Novo Cálculo
              </button>
              
              <button onClick={handlePrint} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-12 rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <i className="fas fa-file-pdf"></i> Exportar para PDF
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
