"use client"

import { motion } from "framer-motion"
import { RotateCcw, Home, Trophy, Eye, EyeOff, Infinity } from "lucide-react"
import type { GameSession } from "./game-manager"
import { useState } from "react"

interface SummaryScreenProps {
  session: GameSession
  onHome: () => void
  onRetry: () => void
  onContinueInfinite?: () => void
}

export function SummaryScreen({ session, onHome, onRetry, onContinueInfinite }: SummaryScreenProps) {
  const [showSpoilers, setShowSpoilers] = useState(false)

  // Can continue in infinite mode if lost all lives and hasn't played infinite mode yet
  const canContinueInfinite = session.strikes >= 5 && !session.playedInfiniteMode
  const hasInfiniteScore = session.playedInfiniteMode && (session.infiniteModeScore ?? 0) > 0
  const totalScore = session.score + (session.infiniteModeScore ?? 0)

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
        <h2 className="text-6xl font-black text-brand-blue mb-2">{totalScore}</h2>
        {hasInfiniteScore ? (
          <div className="flex items-center justify-center gap-3 text-gray-500 font-bold">
            <span>{session.score} regular</span>
            <span className="text-brand-blue">+ {session.infiniteModeScore} bonus</span>
          </div>
        ) : (
          <p className="text-gray-500 font-bold text-lg uppercase tracking-wider">Points</p>
        )}
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
      <div className="space-y-4 mb-8">
        {/* Continue in Infinite Mode button - only shown after losing */}
        {canContinueInfinite && onContinueInfinite && (
          <button
            onClick={onContinueInfinite}
            className="w-full btn-primary bg-brand-blue text-white hover:bg-blue-600 border-blue-900 flex items-center justify-center gap-2 py-4"
          >
            <Infinity className="w-6 h-6" />
            <span className="font-bold">Continue in Infinite Mode</span>
          </button>
        )}
        <div className="grid grid-cols-2 gap-4">
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

        <div className={`space-y-4 transition-all ${!showSpoilers ? "blur-sm select-none grayscale opacity-50" : ""}`}>
          {/* Regular mode items */}
          {session.items.length > 0 && (
            <div>
              {hasInfiniteScore && (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Regular Mode ({session.score})
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {session.items.map((item) => (
                  <span key={item} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Infinite mode items */}
          {hasInfiniteScore && session.infiniteModeItems && session.infiniteModeItems.length > 0 && (
            <div>
              <p className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-2 flex items-center gap-1">
                <Infinity className="w-3 h-3" /> Infinite Mode (+{session.infiniteModeScore})
              </p>
              <div className="flex flex-wrap gap-2">
                {session.infiniteModeItems.map((item) => (
                  <span key={item} className="px-3 py-1 bg-brand-blue/10 rounded-lg text-sm font-bold text-brand-blue">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {session.items.length === 0 && (!session.infiniteModeItems || session.infiniteModeItems.length === 0) && (
            <span className="text-gray-400 italic text-sm">-</span>
          )}
        </div>
      </div>
    </div>
  )
}
