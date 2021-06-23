import path from "path";
import fs from "fs";

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
}

function getEnvironmentVariables(): Environment {
    const names: (keyof Environment)[] = [
        "GITHUB_REF",
        "GITHUB_ACTOR",
        "GITHUB_EVENT_NAME",
        "GITHUB_HEAD_REF",
        "GITHUB_WORKSPACE",
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
}

checkEnvironment();


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

// Do By individual item

function checkPrettier(packagePath: string): void {
    console.log("check - prettier");

    const configName = "prettier.json";
    const configPath = getConfigPath(packagePath, "prettier.json");
    const configPresent = fileExists(configPath);


    if (configPresent) {
        const config = readJsonFile<any>(configPath);
        checkPrettierConfig(config);
    } else {
        console.log(`ERROR: missing config ${configName}`);
    }
}

function checkPrettierConfig(data: { [key: string]: string }): void {
    const expected = {
        tabWidth: 4,
        endOfLine: "lf",
    };
}

checkPrettier(path.join(__dirname, ".."));



/*
Clean up things in the package that are only for reference

- make src/index blank
- delete sfc/f.ts
- clear documentation to only contain deploy.md
- clear README
*/