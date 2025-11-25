"use client"

import { useState } from "react"
import { Play, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { GameSession } from "./game-manager"

interface GameDetailsDialogProps {
  game: GameSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartNewGame: (category: string) => void
}

export function GameDetailsDialog({
  game,
  open,
  onOpenChange,
  onStartNewGame,
}: GameDetailsDialogProps) {
  const [showSpoiler, setShowSpoiler] = useState(false)

  if (!game) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {game.category}
          </DialogTitle>
          <DialogDescription>
            Played on {new Date(game.date).toLocaleDateString()} •{" "}
            {game.score} items found • {game.strikes} strikes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Spoiler Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-600 uppercase tracking-wider">
                Items Found
              </h3>
              <button
                onClick={() => setShowSpoiler(!showSpoiler)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
              >
                {showSpoiler ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Show
                  </>
                )}
              </button>
            </div>

            {showSpoiler ? (
              <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {game.items.map((item, index) => (
                    <div
                      key={index}
                      className="text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-8 text-center">
                <p className="text-gray-400 font-bold text-sm">
                  Click "Show" to reveal the items
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => {
              onOpenChange(false)
              setShowSpoiler(false)
              onStartNewGame(game.category)
            }}
            className="w-full btn-primary bg-brand-green text-white hover:bg-green-600 border-green-800 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            Play Again
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
