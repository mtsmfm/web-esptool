import ESPLoader from './ESPLoader';
import ESP32Stub from './stubs/ESP32Stub';

export default class ESP32ROM extends ESPLoader {

  static CHIP_DETECT_MAGIC_VALUE = 0x00f01d83;

  CHIP_NAME = 'ESP32';
  IS_STUB = false;

  // ESP32 uses a 4 byte status reply
  STATUS_BYTES_LENGTH = 4;

  EFUSE_RD_REG_BASE = 0x3ff5a000;

  DR_REG_SYSCON_BASE = 0x3ff66000;

  FLASH_SIZES = {
    '1MB': 0x00,
    '2MB': 0x10,
    '4MB': 0x20,
    '8MB': 0x30,
    '16MB': 0x40,
  };

  BOOTLOADER_FLASH_OFFSET = 0x1000;

  STUB_CLASS = ESP32StubLoader;
  STUB_CODE = ESP32Stub;

  async read_efuse(n) {
    return await this.read_reg(this.EFUSE_RD_REG_BASE + (4 * n));
  }

  async get_pkg_version() {
    const word3 = await this.read_efuse(3);
    return ((word3 >> 9) & 0x07) + (((word3 >> 2) & 0x1) << 3);
  }

  async get_chip_revision() {
    const word3 = await this.read_efuse(3);
    const word5 = await this.read_efuse(5);
    const apb_ctl_date = await this.read_reg(this.DR_REG_SYSCON_BASE + 0x7C);

    const rev_bit0 = (word3 >> 15) & 0x1
    const rev_bit1 = (word5 >> 20) & 0x1
    const rev_bit2 = (apb_ctl_date >> 31) & 0x1

    if (!rev_bit0) return 0;
    if (!rev_bit1) return 1;
    if (!rev_bit2) return 2;
    return 3;
  }

  async get_chip_description() {
    const pkg_version = await this.get_pkg_version();
    const chip_revision = await this.get_chip_revision();
    const rev3 = (chip_revision == 3);
    const single_core = (await this.read_efuse(3)) & (1 << 0); // CHIP_VER DIS_APP_CPU

    let chip_name = {
      0: single_core ? 'ESP32-S0WDQ6' : 'ESP32-D0WDQ6',
      1: single_core ? 'ESP32-S0WD' : 'ESP32-D0WD',
      2: 'ESP32-D2WD',
      4: 'ESP32-U4WDH',
      5: rev3 ? 'ESP32-PICO-V3' : 'ESP32-PICO-D4',
      6: 'ESP32-PICO-V3-02',
    }[pkg_version] || 'unknown ESP32';

    if (chip_name.startsWith('ESP32-D0WD') && rev3) {
      chip_name += '-V3';
    }

    return `${chip_name} (revision ${chip_revision})`;
  }

  async flash_spi_attach(hspi_arg) {
    const data = Buffer.alloc(8);
    data.writeUInt32LE(hspi_arg, 0);
    data.writeUInt32LE(0, 4);
    this.check(await this.command(this.ESP_SPI_ATTACH, data));
  }

}

class ESP32StubLoader extends ESP32ROM {

  FLASH_WRITE_SIZE = 0x4000;  // matches MAX_WRITE_BLOCK in stub_loader.c
  STATUS_BYTES_LENGTH = 2;  // same as ESP8266, different to ESP32 ROM
  IS_STUB = true;

  async flash_spi_attach(hspi_arg) {
    const data = Buffer.alloc(4);
    data.writeUInt32LE(hspi_arg, 0);
    this.check(await this.command(this.ESP_SPI_ATTACH, data));
  }

}
