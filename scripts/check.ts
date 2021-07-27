import path from "path";
import fs, { writeFileSync } from "fs";
import * as child_process from "child_process";

//
// Check Environment
//

function env(variable: string): string {
    const value = process.env[variable];
    return value === undefined ? "" : value;
}

interface Environment {
    GITHUB_REF?: string;
    GITHUB_ACTOR?: string;
    GITHUB_EVENT_NAME?: string;
    GITHUB_HEAD_REF?: string;
    GITHUB_WORKSPACE?: string;

    BRANCH_NAME?: string;
}

function getEnvironmentVariables(): Environment {
    const names: (keyof Environment)[] = [
        "GITHUB_REF",
        "GITHUB_ACTOR",
        "GITHUB_EVENT_NAME",
        "GITHUB_HEAD_REF",
        "GITHUB_WORKSPACE",
        "BRANCH_NAME",
    ];

    const o: Environment = {};
    names.forEach((name) => {
        o[name] = env(name);
    });

    return o;
}

function checkEnvironment(): void {
    console.log("Check Environment");
    const variables = getEnvironmentVariables();
    console.log("\n\n");
    console.log(variables);
    console.log("\n\n");

    const versionData = executeCommand(`npm --version`);
    console.log(versionData);
    console.log("\n\n");
}

function executeCommand(
    command: string,
    workingDirectory?: string,
    ignoreError?: boolean
): string {
    console.log(command);

    const options: child_process.ExecSyncOptions = { encoding: "utf8" };
    if (workingDirectory !== undefined) {
        options.cwd = workingDirectory;
    }
    if (ignoreError !== undefined && ignoreError) {
        options.stdio = ["ignore", "pipe", "ignore"];
    }

    return child_process.execSync(command, options).toString();
}

checkEnvironment();

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

function getConfigPath(packagePath: string, fileName: string) {
    return path.join(packagePath, "config", fileName);
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

    constructor(root: string) {
        this.root = root;

        this.package = path.join(this.root, "package.json");
        this.prettier = getConfigPath(this.root, "prettier.json");
        this.license = path.join(this.root, "LICENSE");
        this.changelog = path.join(this.root, "CHANGELOG.md");
    }

    get packageJson(): PackageJson | undefined {
        return getFileJson<PackageJson>(this.package);
    }

    writePackageJson(packageJson: PackageJson) {
        writeFileSync(this.package, JSON.stringify(packageJson));
    }

    get prettierConfigJson(): PrettierConfigJson | undefined {
        return getFileJson<PrettierConfigJson>(this.prettier);
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

    const properties = Object.getOwnPropertyNames(
        expected
    ) as (keyof PrettierConfigJson)[];

    properties.forEach((name) => {
        const value = expected[name];
        const actual = config[name];
        if (
            typeof value !== typeof actual ||
            JSON.stringify(value) !== JSON.stringify(actual)
        ) {
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
        const missing = scriptNamesExpected.filter(
            (name) => !scriptNames.includes(name)
        );

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
                console.log(
                    `    ERROR: devDependencies is missing "${name}": "${value}",`
                );
            } else if (value !== actual) {
                console.log(
                    `    WARNING: devDependencies: expected "${name}": "${value}",`
                );
            }
        });
    }
}

function checkPackage(packageSelf: PackageItems, packageTarget: PackageItems) {
    checkPrettierConfig(packageTarget.prettier);
    checkPackageJson(packageSelf.package, packageTarget.package);
}

function updatePackage(packageSelf: PackageItems, packageTarget: PackageItems) {
    // update all the tool versions, simply overwrites
    const packageJsonSelf = packageSelf.packageJson;
    const packageJsonTarget = packageTarget.packageJson;

    Object.getOwnPropertyNames(packageJsonSelf.devDependencies).forEach(
        (name) => {
            packageJsonTarget.devDependencies[name] =
                packageJsonSelf.devDependencies[name];
        }
    );

    packageTarget.writePackageJson(packageJsonTarget);
}

function runAction(parameters: string[]) {
    const [action, otherPackage] = parameters;

    const packagePathSelf = path.join(__dirname, "..");
    const packagePathTarget = otherPackage || packagePathSelf;

    const packageSelf = getPackageItemPaths(packagePathSelf);
    const packageTarget = getPackageItemPaths(packagePathTarget);

    switch (action) {
        case "check":
            checkPackage(packageSelf, packageTarget);
            break;
        case "update":
            updatePackage(packageSelf, packageTarget);
            break;
        default:
            console.log(`invalid action: ${action}`);
            break;
    }
}

const parameters = process.argv.slice(2);

runAction(parameters);

/*
Clean up things in the package that are only for reference

- make src/index blank
- delete sfc/f.ts
- clear documentation to only contain deploy.md
- clear README
*/
