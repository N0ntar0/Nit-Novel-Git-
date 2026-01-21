import { WritingCanvas } from './components/Editor/WritingCanvas'
import { useEditorStore } from './store/editorStore'

function App() {
  const { layoutMode, setLayoutMode } = useEditorStore()

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Visual sidebar placeholder */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col p-4">
        <h1 className="text-xl font-bold mb-8">Novel Git</h1>
        <div className="flex-1">
          {/* History Timeline will go here */}
          <div className="p-2 bg-gray-800 rounded mb-2 text-sm opacity-50">History Timeline</div>
        </div>
        <div className="mt-auto">
          <button
            onClick={() => setLayoutMode(layoutMode === 'vertical' ? 'horizontal' : 'vertical')}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors cursor-pointer"
          >
            {layoutMode === 'vertical' ? '横書きに切替' : '縦書きに切替'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden relative">
        <WritingCanvas />
      </main>
    </div>
  )
}

export default App
