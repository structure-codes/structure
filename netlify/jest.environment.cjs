// Jest 27's node environment runs tests in a fresh VM context that omits the
// Web globals (fetch / Request / Response / Headers / streams …) the Netlify
// functions depend on. Copy them in from the host Node realm, which is the
// same runtime the functions execute on in production.
const NodeEnvironmentModule = require("jest-environment-node");
const NodeEnvironment = NodeEnvironmentModule.default || NodeEnvironmentModule;

const WEB_GLOBALS = [
  "fetch",
  "Request",
  "Response",
  "Headers",
  "FormData",
  "Blob",
  "AbortController",
  "AbortSignal",
  "ReadableStream",
  "WritableStream",
  "TransformStream",
  "TextEncoder",
  "TextDecoder",
  "structuredClone",
];

class WebGlobalsEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    for (const name of WEB_GLOBALS) {
      if (this.global[name] === undefined && globalThis[name] !== undefined) {
        this.global[name] = globalThis[name];
      }
    }
  }
}

module.exports = WebGlobalsEnvironment;
