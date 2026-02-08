import { cleanData } from "./storage";

function parseArgs(argv: string[]): { dataDir: string } {
  const args = { dataDir: "data" };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--data-dir" && argv[index + 1]) {
      args.dataDir = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

async function main(): Promise<void> {
  const { dataDir } = parseArgs(process.argv.slice(2));
  await cleanData(dataDir);
  console.log(`Cleaned ${dataDir}`);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
