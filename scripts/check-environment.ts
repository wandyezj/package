/*

Check Environment

Log

- environment variables

- tool versions
    - npm
    - node

*/

import { execSync } from "child_process";

function env(variable: string): string {
    const value = process.env[variable];
    return value === undefined ? "" : value;
}

interface Environment {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    GITHUB_REF?: string;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GITHUB_ACTOR?: string;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GITHUB_EVENT_NAME?: string;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GITHUB_HEAD_REF?: string;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GITHUB_WORKSPACE?: string;

    // eslint-disable-next-line @typescript-eslint/naming-convention
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
    console.log("");
    console.log(variables);
    console.log("");

    [`npm --version`, `node --version`].forEach((command) => {
        const data = execSync(command, {
            timeout: 5 * 1000,
            encoding: "utf-8",
            windowsHide: true,
            // ignore error stream because its annoying
            // stdin stdout stderr
            stdio: ["ignore", "pipe", "ignore"],
        });

        console.log(command);
        console.log(data.trim());
        console.log("");
    });
}

checkEnvironment();
