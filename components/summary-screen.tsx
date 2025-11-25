"use client"

import { motion } from "framer-motion"
import { RotateCcw, Home, Trophy, Eye, EyeOff } from "lucide-react"
import type { GameSession } from "./game-manager"
import { useState } from "react"

interface SummaryScreenProps {
  session: GameSession
  onHome: () => void
  onRetry: () => void
}

export function SummaryScreen({ session, onHome, onRetry }: SummaryScreenProps) {
  const [showSpoilers, setShowSpoilers] = useState(false)

  return (
    <div className="card-pop p-6 md:p-10 text-center max-w-2xl mx-auto w-full">
      {/* Score Header */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="mb-8"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-yellow rounded-full border-4 border-black mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Trophy className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-6xl font-black text-brand-blue mb-2">{session.score}</h2>
        <p className="text-gray-500 font-bold text-lg uppercase tracking-wider">Points</p>
      </motion.div>

      <div className="space-y-2 mb-8">
        <h3 className="text-2xl font-bold">{session.category}</h3>
        {session.strikes >= 5 ? (
          <p className="text-red-500 font-bold bg-red-50 inline-block px-3 py-1 rounded-full">Game Over!</p>
        ) : (
          <p className="text-gray-400 font-medium">Well done!</p>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={onRetry}
          className="btn-primary bg-brand-pink text-white hover:bg-pink-600 border-pink-900 flex flex-col items-center justify-center gap-1 py-4"
        >
          <RotateCcw className="w-6 h-6" />
          <span className="text-sm">Try Again</span>
        </button>
        <button
          onClick={onHome}
          className="btn-primary bg-white text-black hover:bg-gray-50 flex flex-col items-center justify-center gap-1 py-4"
        >
          <Home className="w-6 h-6" />
          <span className="text-sm">Menu</span>
        </button>
      </div>

      {/* List Review */}
      <div className="text-left border-t-2 border-gray-100 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-gray-400 text-sm uppercase tracking-wider">Your Answers</h4>
          <button
            onClick={() => setShowSpoilers(!showSpoilers)}
            className="text-brand-blue text-sm font-bold flex items-center gap-1 hover:underline"
          >
            {showSpoilers ? (
              <>
                <EyeOff className="w-4 h-4" /> Hide
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" /> Show
              </>
            )}
          </button>
        </div>

        <div
          className={`flex flex-wrap gap-2 transition-all ${!showSpoilers ? "blur-sm select-none grayscale opacity-50" : ""}`}
        >
          {session.items.map((item) => (
            <span key={item} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-700">
              {item}
            </span>
          ))}
          {session.items.length === 0 && <span className="text-gray-400 italic text-sm">-</span>}
        </div>
      </div>
    </div>
  )
}
