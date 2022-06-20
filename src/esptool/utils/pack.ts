export default function pack(data: Buffer): Buffer {
  const out = Buffer.alloc(data.length * 2 + 2);
  out[0] = 0xc0;
  let oi = 1;
  for (let di = 0; di < data.length; di++) {
    if (data[di] == 0xc0) {
      out[oi] = 0xdb;
      out[oi + 1] = 0xdc;
      oi += 2;
    } else if (data[di] == 0xdb) {
      out[oi] = 0xdb;
      out[oi + 1] = 0xdd;
      oi += 2;
    } else {
      out[oi] = data[di];
      oi += 1;
    }
  }
  out[oi] = 0xc0;
  return out.slice(0, oi + 1);
}
