"use client"

import { useState, useEffect } from "react"
import { StartScreen } from "./start-screen"
import { PlayScreen } from "./play-screen"
import { SummaryScreen } from "./summary-screen"
import { AnimatePresence, motion } from "framer-motion"

export type GameState = "start" | "playing" | "summary"

export type GameSession = {
  id: string
  category: string
  language: "en" | "sv"
  items: string[]
  score: number
  date: number
  strikes: number
}

export function GameManager() {
  const [gameState, setGameState] = useState<GameState>("start")
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null)
  const [history, setHistory] = useState<GameSession[]>([])

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem("infinite-guesser-history")
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load history", e)
      }
    }
  }, [])

  // Save history when updated
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("infinite-guesser-history", JSON.stringify(history))
    }
  }, [history])

  const startGame = (category: string, language: "en" | "sv") => {
    const newSession: GameSession = {
      id: crypto.randomUUID(),
      category,
      language,
      items: [],
      score: 0,
      date: Date.now(),
      strikes: 0,
    }
    setCurrentSession(newSession)
    setGameState("playing")
  }

  const endGame = (session: GameSession) => {
    setCurrentSession(session)
    // Add to history if score > 0
    if (session.score > 0) {
      setHistory((prev) => [session, ...prev])
    }
    setGameState("summary")
  }

  const restartGame = () => {
    setGameState("start")
    setCurrentSession(null)
  }

  const retryCategory = (category: string, language: "en" | "sv") => {
    startGame(category, language)
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFDF5] p-4 md:p-8 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-yellow/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-pink/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        <AnimatePresence mode="wait">
          {gameState === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="w-full"
            >
              <StartScreen onStart={startGame} history={history} onRetry={retryCategory} />
            </motion.div>
          )}

          {gameState === "playing" && currentSession && (
            <motion.div
              key="play"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
              className="w-full"
            >
              <PlayScreen initialSession={currentSession} onEndGame={endGame} />
            </motion.div>
          )}

          {gameState === "summary" && currentSession && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full"
            >
              <SummaryScreen
                session={currentSession}
                onHome={restartGame}
                onRetry={() => retryCategory(currentSession.category, currentSession.language)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
