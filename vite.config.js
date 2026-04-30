import {
    defineConfig
} from "vite"
import uni from "@dcloudio/vite-plugin-uni";

export default defineConfig({
    plugins: [
        uni()
    ],
    server: {
        port: 8888,
        proxy: {
            '/api/v1': {
                target: 'https://pre.schoolmate.website',
                changeOrigin: true,
                secure: false,
                rewrite: path => path.replace(/^\/api\/v1/, '/api/v1')
            },

       }
   }
})