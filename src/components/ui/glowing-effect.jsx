"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export const GlowingEffect = ({
    spread = 40,
    glow = true,
    disabled = false,
    proximity = 64,
    inactiveZone = 0.01,
    className,
}) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    const ref = useRef(null);

    const handleMouseMove = useCallback(
        (e) => {
            if (!ref.current || disabled) return;

            const rect = ref.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (x < -proximity || x > rect.width + proximity || y < -proximity || y > rect.height + proximity) {
                setOpacity(0);
                return;
            }

            setPosition({ x, y });
            setOpacity(1);
        },
        [disabled, proximity]
    );

    const handleMouseLeave = useCallback(() => {
        setOpacity(0);
    }, []);

    useEffect(() => {
        if (disabled) return;
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [handleMouseMove, disabled]);

    return (
        <div
            ref={ref}
            className={cn(
                "pointer-events-none absolute -inset-px hidden rounded-xl opacity-0 transition-opacity duration-300 group-hover:block group-hover:opacity-100",
                className
            )}
            style={{
                background: `radial-gradient(${spread}px circle at ${position.x}px ${position.y}px, var(--glow-color, rgba(255,255,255,0.1)), transparent 100%)`,
            }}
        >
            <div className={cn("absolute inset-0 h-full w-full bg-transparent", className)}>
                {glow && !disabled && (
                    <motion.div
                        animate={{
                            opacity: opacity,
                        }}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut",
                        }}
                        className="absolute inset-0 h-full w-full"
                        style={{
                            background: `radial-gradient(${spread}px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.15), transparent 100%)`,
                        }}
                    />
                )}
            </div>
        </div>
    );
};
