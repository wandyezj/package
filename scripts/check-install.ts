/*
Check versions of installed tools

- node
- npm

*/

import { execSync } from "child_process";

/**
 * a version
 */
interface Version {
    major: number;
    minor: number;
    revision: number;
}

/**
 * a required version
 */
interface VersionRequired {
    /**
     * required major version
     */
    majorRequired: number;

    /**
     * minor minimum version
     */
    minorMinimum: number;

    /**
     * revision minimum version
     */
    revisionMinimum: number;
}

interface RequiredVersionTool extends VersionRequired {
    /**
     * name of the tool
     */
    name: string;

    /**
     * @returns true if the version meets the required version
     */
    isRequired: (version: Version | undefined) => boolean;

    /**
     * @returns string describing the minimum version
     */
    versionMinimum: () => string;

    getVersion: () => Version | undefined;
}

/**
 * node version required
 */
const requiredVersionNode: RequiredVersionTool = {
    name: "node",

    majorRequired: 18,

    minorMinimum: 12,

    revisionMinimum: 0,

    isRequired: (version: Version | undefined) => {
        return isRequiredVersion(requiredVersionNode, version);
    },

    versionMinimum: () => {
        return versionMinimum(requiredVersionNode);
    },

    getVersion: () => {
        const versionCommand = "node --version";
        const versionRegex = /v(?<major>\d+)\.(?<minor>\d+)\.(?<revision>\d+)/gm;
        const version = getToolVersion(versionCommand, versionRegex);
        return version;
    },
};

/**
 * npm version required
 */
const requiredVersionNpm: RequiredVersionTool = {
    name: "npm",

    majorRequired: 8,

    minorMinimum: 19,

    revisionMinimum: 0,

    isRequired: (version: Version | undefined) => {
        return isRequiredVersion(requiredVersionNpm, version);
    },

    versionMinimum: () => {
        return versionMinimum(requiredVersionNpm);
    },

    getVersion: () => {
        const versionCommand = "npm --version";
        const versionRegex = /(?<major>\d+)\.(?<minor>\d+)\.(?<revision>\d+)/gm;
        const version = getToolVersion(versionCommand, versionRegex);
        return version;
    },
};

const allRequiredVersions: RequiredVersionTool[] = [requiredVersionNode, requiredVersionNpm];

function isRequiredVersion(required: VersionRequired, version: Version | undefined) {
    if (version === undefined) {
        return false;
    }

    const { majorRequired, minorMinimum, revisionMinimum } = required;
    const { major, minor, revision } = version;
    const passes = major === majorRequired && minor >= minorMinimum && revision >= revisionMinimum;
    return passes;
}

function versionMinimum(required: VersionRequired): string {
    const { majorRequired, minorMinimum, revisionMinimum } = required;
    const s = `v${majorRequired}.${minorMinimum}.${revisionMinimum} (requiredMajor.minimumMinor.minimumRevision)`;
    return s;
}

function getNumberFromGroup(
    groups: {
        [key: string]: string;
    },
    name: string
): number | undefined {
    const value = groups[name];
    if (value === undefined) {
        return undefined;
    }

    const n = parseInt(value, 10);
    if (isNaN(n) || parseFloat(value) !== n) {
        return undefined;
    }

    return n;
}

function getToolVersion(versionCommand: string, regex: RegExp): Version | undefined {
    const data = execSync(versionCommand, {
        timeout: 5 * 1000,
        encoding: "utf-8",
        windowsHide: true,
        // ignore error stream because its annoying
        // stdin stdout stderr
        stdio: ["ignore", "pipe", "ignore"],
    });

    const matches: RegExpExecArray | null = regex.exec(data);
    if (matches && matches.groups) {
        const groups = matches.groups;
        const major = getNumberFromGroup(groups, "major");
        const minor = getNumberFromGroup(groups, "minor");
        const revision = getNumberFromGroup(groups, "revision");

        if (major === undefined || minor === undefined || revision === undefined) {
            return undefined;
        }

        return {
            major,
            minor,
            revision,
        };
    }

    return undefined;
}

function checkTools(parameters: string[]) {
    if (parameters.length > 0) {
        console.log("no parameters allowed");
        return 1;
    }

    const allRequired = allRequiredVersions.map((tool) => {
        const version = tool.getVersion();
        const pass = tool.isRequired(version);

        let message: string | undefined = undefined;

        if (version === undefined) {
            message = "unable to get version";
        } else if (!pass) {
            const actual = `${version.major}.${version.minor}.${version.revision}`;
            message = `required version not present. Expected: ${requiredVersionNode.versionMinimum()} Found: ${actual}`;
        }

        const prefix = pass ? "✓" : "x";
        console.log(`${prefix} ${tool.name}`);
        if (message) {
            console.log(`\t${message}`);
        }

        return {
            pass,
        };
    });

    const allPass = allRequired.reduce((previousValue, currentValue) => {
        return previousValue && currentValue.pass;
    }, true);

    if (allPass) {
        return 0;
    } else {
        console.log("\nERROR: A required tool is missing.");
    }

    return 1;
}

const parameters = process.argv.slice(2);

const exitcode = checkTools(parameters);
process.exit(exitcode);
