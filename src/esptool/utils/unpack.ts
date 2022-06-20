export default function unpack(
  queue: Buffer,
  data: Buffer
): { queue: Buffer; packets: Buffer[] } {
  queue = Buffer.concat([queue, data]);
  const packets = [];
  let pi = 0,
    qi = 0;
  let packet = null;
  while (qi < queue.length) {
    if (queue[qi] == 0xc0) {
      if (packet == null) {
        // start
        packet = Buffer.alloc(queue.length);
      } else {
        // end
        packets.push(packet.slice(0, pi));
        packet = null;
        pi = 0;
      }
      qi += 1;
    } else if (
      qi < queue.length - 1 &&
      queue[qi] == 0xdb &&
      queue[qi + 1] == 0xdc
    ) {
      if (packet != null) {
        packet[pi] = 0xc0;
        pi += 1;
      }
      qi += 2;
    } else if (
      qi < queue.length - 1 &&
      queue[qi] == 0xdb &&
      queue[qi + 1] == 0xdd
    ) {
      if (packet != null) {
        packet[pi] = 0xdb;
        pi += 1;
      }
      qi += 2;
    } else {
      if (packet != null) {
        packet[pi] = queue[qi];
        pi += 1;
      }
      qi += 1;
    }
  }
  if (packet != null) {
    packet = Buffer.concat([Buffer.from([0xc0]), packet.slice(0, pi)]);
  } else {
    packet = Buffer.alloc(0);
  }
  return { queue: packet, packets };
}
