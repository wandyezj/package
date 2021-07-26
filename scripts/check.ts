import path from "path";
import fs from "fs";
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
    ignoreError?: boolean,
): string {
    console.log(command);

    const options: { cwd?: string; encoding?: string; stdio?: any[] } = {};
    if (workingDirectory !== undefined) {
        options.cwd = workingDirectory;
    }

    if (ignoreError !== undefined && ignoreError) {
        options.stdio = ["ignore", "pipe", "ignore"];
    }

    options.encoding = "utf-8";

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

interface PackageItemPaths {
    /**
     * package.json
     */
    package: string;

    /**
     * config/prettier.json
     */
    prettier: string;

    /**
     * LICENSE
     */
    license: string;

    /**
     * CHANGELOG.md
     */
    changelog: string;
}

function getPackageItemPaths(packagePath: string): PackageItemPaths {
    return {
        package: path.join(packagePath, "package.json"),
        prettier: getConfigPath(packagePath, "prettier.json"),
        license: path.join(packagePath, "LICENSE"),
        changelog: path.join(packagePath, "CHANGELOG.md"),
    };
}

function getFileJson<T>(filePath: string): T | undefined {
    const present = fileExists(filePath);
    if (present) {
        const data = readJsonFile<T>(filePath);
        return data;
    }

    return undefined;
}


interface PrettierConfigJson {
    tabWidth: number;
    endOfLine: string;
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
            console.log(`   WARNING: key: [${name}] expected [${value}] does not match actual [${actual}]`);
        }
    });

}

interface PackageJson {
    scripts : {
        [key: string]: string;
    }
}

function checkPackageJson(packagePath: string) {
    console.log("check - package.json");

    const config = getFileJson<PackageJson>(packagePath);
    if (config === undefined) {
        console.log(`ERROR: missing config ${packagePath}}`);
        return;
    }

    const scriptNamesExpected = ["lint", "style", "compile", "test", "doc"];

    const scripts = config.scripts;
    if (scripts === undefined) {
        console.log(`   WARNING: scripts is missing`);
    } else {
        const scriptNames = Object.getOwnPropertyNames(scripts);
        const missing = scriptNamesExpected.filter((name) => ! scriptNames.includes(name));

        missing.forEach((name) => {
            console.log(`   WARNING: missing script: [${name}]`);
        });
    }
}

const packagePath = path.join(__dirname, "..");
const packageItems = getPackageItemPaths(packagePath);

checkPrettierConfig(packageItems.prettier);
checkPackageJson(packageItems.package);

/*
Clean up things in the package that are only for reference

- make src/index blank
- delete sfc/f.ts
- clear documentation to only contain deploy.md
- clear README
*/