import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NotesTabProps {
  content: string;
  onChange: (value: string) => void;
  themeColor: string;
}

export const NotesTab: React.FC<NotesTabProps> = ({ content, onChange, themeColor }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-black p-4 sm:p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-4 border-b-2 border-zinc-100 pb-2">
        <h3 className="text-[10px] font-black uppercase text-zinc-800 flex items-center gap-2">
          <i className="fa-solid fa-book opacity-80" /> Notas de Jornada
        </h3>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 hover:bg-zinc-300 hover:text-zinc-700 flex items-center justify-center text-[10px] transition-colors"
              title="Ajuda Markdown"
            >
              <i className="fa-solid fa-question" />
            </button>
            
            {showHelp && (
              <div className="absolute right-0 top-8 w-64 bg-zinc-900 p-4 rounded-xl shadow-xl z-50 text-white border-2 border-black/20 animate-in fade-in zoom-in-95 origin-top-right">
                <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-2 border-b border-zinc-700 pb-1">Markdown Cheatsheet</h4>
                <div className="space-y-2 text-xs max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Negrito</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">**text**</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="italic">Itálico</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">*text*</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="line-through">Riscado</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">~~text~~</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Título 1</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono"># Title</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Título 2</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">## Title</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Lista</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">- item</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Numérica</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">1. item</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tarefa</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">- [ ] task</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Link</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">[txt](url)</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Imagem</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">![alt](img)</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Citação</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">&gt; text</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Código</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">`code`</code>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Separação</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono w-full text-center">---</code>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Tabela</span>
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono text-[10px] whitespace-pre">
                      | A | B |{'\n'}|---|---|{'\n'}| 1 | 2 |
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-zinc-200 mx-1" />

          <button
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              !isPreview
                ? 'text-white shadow-md'
                : 'bg-zinc-100 text-zinc-400 hover:text-zinc-600'
            }`}
             style={!isPreview ? { backgroundColor: themeColor } : {}}
          >
            Editar
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              isPreview
                ? 'text-white shadow-md'
                : 'bg-zinc-100 text-zinc-400 hover:text-zinc-600'
            }`}
            style={isPreview ? { backgroundColor: themeColor } : {}}
          >
            Visualizar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {!isPreview ? (
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full bg-transparent font-serif italic text-zinc-800 outline-none resize-none leading-relaxed text-xl custom-scrollbar p-2"
            placeholder="Escreva as crônicas da sua jornada aqui... (Clique na ? para ver como formatar)"
          />
        ) : (
          <div className="w-full h-full overflow-y-auto custom-scrollbar p-2 prose prose-zinc prose-sm sm:prose-base max-w-none">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <span className="text-zinc-300 font-black uppercase italic text-sm">
                Nenhuma anotação para visualizar.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
