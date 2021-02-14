# Notes

## NPM Version Issues

`npm@7.5.4` does not allow script execution with unit style paths as in the package.json instead revert ot an older version of npm that allows this behavior `npm install -g npm@6.14.9`

The above shows the importance of versioning tools together.

## NPM Script Search Path

npm looks first in the node_modules directory for the tool. Then it looks in the global installs before falling back to the path. 

In order to require that only the tools specified as part of the package be run it's important to use the specific path `./node_modules/.bin` https://github.com/npm/cli/issues/2638

Benefits:

- A fixed tool version allows everyone to use the same version of the tool.
- Automation workflows only node needs to be installed (comes with npm) and only npm ci needs to be run before the `npm run <script>` commands ave available to use.
- Avoids cluttering the global namespace with tools.
- Ensures that the same tool version is run for everyone across environments.

## Windows cmd search path

Windows cmd does not need the extension on the tool to work. `cmd.exe` has a precedence list for executing items in the path without the extension's presence by looking for the command without the extension (i.e. hello will call hello.exe, hello.bat, hello.cmd, etc.. in that order as it searches the path).
