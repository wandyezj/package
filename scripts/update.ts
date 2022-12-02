/*
Update an existing package

Usage: npm run update [package to update root path]

Point to package.json
*/

import * as fs from "fs";
import prettier from "prettier";
import * as path from "path";

/**
 * do all the automatic updates to a package
 */
function update() {
    const parameters = process.argv.slice(2);

    if (parameters.length !== 1) {
        console.log("usage: [package directory root path]");
        process.exit(1);
    }

    const [targetPackageRoot] = parameters;
    const targetPackage = new Package(targetPackageRoot);

    const ownPackageRoot = path.join(__dirname, "..");
    const ownPackage = new Package(ownPackageRoot);

    console.log("\nAdjustments\n");

    // Discard windows specific scripts
    updatePackageScriptsDiscardWindowsScripts(targetPackage);

    // consolidate specific scripts
    // [keep, copyOver]
    // set keep script to value of copyOver script, and delete copyOver script
    updateOverrideScripts(targetPackage, [
        ["style", "prettier"],
        ["style-check", "prettier-check"],
        ["lint", "eslint"],
        ["lint-fix", "eslint-fix"],
    ]);

    // update clean script
    updateScriptClean(targetPackage, ownPackage);

    // Update package.json license
    updateLicense(targetPackage, ownPackage);

    // add package.json style-check
    updateScriptsAddStyleCheck(targetPackage, ownPackage);

    updateVscodeExtensionRecommendations(targetPackage);

    // check for expected scripts
    console.log("\nScript Inventory\n");
    doScriptInventory(targetPackage, ownPackage);

    // TODO place scripts in same order as ownPackage with others at the bottom

    // TODO Remove package.directories
    // delete all except bin and man
    // if no directories remove entire field

    // Write out updates target package.json
    writeFormattedJsonObject(targetPackage.packageJson, targetPackage.packageJsonPath);
    writeFormattedJsonObject(targetPackage.extensionsJson, targetPackage.extensionsJsonPath);
}

function writeFormattedJsonObject(object: unknown, filePath: string) {
    const text = formatJson(JSON.stringify(object));
    fs.writeFileSync(filePath, text);
}

update();

/**
 * class to describe a NPM package
 */
class Package {
    readonly packageJsonPath: string;
    packageJson: PackageJson;

    readonly directoryScripts: string;
    readonly fileScriptClean: string;

    readonly extensionsJsonPath: string;
    /**
     * .vscode/extension.json
     * undefined if not present
     */
    readonly extensionsJson: undefined | ExtensionsJson;

    constructor(public readonly directoryRoot: string) {
        this.packageJsonPath = path.join(this.directoryRoot, "package.json");
        if (!fileExists(this.packageJsonPath)) {
            throw new Error(`package.json not found: ${this.packageJsonPath}`);
        }

        this.packageJson = readJsonFile<PackageJson>(this.packageJsonPath);

        this.directoryScripts = path.join(directoryRoot, "scripts");
        this.fileScriptClean = path.join(this.directoryScripts, "clean.js");

        this.extensionsJsonPath = path.join(this.directoryRoot, ".vscode", "extensions.json");
        if (fileExists(this.extensionsJsonPath)) {
            this.extensionsJson = readJsonFile<ExtensionsJson>(this.extensionsJsonPath);
        }
    }

    packageJsonScripts(): string[] {
        const packageScripts = Object.getOwnPropertyNames(this.packageJson.scripts);
        return packageScripts;
    }
}

function doScriptInventory(targetPackage: Package, ownPackage: Package) {
    const ownPackageScripts = ownPackage.packageJsonScripts();
    const targetPackageScripts = targetPackage.packageJsonScripts();

    const scriptsMissing: string[] = [];
    const lastScriptIndex = ownPackageScripts.indexOf("check");
    ownPackageScripts.slice(0, lastScriptIndex).forEach((name) => {
        const present = targetPackageScripts.includes(name);
        console.log(`${present ? "✓" : "X"} ${name}`);
        if (!present) {
            scriptsMissing.push(name);
        }
    });

    console.log(`\nScripts Missing [${scriptsMissing.length}]\n\n${scriptsMissing.join("\n")}`);
}

// Specific Update Functions

function updateVscodeExtensionRecommendations(targetPackage: Package) {
    if (targetPackage.extensionsJson !== undefined) {
        const obsoleteName = "coenraads.bracket-pair-colorizer";
        targetPackage.extensionsJson.recommendations =
            targetPackage.extensionsJson.recommendations.filter((name) => name !== obsoleteName);
    }
}

function updateScriptsAddStyleCheck(targetPackage: Package, ownPackage: Package) {
    const targetPackageScripts = targetPackage.packageJsonScripts();
    if (targetPackageScripts.includes("style") && !targetPackageScripts.includes("style-check")) {
        console.log(`add package.json script: style-check`);
        targetPackage.packageJson.scripts["style-check"] =
            ownPackage.packageJson.scripts["style-check"];
    }
}

function updatePackageScriptsDiscardWindowsScripts(targetPackage: Package) {
    const targetPackageScripts = Object.getOwnPropertyNames(targetPackage.packageJson.scripts);

    targetPackageScripts.forEach((name) => {
        if (name.endsWith("-windows")) {
            console.log(`delete package.json script: ${name}`);
            delete targetPackage.packageJson.scripts[name];
        }
    });
}

/**
 * Fix license field spelling.
 * package.json license Unlicensed -> Unlicense
 * @param targetPackage
 * @param ownPackage
 */
function updateLicense(targetPackage: Package, ownPackage: Package) {
    const targetLicense = targetPackage.packageJson.license;
    const ownLicense = ownPackage.packageJson.license;
    if (targetLicense !== ownLicense && targetLicense === "Unlicensed") {
        console.log(`update package.json license: from ${targetLicense} to ${ownLicense}`);
        targetPackage.packageJson.license = ownPackage.packageJson.license;
    }
}

/**
 * replace existing clean script with node based clean script.
 * @param targetPackage
 * @param ownPackage
 * @param targetPackageRootPath
 * @param ownPackageScriptsCleanPath
 */
function updateScriptClean(targetPackage: Package, ownPackage: Package) {
    /**
     * only replace the following targets
     */
    const validTargets = [
        "if exist dist (rmdir /s /q dist)",
        "rm --dir --recursive --verbose --force dist temp",
        "if exist dist (rmdir /S /Q dist) && if exist temp (rmdir /S /Q temp)",
    ];

    const targetPackageScripts = targetPackage.packageJsonScripts();

    if (targetPackageScripts.includes("clean")) {
        if (validTargets.includes(targetPackage.packageJson.scripts["clean"])) {
            console.log("update package.json script: clean");
            targetPackage.packageJson.scripts["clean"] = ownPackage.packageJson.scripts["clean"];

            // make scripts directory
            const targetPackageScriptsDirectoryPath = targetPackage.directoryScripts;

            if (!directoryExits(targetPackageScriptsDirectoryPath)) {
                console.log("create package directory: scripts");
                fs.mkdirSync(targetPackageScriptsDirectoryPath);
            }

            // copy over clean.js
            const targetPackageScriptsCleanPath = path.join(
                targetPackageScriptsDirectoryPath,
                "clean.js"
            );
            if (!fileExists(targetPackageScriptsCleanPath)) {
                console.log("create package file: scripts/clean.js");
                fs.copyFileSync(ownPackage.fileScriptClean, targetPackage.fileScriptClean);
            }
        }
    }
}

/**
 * in package.json scripts
 * if keep and copyOver exist
 * overwrites keep with copyOver and delete copyOver
 * @param targetPackage
 * @param overwrites array of [keep, copyOver]
 */
function updateOverrideScripts(targetPackage: Package, overwrites: [string, string][]) {
    const targetPackageScripts = Object.getOwnPropertyNames(targetPackage.packageJson.scripts);

    overwrites.forEach(([keep, copyOver]) => {
        if (targetPackageScripts.includes(keep) && targetPackageScripts.includes(copyOver)) {
            console.log(`${keep} = ${copyOver}`);
            targetPackage.packageJson.scripts[keep] = targetPackage.packageJson.scripts[copyOver];

            console.log(`delete package.json script: ${copyOver}`);
            delete targetPackage.packageJson.scripts[copyOver];
        }
    });
}

// Helpers

function readJsonFile<T>(path: string): T {
    const data = fs.readFileSync(path).toString();
    const value = JSON.parse(data);
    return value as T;
}

function fileExists(path: string) {
    return fs.existsSync(path) && fs.lstatSync(path).isFile;
}

function directoryExits(path: string) {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory;
}

function formatText(
    text: string,
    parser: "json" | "typescript" | "markdown" | "babel",
    options?: {
        printWidth?: number;
    }
): string {
    return prettier.format(text, {
        trailingComma: "es5",
        tabWidth: 4,
        semi: true,
        //singleQuote: true,
        arrowParens: "always",
        endOfLine: "lf",
        proseWrap: "preserve",
        printWidth: options?.printWidth || 80, // Swap to 120 to preserve function names on a single line
        parser,
    });
}

export function formatJson(
    text: string,
    options?: {
        printWidth?: number;
    }
): string {
    return formatText(text, "json", options);
}

interface PackageJson {
    scripts: {
        [key: string]: string;
    };
    license?: string;
    directories?: {
        [key: string]: string;
    };
}

interface ExtensionsJson {
    recommendations: string[];
}
