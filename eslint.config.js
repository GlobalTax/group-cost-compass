import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "*.config.*"] },
  
  // ========================================
  // CONFIGURACIÓN BASE (todo el código)
  // ========================================
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      
      /* REGLAS SUAVES (no rompen build) */
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      "no-var": "error",
    },
  },

  // ========================================
  // CONFIGURACIÓN ESTRICTA (solo repositorios/libs)
  // ========================================
  {
    files: [
      "src/lib/supabase/repositories/**/*.ts",
      "src/lib/validators/**/*.ts",
      "src/lib/parsers/**/*.ts",
      "src/lib/exporters/**/*.ts",
      "src/lib/supabase/types/**/*.ts"
    ],
    rules: {
      /* REGLAS ESTRICTAS (solo nuevos módulos) */
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": ["error", {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      }],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/strict-boolean-expressions": ["error", {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
      }],
      "no-console": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
    },
  },

  // ========================================
  // REGLAS ARQUITECTÓNICAS (enforcement)
  // ========================================
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/supabase/repositories/**"],
    rules: {
      /* Bloquear imports directos de supabase fuera de repositorios */
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["**/integrations/supabase/client"],
          importNames: ["supabase"],
          message: "⛔ No importes supabase directamente. Usa repositorios en src/lib/supabase/repositories/"
        }]
      }],
      
      /* Limitar complejidad y tamaño de funciones */
      "max-lines-per-function": ["warn", { 
        max: 100, 
        skipBlankLines: true, 
        skipComments: true 
      }],
      "complexity": ["warn", 15],
      "max-depth": ["warn", 4],
    }
  },

  // Regla global para archivos grandes
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "max-lines": ["warn", { max: 500, skipBlankLines: true, skipComments: true }]
    }
  }
);
