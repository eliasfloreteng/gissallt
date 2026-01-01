"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { checkGuess } from "@/app/actions"
import { X, Check, Loader2, Flag } from "lucide-react"
import type { GameSession } from "./game-manager"
import { cn } from "@/lib/utils"

interface PlayScreenProps {
  initialSession: GameSession
  onEndGame: (session: GameSession) => void
}

type Feedback = {
  type: "success" | "error" | "info"
  message: string
}

export function PlayScreen({ initialSession, onEndGame }: PlayScreenProps) {
  const [items, setItems] = useState<string[]>(initialSession.items)
  const [strikes, setStrikes] = useState(initialSession.strikes)
  const [score, setScore] = useState(initialSession.score)
  const [input, setInput] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const MAX_STRIKES = 5

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isChecking) return

    const guess = input.trim()
    setInput("") // Clear immediately for better flow
    setIsChecking(true)
    setFeedback(null)

    // Check duplicates locally first
    if (items.some((item) => item.toLowerCase() === guess.toLowerCase())) {
      setFeedback({
        type: "info",
        message: "Already listed!",
      })
      setIsChecking(false)
      return
    }

    // Call AI
    const result = await checkGuess(initialSession.category, guess)

    if (result.isValid) {
      // Check normalized duplicate
      if (items.some((item) => item.toLowerCase() === result.normalizedName.toLowerCase())) {
        setFeedback({
          type: "info",
          message: "Already listed!",
        })
      } else {
        setItems((prev) => [result.normalizedName, ...prev])
        setScore((prev) => prev + 1)
        setFeedback({ type: "success", message: "+1" })
      }
    } else {
      setStrikes((prev) => {
        const newStrikes = prev + 1
        if (newStrikes >= MAX_STRIKES) {
          // Delay ending slightly to show the strike
          setTimeout(() => {
            onEndGame({
              ...initialSession,
              items: [...items], // Include current items
              score: score, // Include current score
              strikes: newStrikes,
            })
          }, 1000)
        }
        return newStrikes
      })
      setFeedback({ type: "error", message: result.reason || "Invalid" })
    }

    setIsChecking(false)
    inputRef.current?.focus()
  }

  const handleGiveUp = () => {
    onEndGame({
      ...initialSession,
      items,
      score,
      strikes,
    })
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {/* Header Stats */}
      <div className="flex justify-between items-end pb-4 border-b-2 border-gray-100">
        <div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Category</p>
          <h2 className="text-3xl md:text-4xl font-black text-brand-blue truncate max-w-[200px] md:max-w-xs">
            {initialSession.category}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black text-brand-pink tabular-nums">{score}</p>
        </div>
      </div>

      {/* Strike Indicator */}
      <div className="flex justify-center gap-3 py-2">
        {[...Array(MAX_STRIKES)].map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              scale: i < strikes ? 1.2 : 1,
              color: i < strikes ? "#EF4444" : "#E5E7EB", // red-500 : gray-200
            }}
            className="transition-colors"
          >
            <X className={cn("w-8 h-8 md:w-10 md:h-10", i < strikes ? "stroke-[4px]" : "stroke-[3px]")} />
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="relative">
        <form onSubmit={handleSubmit} className={cn("relative z-20", feedback?.type === "error" && "animate-shake")}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={strikes >= MAX_STRIKES}
            placeholder="Type something..."
            className="w-full px-6 py-5 text-2xl font-bold bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-hidden focus:translate-y-[2px] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:border-brand-blue transition-all placeholder:text-gray-300"
            autoFocus
            autoComplete="off"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isChecking ? (
              <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
            ) : (
              <span className="text-xs font-bold text-gray-300">ENTER</span>
            )}
          </div>
        </form>

        {/* Feedback Toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute -top-14 left-0 right-0 mx-auto w-fit px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2",
                feedback.type === "success"
                  ? "bg-brand-green text-white"
                  : feedback.type === "error"
                    ? "bg-red-500 text-white"
                    : "bg-brand-yellow text-black",
              )}
            >
              {feedback.type === "success" && <Check className="w-4 h-4" />}
              {feedback.type === "error" && <X className="w-4 h-4" />}
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* List */}
      <div className="flex-1 min-h-[200px] mt-4">
        <div className="flex flex-wrap gap-3 content-start">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item, i) => (
              <motion.div
                key={item} // items are unique
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-4 py-2 bg-white border-2 border-black rounded-xl font-bold shadow-sm flex items-center gap-2"
                style={{
                  rotate: i % 2 === 0 ? -1 : 1, // Slight rotation for playful look
                  zIndex: items.length - i,
                }}
              >
                {item}
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <div className="w-full text-center py-10 text-gray-400 font-bold opacity-50">
              List is empty. Start guessing!
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-center pt-8">
        <button
          onClick={handleGiveUp}
          className="text-gray-400 font-bold hover:text-red-500 transition-colors flex items-center gap-2 text-sm uppercase tracking-widest"
        >
          <Flag className="w-4 h-4" />
          Give Up
        </button>
      </div>
    </div>
  )
}
