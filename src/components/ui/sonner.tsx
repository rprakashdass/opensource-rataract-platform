"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-violet-600 text-white border-violet-700 shadow-xl rounded-lg font-medium",
          description: "text-violet-100",
          actionButton:
            "bg-white text-violet-600 font-semibold hover:bg-violet-50",
          cancelButton:
            "bg-violet-500 text-white hover:bg-violet-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
