import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/blocks/'          // ← ОБОВʼЯЗКОВО з обох боків «/»
})