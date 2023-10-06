# Total of multiple devices App

This workspace contains the Total of multiple devices app for IXON Cloud. It can be used on a device page to sum up the total of variable that is also available in other devices of the same group. It is based on the [IXON Cloud Custom Component Development Kit](https://developer.ixon.cloud/docs/custom-components). Note that this app is built with [Svelte](https://svelte.dev/), [Typescript](https://www.typescriptlang.org/) and [SCSS](https://sass-lang.com/). It requires you to be familiar with the [Node.js](https://nodejs.org/) ecosystem.

## Testing locally

Install the dependencies...

```sh
npm install
```

...login to your IXON Cloud account...

```sh
npx cdk login
```

...and run the simulator:

```sh
npx cdk simulate state-analysis
```

...this opens the simulator app in a browser and builds the component in watch-mode, which means that any changes to the component source files will trigger a rebuild and will auto-reload the simulator.

## Documentation

To check out docs and examples on how to develop a custom component, visit [Custom Component Development Docs](https://developer.ixon.cloud/docs/custom-components).

The [@ixon-cdk/runner](https://www.npmjs.com/package/@ixon-cdk/runner) page has a complete overview of all commands that can be run in a component workspace project.
