import { motion, AnimatePresence } from "framer-motion"

export type OrbState = "idle" | "listening" | "thinking" | "speaking"

interface OrbProps {
  state: OrbState
}

function getAnimation(state: OrbState) {
  switch (state) {
    case "listening":
      return {
        scale: [1, 1.07, 0.97, 1.05, 1],
        transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" as const },
      }
    case "thinking":
      return {
        scale: [1, 1.03, 0.98, 1.02, 1],
        transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const },
      }
    case "speaking":
      return {
        scale: [1, 1.05, 0.96, 1.04, 0.98, 1],
        transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" as const },
      }
    default:
      return {
        scale: [1, 1.035, 1],
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
      }
  }
}

function getRingAnimation(state: OrbState) {
  if (state === "idle") return null
  return {
    scale: [1, 1.4, 1.7],
    opacity: [0.35, 0.15, 0],
    transition: {
      duration: state === "speaking" ? 0.9 : 1.6,
      repeat: Infinity,
      ease: "easeOut" as const,
    },
  }
}

const stateGlowColors: Record<OrbState, string> = {
  idle: "rgba(249,115,22,0.22), rgba(168,85,247,0.18)",
  listening: "rgba(249,115,22,0.35), rgba(168,85,247,0.28)",
  thinking: "rgba(168,85,247,0.35), rgba(249,115,22,0.2)",
  speaking: "rgba(249,115,22,0.4), rgba(168,85,247,0.3)",
}

export function Orb({ state }: OrbProps) {
  const anim = getAnimation(state)
  const ringAnim = getRingAnimation(state)

  return (
    <div
      className="relative flex items-center justify-center shrink-0
        w-[168px] h-[168px]
        min-[380px]:w-[184px] min-[380px]:h-[184px]
        sm:w-[224px] sm:h-[224px]
        lg:w-[256px] lg:h-[256px]"
    >
      {/* Ambient glow layer */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: "80%",
          height: "80%",
          background: `radial-gradient(circle, ${stateGlowColors[state]})`,
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
        }}
        animate={{ opacity: state === "idle" ? [0.7, 1, 0.7] : [0.85, 1, 0.85] }}
        transition={{ duration: state === "idle" ? 5 : 1.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pulse ring (active states only) */}
      <AnimatePresence>
        {ringAnim && (
          <motion.div
            key={state}
            className="absolute rounded-full border border-[#F97316]/30"
            style={{ width: "96%", height: "96%", top: "50%", left: "50%", x: "-50%", y: "-50%" }}
            initial={{ scale: 1, opacity: 0.3 }}
            animate={ringAnim}
          />
        )}
      </AnimatePresence>

      {/* Main orb */}
      <motion.div
        className="relative rounded-full"
        style={{ width: "92%", height: "92%" }}
        animate={anim}
      >
        {/* Sphere gradient */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 38% 32%, #FFBA6B 0%, #FF6B35 22%, #E040B5 48%, #9333EA 68%, #5B21B6 88%, #3B0764 100%)",
            boxShadow:
              "0 25px 80px rgba(249,115,22,0.28), 0 8px 40px rgba(147,51,234,0.32), inset 0 -24px 48px rgba(59,7,100,0.35), inset 0 8px 24px rgba(255,186,107,0.12)",
          }}
        />

        {/* Specular highlight */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 36% 28%, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.18) 22%, transparent 52%)",
          }}
        />

        {/* Soft inner rim */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 65% 70%, rgba(59,7,100,0.2) 0%, transparent 55%)",
          }}
        />

        {/* Thinking indicator */}
        <AnimatePresence>
          {state === "thinking" && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.08) 25%, transparent 50%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
