"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { checkGuess } from "@/app/actions"
import { X, Check, Loader2, Flag, Clock, WifiOff } from "lucide-react"
import type { GameSession } from "./game-manager"
import { cn } from "@/lib/utils"

interface PlayScreenProps {
  initialSession: GameSession
  onEndGame: (session: GameSession) => void
  onSessionUpdate?: (session: GameSession) => void
  isInfiniteMode?: boolean
}

type Feedback = {
  type: "success" | "error" | "info" | "queued"
  message: string
}

type QueuedGuess = {
  id: string
  guess: string
  timestamp: number
}

type PendingGuess = {
  id: string
  guess: string
  timestamp: number
}

export function PlayScreen({ initialSession, onEndGame, onSessionUpdate, isInfiniteMode = false }: PlayScreenProps) {
  const [items, setItems] = useState<string[]>(initialSession.items)
  const [strikes, setStrikes] = useState(initialSession.strikes)
  const [score, setScore] = useState(initialSession.score)
  // Infinite mode state
  const [infiniteItems, setInfiniteItems] = useState<string[]>(initialSession.infiniteModeItems ?? [])
  const [infiniteScore, setInfiniteScore] = useState(initialSession.infiniteModeScore ?? 0)
  const [input, setInput] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [queuedGuesses, setQueuedGuesses] = useState<QueuedGuess[]>([])
  const [pendingGuesses, setPendingGuesses] = useState<PendingGuess[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const MAX_STRIKES = 5
  const QUEUE_STORAGE_KEY = `guess-queue-${initialSession.id}`
  const REQUEST_TIMEOUT = 10000 // 10 seconds timeout

  // Combine all items for display and duplicate checking
  const allItems = isInfiniteMode ? [...infiniteItems, ...items] : items
  const totalScore = score + infiniteScore
  const displayScore = isInfiniteMode ? totalScore : score

  // Wrapper to add timeout to API calls
  const checkGuessWithTimeout = useCallback(
    async (category: string, guess: string, previousItems: string[]) => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT)
      })

      return Promise.race([checkGuess(category, guess, previousItems), timeoutPromise])
    },
    [],
  )

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem(QUEUE_STORAGE_KEY)
    if (savedQueue) {
      try {
        const parsed = JSON.parse(savedQueue) as QueuedGuess[]
        setQueuedGuesses(parsed)
      } catch (error) {
        console.error("Failed to parse saved queue:", error)
      }
    }
  }, [QUEUE_STORAGE_KEY])

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    if (queuedGuesses.length > 0) {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queuedGuesses))
    } else {
      localStorage.removeItem(QUEUE_STORAGE_KEY)
    }
  }, [queuedGuesses, QUEUE_STORAGE_KEY])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const processQueue = useCallback(async () => {
    if (queuedGuesses.length === 0 || isProcessingQueue) return

    setIsProcessingQueue(true)

    // Process one guess at a time from the queue
    const guessToProcess = queuedGuesses[0]

    try {
      const result = await checkGuessWithTimeout(initialSession.category, guessToProcess.guess, allItems)

      // Remove from queue
      setQueuedGuesses((prev) => prev.filter((q) => q.id !== guessToProcess.id))

      // Handle result same as regular guess
      if (result.isValid) {
        if (isInfiniteMode) {
          setInfiniteItems((prev) => {
            if (prev.some((item) => item.toLowerCase() === result.normalizedName.toLowerCase())) {
              return prev
            }
            setInfiniteScore((s) => s + 1)
            setFeedback({ type: "success", message: `Queued: ${result.normalizedName} +1` })
            return [result.normalizedName, ...prev]
          })
        } else {
          setItems((prev) => {
            if (prev.some((item) => item.toLowerCase() === result.normalizedName.toLowerCase())) {
              return prev
            }
            setScore((s) => s + 1)
            setFeedback({ type: "success", message: `Queued: ${result.normalizedName} +1` })
            return [result.normalizedName, ...prev]
          })
        }
      } else {
        // In infinite mode, wrong guesses don't count as strikes
        if (!isInfiniteMode) {
          setStrikes((prev) => {
            const newStrikes = prev + 1
            if (newStrikes >= MAX_STRIKES) {
              setTimeout(() => {
                setItems((currentItems) => {
                  setScore((currentScore) => {
                    onEndGame({
                      ...initialSession,
                      items: currentItems,
                      score: currentScore,
                      strikes: newStrikes,
                    })
                    return currentScore
                  })
                  return currentItems
                })
              }, 1000)
            }
            return newStrikes
          })
        }
        setFeedback({ type: "error", message: `Queued: ${result.reason || "Invalid"}` })
      }

      setIsProcessingQueue(false)

      // Continue processing if there are more items in queue
      setQueuedGuesses((currentQueue) => {
        if (currentQueue.length > 0) {
          setTimeout(() => processQueue(), 500)
        }
        return currentQueue
      })
    } catch (error) {
      console.error("Failed to process queued guess:", error)
      // Keep in queue and stop processing for now
      setIsProcessingQueue(false)
      setIsOnline(false)
    }
  }, [queuedGuesses, isProcessingQueue, initialSession, onEndGame, checkGuessWithTimeout, isInfiniteMode, allItems])

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline && queuedGuesses.length > 0 && !isProcessingQueue) {
      processQueue()
    }
  }, [isOnline, queuedGuesses.length, isProcessingQueue, processQueue])

  // Update parent session whenever game state changes
  useEffect(() => {
    if (onSessionUpdate) {
      const updatedSession: GameSession = {
        ...initialSession,
        items,
        score,
        strikes,
        infiniteModeItems: infiniteItems,
        infiniteModeScore: infiniteScore,
      }
      onSessionUpdate(updatedSession)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, score, strikes, infiniteItems, infiniteScore])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const guess = input.trim()
    setInput("") // Clear immediately for better flow
    setIsChecking(true)
    setFeedback(null)

    // Check duplicates locally first (against all items in both modes)
    if (allItems.some((item) => item.toLowerCase() === guess.toLowerCase())) {
      setFeedback({
        type: "info",
        message: "Already listed!",
      })
      setIsChecking(false)
      return
    }

    // Check if already in queue
    if (queuedGuesses.some((q) => q.guess.toLowerCase() === guess.toLowerCase())) {
      setFeedback({
        type: "info",
        message: "Already in queue!",
      })
      setIsChecking(false)
      return
    }

    // Check if already pending
    if (pendingGuesses.some((p) => p.guess.toLowerCase() === guess.toLowerCase())) {
      setFeedback({
        type: "info",
        message: "Already validating!",
      })
      setIsChecking(false)
      return
    }

    // Add to pending immediately
    const pendingGuess: PendingGuess = {
      id: `${Date.now()}-${Math.random()}`,
      guess,
      timestamp: Date.now(),
    }
    setPendingGuesses((prev) => [...prev, pendingGuess])

    try {
      // Call AI with timeout
      const result = await checkGuessWithTimeout(initialSession.category, guess, allItems)

      // Remove from pending
      setPendingGuesses((prev) => prev.filter((p) => p.id !== pendingGuess.id))

      if (result.isValid) {
        // Check normalized duplicate against all items
        if (allItems.some((item) => item.toLowerCase() === result.normalizedName.toLowerCase())) {
          setFeedback({
            type: "info",
            message: "Already listed!",
          })
        } else {
          // Add to appropriate list based on mode
          if (isInfiniteMode) {
            setInfiniteItems((prev) => [result.normalizedName, ...prev])
            setInfiniteScore((prev) => prev + 1)
          } else {
            setItems((prev) => [result.normalizedName, ...prev])
            setScore((prev) => prev + 1)
          }
          setFeedback({ type: "success", message: "+1" })
        }
      } else {
        // In infinite mode, wrong guesses don't count as strikes
        if (!isInfiniteMode) {
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
        }
        setFeedback({ type: "error", message: result.reason || "Invalid" })
      }
    } catch (error) {
      // Remove from pending
      setPendingGuesses((prev) => prev.filter((p) => p.id !== pendingGuess.id))

      // Network error or timeout - add to queue
      console.error("Network error/timeout, queueing guess:", error)
      const queuedGuess: QueuedGuess = {
        id: `${Date.now()}-${Math.random()}`,
        guess,
        timestamp: Date.now(),
      }
      setQueuedGuesses((prev) => [...prev, queuedGuess])
      const isTimeout = error instanceof Error && error.message === "Request timeout"
      setFeedback({
        type: "queued",
        message: isTimeout ? "Queued (slow connection)" : "Queued (no connection)",
      })
      setIsOnline(false)
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
      infiniteModeItems: infiniteItems,
      infiniteModeScore: infiniteScore,
    })
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {/* Header Stats */}
      <div className="flex justify-between items-end pb-4 border-b-2 border-gray-100">
        <div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
            {isInfiniteMode ? "Infinite Mode" : "Category"}
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-brand-blue truncate max-w-[200px] md:max-w-xs">
            {initialSession.category}
          </h2>
        </div>
        <div className="text-right">
          {isInfiniteMode && (
            <p className="text-xs font-bold text-gray-400 mb-1">{score} + {infiniteScore} infinite</p>
          )}
          <p className="text-5xl font-black text-brand-pink tabular-nums">{displayScore}</p>
        </div>
      </div>

      {/* Strike Indicator or Infinite Mode Badge */}
      {isInfiniteMode ? (
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 rounded-full">
            <span className="text-2xl font-black text-brand-blue">∞</span>
            <span className="text-sm font-bold text-brand-blue uppercase tracking-wider">No Lives</span>
          </div>
        </div>
      ) : (
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
      )}

      {/* Input Area */}
      <div className="relative">
        <form onSubmit={handleSubmit} className={cn("relative z-20", feedback?.type === "error" && "animate-shake")}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isInfiniteMode && strikes >= MAX_STRIKES}
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
                    : feedback.type === "queued"
                      ? "bg-orange-500 text-white"
                      : "bg-brand-yellow text-black",
              )}
            >
              {feedback.type === "success" && <Check className="w-4 h-4" />}
              {feedback.type === "error" && <X className="w-4 h-4" />}
              {feedback.type === "queued" && <Clock className="w-4 h-4" />}
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Network Status & Queue Info */}
      {(!isOnline || queuedGuesses.length > 0) && (
        <div className="flex items-center justify-between gap-3 py-2 px-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-700">
              {!isOnline && "Offline - "}
              {queuedGuesses.length > 0 && `${queuedGuesses.length} message${queuedGuesses.length > 1 ? "s" : ""} queued`}
              {isProcessingQueue && " - Processing..."}
            </span>
          </div>
          {queuedGuesses.length > 0 && !isProcessingQueue && (
            <button
              onClick={() => {
                setIsOnline(true)
                processQueue()
              }}
              className="text-xs font-bold text-orange-700 hover:text-orange-900 underline"
            >
              Retry Now
            </button>
          )}
        </div>
      )}

      {/* Pending Guesses (Being Validated) */}
      {pendingGuesses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Validating...</h3>
          <div className="flex flex-wrap gap-3 content-start">
            <AnimatePresence initial={false} mode="popLayout">
              {pendingGuesses.map((pendingGuess, i) => (
                <motion.div
                  key={pendingGuess.id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-xl font-bold shadow-sm flex items-center gap-2"
                  style={{
                    rotate: i % 2 === 0 ? -1 : 1,
                    zIndex: pendingGuesses.length - i,
                  }}
                >
                  <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                  <span className="text-blue-800">{pendingGuess.guess}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Queued Guesses */}
      {queuedGuesses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Queued Messages</h3>
          <div className="flex flex-wrap gap-3 content-start">
            <AnimatePresence initial={false} mode="popLayout">
              {queuedGuesses.map((queuedGuess, i) => (
                <motion.div
                  key={queuedGuess.id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="px-4 py-2 bg-orange-100 border-2 border-dashed border-orange-300 rounded-xl font-bold shadow-sm flex items-center gap-2 opacity-75"
                  style={{
                    rotate: i % 2 === 0 ? -1 : 1,
                    zIndex: queuedGuesses.length - i,
                  }}
                >
                  <Clock className="w-3 h-3 text-orange-600 animate-pulse" />
                  <span className="text-orange-800">{queuedGuess.guess}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Validated Items List */}
      <div className="flex-1 min-h-[200px] mt-4">
        {allItems.length > 0 && (
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Validated</h3>
        )}
        <div className="flex flex-wrap gap-3 content-start">
          <AnimatePresence initial={false} mode="popLayout">
            {allItems.map((item, i) => {
              const isInfiniteItem = isInfiniteMode && i < infiniteItems.length
              return (
                <motion.div
                  key={item} // items are unique
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "px-4 py-2 border-2 rounded-xl font-bold shadow-sm flex items-center gap-2",
                    isInfiniteItem
                      ? "bg-brand-blue/10 border-brand-blue text-brand-blue"
                      : "bg-white border-black"
                  )}
                  style={{
                    rotate: i % 2 === 0 ? -1 : 1, // Slight rotation for playful look
                    zIndex: allItems.length - i,
                  }}
                >
                  {item}
                </motion.div>
              )
            })}
          </AnimatePresence>
          {allItems.length === 0 && queuedGuesses.length === 0 && pendingGuesses.length === 0 && (
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
