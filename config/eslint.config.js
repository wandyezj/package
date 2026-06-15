const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
    {
        ignores: ["dist/**", "temp/**", "node_modules/**"],
    },
    {
        files: ["**/*.{ts,tsx,js}"],
        languageOptions: {
            ecmaVersion: 2025,
            sourceType: "module",
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2025,
                sourceType: "module",
            },
            globals: {
                // Browser globals
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                // Node.js globals
                global: "readonly",
                process: "readonly",
                Buffer: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tsPlugin.configs.recommended.rules,
            "no-undef": "off",

            // https://eslint.org/docs/latest/rules/eqeqeq
            // poka-yoke
            eqeqeq: ["error", "always"],

            // Indent is enforced by prettier
            indent: "off",
            "linebreak-style": ["warn", "unix"],

            // https://eslint.org/docs/latest/rules/quotes
            // consistency
            quotes: ["warn", "double", { allowTemplateLiterals: true, avoidEscape: true }],

            // https://eslint.org/docs/latest/rules/semi
            // poka-yoke
            semi: ["warn", "always"],
            "no-debugger": "warn",

            //
            // TypeScript ESLint Rules
            //

            // https://typescript-eslint.io/rules/no-inferrable-types/
            // disable - sometimes want to explicitly define types.
            "@typescript-eslint/no-inferrable-types": 0,

            // https://typescript-eslint.io/rules/no-var-requires/
            // disable - require is used in node js scripts
            "@typescript-eslint/no-var-requires": 0,

            // https://typescript-eslint.io/rules/naming-convention/
            // consistency
            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    selector: ["default"],
                    format: ["strictCamelCase"],
                    leadingUnderscore: "forbid",
                    trailingUnderscore: "forbid",
                },
                {
                    selector: ["variable"],
                    modifiers: ["const"],
                    format: ["strictCamelCase"],
                    leadingUnderscore: "forbid",
                    trailingUnderscore: "forbid",
                },
                {
                    selector: ["enumMember"],
                    format: ["PascalCase"],
                    leadingUnderscore: "forbid",
                    trailingUnderscore: "forbid",
                },
                {
                    selector: ["typeLike"],
                    format: ["StrictPascalCase"],
                },
                {
                    selector: ["interface"],
                    format: ["StrictPascalCase"],
                    custom: {
                        // Interface names must NOT be prefixed with I
                        regex: "^I[A-Z]",
                        match: false,
                    },
                },
            ],
        },
    },
    {
        files: ["scripts/**/*.js"],
        languageOptions: {
            sourceType: "script",
            globals: {
                console: "readonly",
                require: "readonly",
                module: "readonly",
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
    {
        files: ["test/**/*.{ts,tsx,js}"],
        languageOptions: {
            globals: {
                test: "readonly",
                expect: "readonly",
                describe: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
            },
        },
    },
];
