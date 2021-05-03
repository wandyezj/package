import path from "path";
import fs from "fs";

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