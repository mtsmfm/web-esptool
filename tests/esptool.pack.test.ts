import pack from "../src/esptool/utils/pack";

test("pack(00 01 02 03)", () => {
  const input: Buffer = Buffer.from([0x00, 0x01, 0x02, 0x03]);
  const output: Buffer = Buffer.from([0xc0, 0x00, 0x01, 0x02, 0x03, 0xc0]);
  const actual: Buffer = pack(input);

  expect(actual.toString("hex")).toBe(output.toString("hex"));
});

test("pack({C0} 01 02 03)", () => {
  const input: Buffer = Buffer.from([0xc0, 0x01, 0x02, 0x03]);
  const output: Buffer = Buffer.from([
    0xc0, 0xdb, 0xdc, 0x01, 0x02, 0x03, 0xc0,
  ]);
  const actual: Buffer = pack(input);

  expect(actual.toString("hex")).toBe(output.toString("hex"));
});

test("pack(00 {C0} 02 03)", () => {
  const input: Buffer = Buffer.from([0x00, 0xc0, 0x02, 0x03]);
  const output: Buffer = Buffer.from([
    0xc0, 0x00, 0xdb, 0xdc, 0x02, 0x03, 0xc0,
  ]);
  const actual: Buffer = pack(input);

  expect(actual.toString("hex")).toBe(output.toString("hex"));
});

test("pack(00 01 {C0} 03)", () => {
  const input: Buffer = Buffer.from([0x00, 0x01, 0xc0, 0x03]);
  const output: Buffer = Buffer.from([
    0xc0, 0x00, 0x01, 0xdb, 0xdc, 0x03, 0xc0,
  ]);
  const actual: Buffer = pack(input);

  expect(actual.toString("hex")).toBe(output.toString("hex"));
});

test("pack(00 01 02 {C0})", () => {
  const input: Buffer = Buffer.from([0x00, 0x01, 0x02, 0xc0]);
  const output: Buffer = Buffer.from([
    0xc0, 0x00, 0x01, 0x02, 0xdb, 0xdc, 0xc0,
  ]);
  const actual: Buffer = pack(input);

  expect(actual.toString("hex")).toBe(output.toString("hex"));
});

test("pack(00 {DB} 02 03)", () => {
  const input: Buffer = Buffer.from([0x00, 0xdb, 0x02, 0x03]);
  const output: Buffer = Buffer.from([
    0xc0, 0x00, 0xdb, 0xdd, 0x02, 0x03, 0xc0,
  ]);
  const actual: Buffer = pack(input);

  expect(actual.toString("hex")).toBe(output.toString("hex"));
});
