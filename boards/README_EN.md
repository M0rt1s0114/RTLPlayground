# Board Definitions

Each `.yaml` file in this directory describes one supported board.

The YAML files are the **source of truth** for board definitions.  `make boards`
converts them into the upstream machine format under `machine/`
(`<machine_id>.c`, `<machine_id>.h` and, when a boot hook is needed,
`<machine_id>_init.c`).  The generated files are committed, so a normal build
does not need Python.

> 中文版见 [README.md](README.md)。

## Adding a new board

1. Copy the closest existing board:
   ```
   cp boards/KP_9000_6XHML_X2.yaml boards/MY_NEW_BOARD.yaml
   ```
2. Change `machine_id` (must equal the file name and be a C identifier),
   `machine_name` and the hardware fields.
3. Regenerate the machine files:
   ```
   make boards
   ```
4. Build: `make MACHINE=MY_NEW_BOARD`
5. Commit the YAML **and** the regenerated `machine/` files; CI runs
   `make board_check` to verify they match.

The generator needs `python3` and PyYAML (`pip install pyyaml`).

## Field reference

```yaml
machine_id:   MY_NEW_BOARD        # must match the file name, C identifier
machine_name: "Vendor Model V1.0" # MACHINE_MODEL, shown in UI/CLI; max 29 chars
machine_chipset: RTL8372          # RTL8372 / RTL8373 (default port range)

# 9-entry arrays: "physical" = ASIC port index (0-8),
# "logical" = front-panel port number (1-9)
log_to_phys_port: [0, 0, 0, 6, 1, 2, 3, 4, 5]
phys_to_log_port: [4, 5, 6, 7, 8, 3, 0, 0, 0]
is_sfp:           [0, 0, 0, 2, 0, 0, 0, 0, 1]   # 0=RJ45, 1/2=SFP cage index
port_led_set:     [0, 0, 0, 1, 0, 0, 0, 0, 1]   # led_sets row per physical port

n_sfp: 2      # number of SFP cages (0/1/2), must match sfp_ports length
n_10g: 0      # non-SFP 10G ports

sfp_ports:    # left to right; use the GPIO symbols from rtl837x_pins.h
- pin_detect:     GPIO30_ACL_BIT3_EN   # module present, active low
  pin_los:        GPIO37               # RX-LOS, GPIO_NA if not wired
  pin_tx_disable: GPIO_NA
  sds:            1                    # SerDes index 0/1
  i2c:
    sda: GPIO39_I2C_SDA4
    scl: GPIO40_I2C_SCL3_MDC1

reset_pin: GPIO54_ACL_BIT2_EN   # factory reset button, GPIO_NA if absent

high_leds:                      # pins 27-29 MUX/drive, '+' with 'LED_*' names
  mux:    "LED_27 | LED_29"
  enable: "LED_28_SYS | LED_29"

led_sets:                       # up to 4 rows x 4 conditions ('LEDS_*' OR-ed)
- - "LEDS_2G5 | LEDS_LINK | LEDS_ACT"
  - "LEDS_1G | LEDS_100M | LEDS_10M | LEDS_LINK"
  - "0"
  - "0"

led_mux_custom: 0               # 1 only for non-standard LED wiring
led_mux:                        # 28 bytes, used when led_mux_custom = 1
- '0x00'
- '0x01'

# Optional: flash offset of the factory MAC (upstream convention 0x1FC000)
# mac_flash_offset: 0x1FC000
# Optional: flash readable in single-IO mode only (no boot / garbled console /
# random resets otherwise)
# flash_sio: 1
# Optional: extra register setup; custom_init_prefix holds file-scope decls
# custom_init_prefix: |
#   static __code const struct { uint16_t reg; uint32_t val; } init_regs[] = { ... };
# custom_init: |
#   reg_bit_set(RTL837X_REG_LED_GLB_IO_EN, 6);
```

## Reuse / include (dts/dtsi style)

When a model shares the hardware of an existing board, do not copy the whole
file - declare an include:

```yaml
machine_id:   HYWS-SGT0204S          # own target name (dashes allowed)
machine_name: "HYVision SGT0204S"
include:      2G5F4_10G2_V1_01       # inherit the base board
```

- The parent is looked up as `<include>.yaml` in the same directory; chains are
  allowed and cycles are rejected.
- Keys set in the child override the parent (dicts merge recursively, lists are
  replaced); `machine_id` always comes from the child.
- Alias models that only differ by name are just a two-line include.
- Set `custom_init: ""` to drop the inherited boot hook.

`FNS1200P`, `DEFAULT_8C_1SFP`, `HYWS-SGT0204S` and the 15 upstream alias
targets (MokerLink 2G08110GSN, GoodTop, Hasivo S1100WP, Horaco, KP revisions,
SKS3200-8E1X, ...) are built this way.


## Rules

- `make boards` regenerates every `machine/` file that has a YAML counterpart.
- `make board_check` verifies `machine/` is in sync (used by CI).
- `machine/<NAME>.c` without a YAML file is an upstream native board
  definition; it stays upstream-maintained.  Boards with a YAML file are
  generated, so never edit their `machine/` files by hand.
- Deprecated fields: `isRTL8373` (use `machine_chipset`), `min_port`/`max_port`
  (derived from the chipset; only set when a board deviates).
