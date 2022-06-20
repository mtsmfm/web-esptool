/// <reference path="./elfy.d.ts"/>
import { parse } from "elfy";
import { promisify } from "util";
import zlib from "zlib";
import { IStub } from "../src/esptool/ESPLoader";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import prettier from "prettier";

const deflate = promisify(zlib.deflate);

async function pack(buffer: Buffer) {
  return (await deflate(buffer, { level: 9 })).toString("base64");
}

const stubsDir = join(__dirname, "..", "src", "esptool", "stubs");

const elfFiles = readdirSync(stubsDir)
  .filter((f) => f.endsWith(".elf"))
  .map((f) => join(stubsDir, f));

(async () => {
  await Promise.all(
    elfFiles.map(async (elfFile) => {
      const source = readFileSync(elfFile);
      const elf = parse(source);

      const text = elf.body.sections.find(({ name }) => name == ".text")!;
      if (text.data.length % 4 != 0) {
        const code = text.data;
        text.data = Buffer.alloc(Math.ceil(code.length / 4) * 4, 0);
        code.copy(text.data);
      }

      const stub: IStub = {
        entry: elf.entry,
        text: await pack(text.data),
        text_start: text.addr,
      };

      const data = elf.body.sections.find(({ name }) => name == ".data");
      if (data) {
        stub.data = await pack(data.data);
        stub.data_start = data.addr;
      }

      writeFileSync(
        elfFile.replace(".elf", ".ts"),
        prettier.format(
          `
import { IStub } from '../ESPLoader';

export default
${JSON.stringify(stub, null, 2)} as IStub;
`,
          { parser: "typescript" }
        )
      );
    })
  );
})();
