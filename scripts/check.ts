import path from "path";
import fs, { writeFileSync, copyFileSync, mkdirSync } from "fs";
import prettier from "prettier";
//
// Check Package
//

// Checks the setup of a package to see if it is compliant with the standard

function readJsonFile<T>(path: string): T {
    const data = fs.readFileSync(path).toString();
    const value = JSON.parse(data);
    return value as T;
}

function fileExists(path: string) {
    return fs.existsSync(path) && fs.lstatSync(path).isFile;
}

function directoryExists(path: string) {
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

    devDependencies: {
        [key: string]: string;
    };
}

interface PrettierConfigJson {
    tabWidth: number;
    endOfLine: string;
}

interface SettingsJson {
    [key: string]: string;
}

function getJsonText(o: unknown): string {
    return formatJson(JSON.stringify(o));
}

function writeJsonFile(path: string, o: unknown) {
    writeFileSync(path, getJsonText(o));
}

class PackageItems {
    /**
     * package root directory
     * path
     */
    readonly root: string;

    /**
     * package.json
     * path
     */
    readonly package: string;

    /**
     * config
     * path
     */
    readonly configDirectory: string;

    /**
     * scripts
     * path
     */
    readonly scriptsDirectory: string;

    /**
     * config/prettier.json
     * path
     */
    readonly prettier: string;

    /**
     * LICENSE
     * path
     */
    readonly license: string;

    /**
     * CHANGELOG.md
     * path
     */
    readonly changelog: string;

    /**
     * .vscode/settings.json
     * path
     */
    readonly settings: string;

    constructor(root: string) {
        this.root = root;

        this.package = path.join(this.root, "package.json");
        this.configDirectory = path.join(this.root, "config");
        this.scriptsDirectory = path.join(this.root, "scripts");
        this.prettier = path.join(this.configDirectory, "prettier.json");
        this.license = path.join(this.root, "LICENSE");
        this.changelog = path.join(this.root, "CHANGELOG.md");
        this.settings = path.join(this.root, ".vscode", "settings.json");
    }

    getPackageJson(): PackageJson | undefined {
        return getFileJson<PackageJson>(this.package);
    }

    writePackageJson(o: PackageJson) {
        writeJsonFile(this.package, o);
    }

    /**
     * add source package field values to this package
     * overwrites the value if already present
     * @param source
     * @param field
     * @param values
     * @returns
     */
    addPackageJsonFieldValues(
        source: PackageItems,
        field: "scripts" | "devDependencies",
        values: string[]
    ) {
        const packageJsonSource = source.getPackageJson();

        const packageJsonTarget = this.getPackageJson();

        if (packageJsonSource === undefined) {
            console.log(`ERROR: missing source package.json ${source.package}}`);
            return;
        }

        if (packageJsonTarget === undefined) {
            console.log(`ERROR: missing target package.json ${this.package}}`);
            return;
        }

        values.forEach((name) => {
            const present = packageJsonSource[field][name] !== undefined;

            if (present) {
                packageJsonTarget[field][name] = packageJsonSource[field][name];
            } else {
                console.log(`ERROR: script [${name}] not present in source`);
            }
        });

        this.writePackageJson(packageJsonTarget);
    }

    /**
     * add setting values from source to this package
     * overwrites values if present
     * @param source
     * @param values
     * @returns
     */
    addSettingsJsonValues(source: PackageItems, values: string[]) {
        const settingsSource = source.getSettingsJson();
        const jsonTarget = this.getSettingsJson();

        if (settingsSource === undefined) {
            console.log(`ERROR: missing source settings.json ${source.settings}}`);
            return;
        }

        if (jsonTarget === undefined) {
            console.log(`ERROR: missing target settings.json ${this.settings}}`);
            return;
        }

        values.forEach((name) => {
            const present = settingsSource[name] !== undefined;

            if (present) {
                jsonTarget[name] = settingsSource[name];
            } else {
                console.log(`ERROR: script [${name}] not present in source`);
            }
        });

        this.writeSettingsJson(jsonTarget);
    }

    /**
     * add source package config file to this package
     * overwrites if present
     * @param source
     * @param name
     */
    addConfigFile(source: PackageItems, name: string) {
        const configSource = path.join(source.configDirectory, name);
        const configTarget = path.join(this.configDirectory, name);

        if (!directoryExists(this.configDirectory)) {
            mkdirSync(this.configDirectory);
        }

        copyFileSync(configSource, configTarget);
    }

    getPrettierConfigJson(): PrettierConfigJson | undefined {
        return getFileJson<PrettierConfigJson>(this.prettier);
    }

    getSettingsJson(): SettingsJson | undefined {
        return getFileJson<SettingsJson>(this.settings);
    }

    writeSettingsJson(o: SettingsJson) {
        writeJsonFile(this.settings, o);
    }

    /**
     * copes over scripts from source
     * @param source
     * @param names
     */
    addScripts(source: PackageItems, names: string[]) {
        names.forEach((name) => {
            const from = path.join(source.scriptsDirectory, name);
            const to = path.join(this.scriptsDirectory, name);
            fs.copyFileSync(from, to);
        });
    }
}

function getPackageItemPaths(packagePath: string): PackageItems {
    return new PackageItems(packagePath);
}

function getFileJson<T>(filePath: string): T | undefined {
    const present = fileExists(filePath);
    if (present) {
        const data = readJsonFile<T>(filePath);
        return data;
    }

    return undefined;
}

function checkPrettierConfig(configPath: string): void {
    console.log("check - prettier");

    const config = getFileJson<PrettierConfigJson>(configPath);
    if (config === undefined) {
        console.log(`ERROR: missing config ${configPath}}`);
        return;
    }

    const expected: PrettierConfigJson = {
        tabWidth: 4,
        endOfLine: "lf",
    };

    const properties = Object.getOwnPropertyNames(expected) as (keyof PrettierConfigJson)[];

    properties.forEach((name) => {
        const value = expected[name];
        const actual = config[name];
        if (typeof value !== typeof actual || JSON.stringify(value) !== JSON.stringify(actual)) {
            console.log(
                `   WARNING: key: [${name}] expected [${value}] does not match actual [${actual}]`
            );
        }
    });
}

function checkPackageJson(packagePathSelf: string, packagePathTarget: string) {
    console.log("check - package.json");

    const config = getFileJson<PackageJson>(packagePathTarget);
    if (config === undefined) {
        console.log(`ERROR: missing config ${packagePathTarget}}`);
        return;
    }

    const scriptNamesExpected = ["lint", "style", "compile", "test", "doc"];

    const scripts = config.scripts;
    if (scripts === undefined) {
        console.log(`    WARNING: scripts is missing`);
    } else {
        const scriptNames = Object.getOwnPropertyNames(scripts);
        const missing = scriptNamesExpected.filter((name) => !scriptNames.includes(name));

        missing.forEach((name) => {
            console.log(`    WARNING: missing script: [${name}]`);
        });
    }

    const configSelf = getFileJson<PackageJson>(packagePathSelf);
    if (configSelf === undefined) {
        console.log(`ERROR: missing config ${packagePathSelf}}`);
        return;
    }

    // check
    const devDependencies = config.devDependencies;
    const devDependenciesSelf = configSelf.devDependencies;

    if (devDependencies === undefined) {
        console.log(`    WARNING: devDependencies is missing`);
    } else if (devDependenciesSelf === undefined) {
        console.log(`    ERROR: devDependencies is missing from own package!`);
    } else {
        // compare devDependencies
        const names = Object.getOwnPropertyNames(devDependenciesSelf);

        names.forEach((name: string) => {
            const value = devDependenciesSelf[name];
            const actual = devDependencies[name];

            if (value !== undefined && actual === undefined) {
                console.log(`    ERROR: devDependencies is missing "${name}": "${value}",`);
            } else if (value !== actual) {
                console.log(`    WARNING: devDependencies: expected "${name}": "${value}",`);
            }
        });
    }
}

function checkPackage(packageSelf: PackageItems, packageTarget: PackageItems) {
    checkPrettierConfig(packageTarget.prettier);
    checkPackageJson(packageSelf.package, packageTarget.package);
}

function updatePackage(packageSelf: PackageItems, packageTarget: PackageItems) {
    //
    // package.json
    //

    // update all the tool versions
    const packageJsonSelf = packageSelf.getPackageJson();
    const packageJsonTarget = packageTarget.getPackageJson();

    if (packageJsonSelf !== undefined && packageJsonTarget !== undefined) {
        Object.getOwnPropertyNames(packageJsonSelf.devDependencies || {}).forEach((name) => {
            const present = packageJsonTarget.devDependencies[name] !== undefined;
            // only update if already present
            // this allows deletion of unused packages
            if (present) {
                packageJsonTarget.devDependencies[name] = packageJsonSelf.devDependencies[name];
            }
        });

        // simply overwrite these scripts if present
        const scripts = ["test", "clean", "prettier", "eslint", "eslint-fix", "prepack", "build"];
        scripts.forEach((name) => {
            const present = packageJsonTarget.scripts[name] !== undefined;
            // only update if already present
            // this allows persistance of deletion for unused scripts
            if (present) {
                packageJsonTarget.scripts[name] = packageJsonSelf.scripts[name];
            }
        });

        packageTarget.writePackageJson(packageJsonTarget);
    }

    //
    // settings.json
    //

    // overwrite specific settings.json if present
    const settings = ["prettier.configPath", "eslint.options", "markdownlint.config"];

    const settingsJsonSelf = packageSelf.getSettingsJson();
    const settingsJsonTarget = packageTarget.getSettingsJson();

    if (settingsJsonSelf !== undefined && settingsJsonTarget !== undefined) {
        settings.forEach((name) => {
            const present = settingsJsonTarget[name] !== undefined;
            if (present) {
                settingsJsonTarget[name] = settingsJsonSelf[name];
            }
        });

        packageTarget.writeSettingsJson(settingsJsonTarget);
    }
}

/**
 * Add style related tooling to an existing package
 * @param packageSource
 * @param packageTarget
 */
function addStyle(packageSource: PackageItems, packageTarget: PackageItems) {
    // copy over package.json scripts
    packageTarget.addPackageJsonFieldValues(packageSource, "scripts", [
        "style",
        "style-check",
        "prettier",
        "prettier-check",
    ]);

    // copy over package.json devDependencies
    packageTarget.addPackageJsonFieldValues(packageSource, "devDependencies", ["prettier"]);

    // copy over config
    packageTarget.addConfigFile(packageSource, "prettier.json");

    // copy over .vscode/settings.json settings
    packageTarget.addSettingsJsonValues(packageSource, ["prettier.configPath"]);
}

/**
 * Add lint related tooling to an existing package
 * @param packageSource
 * @param packageTarget
 */
function addLint(packageSource: PackageItems, packageTarget: PackageItems) {
    // copy over package.json scripts
    packageTarget.addPackageJsonFieldValues(packageSource, "scripts", [
        "lint",
        "lint-fix",
        "eslint",
        "eslint-fix",
    ]);

    // copy over package.json devDependencies
    packageTarget.addPackageJsonFieldValues(packageSource, "devDependencies", [
        "eslint",
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser",
    ]);

    // copy over config
    packageTarget.addConfigFile(packageSource, "eslint.json");

    // copy over .vscode/settings.json settings
    packageTarget.addSettingsJsonValues(packageSource, ["eslint.options"]);
}

/**
 * Add lint related tooling to an existing package
 * @param packageSource
 * @param packageTarget
 */
function addClean(packageSource: PackageItems, packageTarget: PackageItems) {
    // copy over package.json scripts
    packageTarget.addPackageJsonFieldValues(packageSource, "scripts", ["clean"]);

    // copy over script
    packageTarget.addScripts(packageSource, ["clean.js"]);
}

function runAction(parameters: string[]) {
    const [action, otherPackage] = parameters;

    const packagePathSource = path.join(__dirname, "..");
    const packagePathTarget = otherPackage || packagePathSource;

    const packageSource = getPackageItemPaths(packagePathSource);
    const packageTarget = getPackageItemPaths(packagePathTarget);

    switch (action) {
        case "check":
            checkPackage(packageSource, packageTarget);
            break;
        case "update":
            updatePackage(packageSource, packageTarget);
            break;
        case "add-style":
            addStyle(packageSource, packageTarget);
            break;
        case "add-lint":
            addLint(packageSource, packageTarget);
            break;
        case "add-clean":
            addClean(packageSource, packageTarget);
            break;
        default:
            console.log(`invalid action: ${action}
usage: check
            `);
            break;
    }
}

const parameters = process.argv.slice(2);

runAction(parameters);

/*
Clean up things in the package that are only for reference

- make src/index blank
- delete src/f.ts
- clear documentation to only contain deploy.md
- clear README
*/
