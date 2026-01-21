import { useState } from 'react'
import { WritingCanvas } from './components/Editor/WritingCanvas'
import { HistoryTimeline } from './components/Sidebar/HistoryTimeline'
import { useEditorStore } from './store/editorStore'
import { snapshotService } from './services/snapshotService'

function App() {
  const { layoutMode, setLayoutMode, content } = useEditorStore()
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')

  const handleCommit = async () => {
    if (!commitMessage.trim()) return
    await snapshotService.createSnapshot(content, commitMessage, layoutMode)
    setCommitMessage('')
    setIsCommitModalOpen(false)
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Visual sidebar */}
      <aside className="w-80 bg-gray-900 text-white flex-shrink-0 flex flex-col p-4 border-r border-gray-800">
        <h1 className="text-2xl font-bold mb-6 tracking-wider">Novel Git</h1>

        <div className="mb-6">
          <button
            onClick={() => setIsCommitModalOpen(true)}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+ スナップショット保存</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">History Timeline</h2>
          <HistoryTimeline />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <button
            onClick={() => setLayoutMode(layoutMode === 'vertical' ? 'horizontal' : 'vertical')}
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors text-gray-300 cursor-pointer"
          >
            {layoutMode === 'vertical' ? '横書きモードへ' : '縦書きモードへ'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden relative">
        <WritingCanvas />

        {/* Commit Modal Overlay */}
        {isCommitModalOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-96 max-w-full m-4 text-gray-800">
              <h3 className="text-lg font-bold mb-4">スナップショットを保存</h3>
              <p className="text-sm text-gray-500 mb-4">現在の執筆状態を保存します。後でこの時点に戻ることができます。</p>
              <textarea
                autoFocus
                className="w-full p-3 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-700"
                placeholder="変更内容のメモ（例：第3章 クライマックス修正）"
                rows={3}
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsCommitModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCommit}
                  disabled={!commitMessage.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  保存する
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
