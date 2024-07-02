const { execSync } = require("child_process");

const envVars = {
    PROXY_BASE: process.env.PROXY_BASE,
    BACKEND: process.env.BACKEND,
};

console.log("envVars: ", envVars);

const buildCommand = `parcel build src/index.html --public-url / --dist-dir dist --no-source-maps`;

execSync(buildCommand, {
    stdio: "inherit",
    env: { ...process.env, ...envVars },
});

console.log("build success");
