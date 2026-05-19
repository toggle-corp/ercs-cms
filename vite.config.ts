import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import { ValidateEnv as validateEnv } from '@togglecorp/vite-plugin-validate-env';

/* Get commit hash */
function getCommitHash(): string {
    if (process.env.APP_COMMIT_HASH) {
        return process.env.APP_COMMIT_HASH;
    }
    try {
        return execSync('git rev-parse --short HEAD').toString().trim();
    } catch (error) {
        throw new Error(
            'Unable to determine commit hash. You must either provide a commit hash using the APP_COMMIT_HASH environment variable,'
      + " or provide a valid Git repository (submodule doesn't work with docker).", { cause: error },
        );
    }
}

const commitHash = getCommitHash();

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';
    return {
        define: {
            APP_COMMIT_HASH: JSON.stringify(commitHash),
        },
        plugins: [
            isProd
                ? checker({
                    typescript: true,
                    eslint: {
                        lintCommand: 'eslint ./app',
                    },
                    stylelint: {
                        lintCommand: 'stylelint "./app/**/*.css"',
                    },
                })
                : undefined,
            svgr(),
            validateEnv({
                configFile: 'env',
            }),
            react(),
            babel({ presets: [reactCompilerPreset()] }),
        ],  
        resolve: {
            tsconfigPaths: true
        },
        css: {
            devSourcemap: isProd,
            modules: {
                scopeBehaviour: 'local',
                localsConvention: 'camelCaseOnly',
            },
        },
        sourcemap: isProd,
        build: {
            outDir: 'build',
            sourcemap: isProd,
        },
        envPrefix: 'APP_',
        server: {
            port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
            strictPort: true,
        },
    };
});
