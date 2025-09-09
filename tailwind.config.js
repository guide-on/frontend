// tailwind.config.js (ESM)
import twColors from 'tailwindcss/colors'
import jiti from 'jiti'
import path from 'node:path'

const _require = jiti(import.meta.url) // ← TS/ESM도 불러와 줌
const customMod = _require(path.resolve('./src/styles/colors.ts'))
const customAll = (customMod?.colors) ?? {}
const { gray: brandGray, ...rest } = customAll

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx,vue,css}",
    ],
    theme: {
        extend: {
            colors: {
                ...rest,
                gray: twColors.gray,                 // 기본 gray 복구(100/200/…)
                ...(brandGray ? { brandGray } : {}), // 단일 hex는 brandGray로 사용
            },
        },
    },
    plugins: [],
}
