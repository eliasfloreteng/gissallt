"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, History, Sparkles, ChevronRight } from "lucide-react"
import { getSuggestions } from "@/app/actions"
import type { GameSession } from "./game-manager"
import { GameDetailsDialog } from "./game-details-dialog"

interface StartScreenProps {
  onStart: (category: string) => void
  history: GameSession[]
  onRetry: (category: string) => void
}

export function StartScreen({ onStart, history, onRetry }: StartScreenProps) {
  const [category, setCategory] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [selectedGame, setSelectedGame] = useState<GameSession | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true)
      const sugs = await getSuggestions()
      if (mounted) {
        setSuggestions(sugs)
        setLoadingSuggestions(false)
      }
    }
    fetchSuggestions()
    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (category.trim()) {
      onStart(category.trim())
    }
  }

  const handleGameClick = (game: GameSession) => {
    setSelectedGame(game)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-block"
        >
          <span className="px-4 py-1.5 rounded-full bg-brand-yellow/30 text-brand-yellow-dark font-bold text-sm tracking-wide uppercase border-2 border-brand-yellow">
            Gissallt
          </span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter drop-shadow-sm">
          Name them <br />
          <span className="text-brand-blue relative inline-block">
            ALL!
            <svg
              className="absolute -bottom-2 w-full h-3 text-brand-pink"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        <p className="text-lg text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
          Pick a category and guess as many items as you can. How far can you go
          before striking out?
        </p>
      </div>

      {/* Main Input Card */}
      <div className="card-pop p-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-2"
        >
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter a category (e.g. Car Brands)"
            className="flex-1 px-6 py-4 text-xl font-bold bg-gray-50 rounded-xl focus:outline-hidden focus:bg-white transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={!category.trim()}
            className="btn-primary bg-brand-green text-white hover:bg-green-600 border-green-800 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6 fill-current" />
            Start
          </button>
        </form>
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase tracking-wider pl-2">
          <Sparkles className="w-4 h-4" />
          Popular Categories
        </div>
        <div className="flex flex-wrap gap-3">
          {loadingSuggestions
            ? // Skeletons
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"
                />
              ))
            : suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => onStart(sug)}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-brand-pink hover:text-brand-pink hover:scale-105 transition-all shadow-sm"
                >
                  {sug}
                </button>
              ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-4 pt-4 border-t-2 border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase tracking-wider pl-2">
            <History className="w-4 h-4" />
            Recent Games
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.slice(0, 4).map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameClick(game)}
                className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex justify-between items-center group hover:border-brand-blue transition-colors cursor-pointer text-left w-full"
              >
                <div>
                  <h3 className="font-bold text-lg">{game.category}</h3>
                  <p className="text-gray-400 text-sm font-medium">
                    {game.score} items •{" "}
                    {new Date(game.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-2 bg-gray-100 rounded-full text-gray-600 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <GameDetailsDialog
        game={selectedGame}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStartNewGame={onRetry}
      />
    </div>
  )
}
