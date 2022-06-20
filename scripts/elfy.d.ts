declare module "elfy" {
  const parse: (source: Buffer) => {
    body: {
      sections: { name: string; data: Buffer; addr: number }[];
    };
    entry: number;
  };
}
