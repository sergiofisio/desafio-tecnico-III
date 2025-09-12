const { writeFile, existsSync, mkdirSync } = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { dirname } = require('path');
const argv = yargs(hideBin(process.argv)).argv;

require('dotenv').config();

const environment = argv.environment;
const isProduction = environment === 'prod';

const targetPath = isProduction
  ? `./src/environments/environment.prod.ts`
  : `./src/environments/environment.ts`;

const envDirectory = dirname(targetPath);

const environmentFileContent = `
export const environment = {
   production: ${isProduction},
   apiUrl: "${process.env.API_URL}"
};
`;

if (!existsSync(envDirectory)) {
  mkdirSync(envDirectory, { recursive: true });
}

writeFile(targetPath, environmentFileContent, function (err) {
  if (err) {
    console.log(err);
  }
  console.log(`Wrote variables to ${targetPath}`);
});
