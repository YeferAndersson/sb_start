// src/components/template/HeaderThemeToggle.tsx
import React from 'react'
import Button from '@/components/ui/Button'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { TbSun, TbMoon } from 'react-icons/tb'

const HeaderThemeToggle = () => {
  const [isDark, setIsDark] = useDarkMode()

  const toggleTheme = () => {
    setIsDark(isDark ? 'light' : 'dark')
  }

  return (
    <Button
      variant="plain"
      size="md"
      icon={isDark ? <TbMoon /> : <TbSun />}
      onClick={toggleTheme}
      className="mx-1"
    />
  )
}

export default HeaderThemeToggle