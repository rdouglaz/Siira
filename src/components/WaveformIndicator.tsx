import { motion } from "framer-motion"

const BAR_HEIGHTS = [0.45, 0.72, 0.55, 1.0, 0.65, 0.85, 0.5, 0.78, 0.4]

interface WaveformIndicatorProps {
  active: boolean
}

export function WaveformIndicator({ active }: WaveformIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height: 28 }}>
      {BAR_HEIGHTS.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ height: 28, originY: 0.5 } as React.CSSProperties}
          animate={
            active
              ? {
                  scaleY: [h * 0.25, h, h * 0.45, h * 0.85, h * 0.3],
                  opacity: [0.6, 1, 0.7, 1, 0.6],
                  backgroundColor: ["#F97316", "#FB923C", "#F97316"],
                }
              : { scaleY: 0.12, opacity: 0.3, backgroundColor: "#D6D3D1" }
          }
          transition={
            active
              ? {
                  duration: 0.9 + (i % 4) * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.07,
                }
              : { duration: 0.4, ease: "easeOut" }
          }
          initial={{ scaleY: 0.12, opacity: 0.3 }}
        />
      ))}
    </div>
  )
}
