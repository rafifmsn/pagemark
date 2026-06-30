import React, { Component, type ReactNode } from "react"
import MarkdownPage from "./tabs/markdown"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in sidepanel:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-zinc-950 text-zinc-200 h-screen flex flex-col justify-center items-center font-sans">
          <div className="w-full max-w-md p-5 rounded-xl border border-red-900/40 bg-red-950/10 shadow-2xl">
            <h1 className="text-sm font-semibold text-red-400 mb-2">Sidepanel Render Crash</h1>
            <p className="text-xs text-zinc-400 mb-4">
              An unexpected rendering error occurred in the Side Panel:
            </p>
            <textarea
              readOnly
              value={`${this.state.error?.name}: ${this.state.error?.message}\n\nStack:\n${this.state.error?.stack}`}
              className="w-full h-48 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400 leading-relaxed outline-none resize-none"
            />
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-xs font-medium transition-colors">
              Reload Side Panel
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function SidePanelIndex() {
  return (
    <ErrorBoundary>
      <MarkdownPage />
    </ErrorBoundary>
  )
}
