import React, { useState, useCallback, useEffect } from 'react';
import { FoundryItem } from './types';
import { parseTalents, parseSpells } from './utils/parser';

// --- Icons ---
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
  </svg>
);
const DocumentArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.381a9.06 9.06 0 001.5-.124A9.06 9.06 0 0021 17.25m-7.5 12.75v-1.5c0-.621.504-1.125 1.125-1.125h1.5m-3 2.25v-2.25c0-.621.504-1.125 1.125-1.125h2.25" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

type Mode = 'talent' | 'spell';

export default function App() {
  const [mode, setMode] = useState<Mode>('talent');
  const [inputText, setInputText] = useState<string>('');
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [items, setItems] = useState<FoundryItem[]>([]);
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Clear inputs when switching modes
  useEffect(() => {
    handleClear();
  }, [mode]);

  const placeholderTalent = `<div style="font-family: serif; line-height: 1.6;">
  <h3 style="text-align: center;">CAMINHO DA FERA</h3>
  <p>Voc&ecirc; tem um animal como seu companheiro...</p>
  <ul>
    <li><span style="...">✥</span> <strong>CATEGORIA 1:</strong> ...</li>
  </ul>
  <p><strong>COMENT&Aacute;RIO:</strong> ...</p>
</div>`;

  const placeholderSpell = `<div style="..."> 
  <h3 style="...">MÃOS QUE CURAM</h3>
  <ul> 
    <li><span style="...">✥</span> <strong>CATEGORIA:</strong> 1</li> 
    <li><span style="...">✥</span> <strong>ALCANCE:</strong> Ao Alcance das Mãos</li>
    <li><span style="...">✥</span> <strong>DURAÇÃO:</strong> Imediata</li>
    <li><span style="...">✥</span> <strong>INGREDIENTE:</strong> Argila</li>
  </ul>
  <p>Você pode curar dano...</p> 
</div>`;

  const handleConvert = useCallback(() => {
    if (!inputText.trim()) {
      setStatusMsg('Por favor, insira algum texto primeiro.');
      return;
    }

    try {
      let parsedItems: FoundryItem[] = [];
      
      if (mode === 'talent') {
        parsedItems = parseTalents(inputText);
      } else {
        parsedItems = parseSpells(inputText);
      }

      if (parsedItems.length === 0) {
        setStatusMsg('Nenhum item válido encontrado. Verifique o formato.');
        return;
      }
      setItems(parsedItems);
      
      const output = parsedItems.length === 1 ? parsedItems[0] : parsedItems;
      setJsonOutput(JSON.stringify(output, null, 2));
      setStatusMsg(`Sucesso! ${parsedItems.length} ${mode === 'talent' ? 'talento(s)' : 'magia(s)'} processado(s).`);
    } catch (error) {
      console.error(error);
      setStatusMsg('Erro ao processar o texto.');
    }
  }, [inputText, mode]);

  const handleClear = () => {
    setInputText('');
    setJsonOutput('');
    setItems([]);
    setStatusMsg('');
  };

  const handleCopy = useCallback(() => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
    setStatusMsg('JSON copiado!');
    setTimeout(() => setStatusMsg(''), 3000);
  }, [jsonOutput]);

  const handleDownload = useCallback(() => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const prefix = mode === 'talent' ? 'talento' : 'magia';
    const fileName = items.length === 1 && items[0].name 
      ? `${items[0].name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json` 
      : `${prefix}s_export.json`;
      
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [jsonOutput, items, mode]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg shadow-lg shadow-purple-900/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Foundry VTT <span className="text-purple-400">Forbidden Lands Converter</span> do Urso
              </h1>
              <p className="text-xs text-gray-400">Transforme conteúdo do livro em JSON para Foundry</p>
            </div>
          </div>
          
          <div className="hidden md:block text-sm text-gray-500">
            {statusMsg && <span className="text-emerald-400 animate-pulse">{statusMsg}</span>}
          </div>
        </div>
      </header>

      {/* Navigation / Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex space-x-2 border-b border-gray-800">
          <button
            onClick={() => setMode('talent')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              mode === 'talent'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'
            }`}
          >
            <UserIcon /> Talentos
          </button>
          <button
            onClick={() => setMode('spell')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              mode === 'spell'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'
            }`}
          >
            <SparklesIcon /> Magias
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-160px)] flex flex-col md:flex-row gap-6">
        
        {/* Left Panel: Input */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === 'talent' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
              Entrada ({mode === 'talent' ? 'HTML de Talento' : 'HTML de Magia'})
            </label>
            <button 
              onClick={handleClear}
              className="text-xs flex items-center text-gray-500 hover:text-red-400 transition-colors"
            >
              <TrashIcon /> Limpar
            </button>
          </div>
          
          <div className="relative flex-1 group">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === 'talent' ? placeholderTalent : placeholderSpell}
              className="w-full h-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm font-mono text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none shadow-inner"
              spellCheck={false}
            />
            <div className="absolute bottom-4 right-4 bg-gray-900/80 px-2 py-1 rounded text-xs text-gray-500 pointer-events-none">
              Dica: Cole o HTML do livro aqui
            </div>
          </div>
        </div>

        {/* Center Actions */}
        <div className="flex md:flex-col justify-center gap-4 items-center shrink-0">
          <button
            onClick={handleConvert}
            className="group relative flex items-center justify-center w-14 h-14 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg shadow-purple-900/40 transition-all hover:scale-110 active:scale-95 z-10"
            title="Converter para JSON"
          >
            <ArrowRightIcon />
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none md:block hidden">
              Converter
            </span>
          </button>
        </div>

        {/* Right Panel: Output */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex justify-between items-center">
             <label className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Saída (JSON)
            </label>
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                disabled={!jsonOutput}
                className="flex items-center px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md border border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ClipboardIcon /> Copiar
              </button>
              <button 
                onClick={handleDownload}
                disabled={!jsonOutput}
                className="flex items-center px-3 py-1.5 text-xs font-medium bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentArrowDownIcon /> Baixar
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <textarea
              readOnly
              value={jsonOutput}
              className="w-full h-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs font-mono text-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none shadow-inner"
            />
             {!jsonOutput && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-gray-700 text-sm">O resultado aparecerá aqui...</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Status Toast */}
      {statusMsg && (
         <div className="md:hidden fixed bottom-4 left-4 right-4 bg-gray-800 border border-gray-700 text-emerald-400 px-4 py-3 rounded-lg shadow-xl text-center text-sm z-50">
           {statusMsg}
         </div>
      )}
    </div>
  );
}