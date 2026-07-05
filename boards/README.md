# Board Definitions

Each `.yaml` file in this directory describes one supported hardware board.
The build system reads the selected file and generates `machine.c` automatically —
you never edit `machine.c` by hand.

## Adding a new board

1. Copy the closest existing board as a starting point:
   ```
   cp boards/KP_9000_6XHML_X2.yaml boards/MY_NEW_BOARD.yaml
   ```
2. Edit `boards/MY_NEW_BOARD.yaml` — every field is documented below.
3. Build: `make MACHINE=MY_NEW_BOARD`

That's it. No C file to touch.

## Field reference

```yaml
# ── Identity ─────────────────────────────────────────────────────────────────
machine_id:   MY_NEW_BOARD        # Must match the filename (without .yaml)
machine_name: "Vendor Model Rev"  # Human-readable string shown in the Web UI
notes:        "Optional free-text notes about PCB variants, quirks, etc."

# ── Chip variant ─────────────────────────────────────────────────────────────
isRTL8373: 0   # 0 = RTL8372N  (4+2 layout, min_port=3)
               # 1 = RTL8373   (8+1 layout, min_port=0)

# ── Port layout ───────────────────────────────────────────────────────────────
min_port: 3    # First logical port index used (3 for 8372N, 0 for 8373)
max_port: 8    # Last logical port index (always 8)
n_sfp:    2    # Number of SFP cages (0, 1, or 2)
n_10g:    0    # Number of non-SFP 10G ports (for RJ45 10G boards)

# 9-element arrays mapping between logical and physical port numbers.
# Index = logical port (0-8), value = physical port (1-9).
log_to_phys_port: [0, 0, 0, 6, 1, 2, 3, 4, 5]
phys_to_log_port: [4, 5, 6, 7, 8, 3, 0, 0, 0]

# is_sfp[i]: 0 = RJ45, 1 = first SFP cage, 2 = second SFP cage
is_sfp: [0, 0, 0, 2, 0, 0, 0, 0, 1]

# ── SFP cages (one entry per cage, in left-to-right order) ───────────────────
sfp_ports:
  - comment:          "Left SFP cage"      # optional
    pin_detect:       GPIO30_ACL_BIT3_EN   # Module-absent / present GPIO
    pin_los:          GPIO37               # Receive Loss-of-Signal GPIO (GPIO_NA if not wired)
    pin_tx_disable:   GPIO_NA              # TX-Disable GPIO (GPIO_NA if not wired)
    sds:              1                    # SerDes index (0 or 1)
    i2c:
      sda:            GPIO39_I2C_SDA4      # I²C SDA GPIO for SFP EEPROM
      scl:            GPIO40_I2C_SCL3_MDC1 # I²C SCL GPIO for SFP EEPROM

# ── GPIO symbols (use the name, the generator resolves to a number) ───────────
# GPIO_NA = 0xFF (not connected)
# See rtl837x_pins.h for the full list:
#   GPIO0_LED0 … GPIO29_LED29
#   GPIO30_ACL_BIT3_EN, GPIO36_PWM_OUT, GPIO37, GPIO38
#   GPIO39_I2C_SDA4, GPIO40_I2C_SCL3_MDC1, GPIO41_I2C_SDA3_MDIO1
#   GPIO46_I2C_SCL0, GPIO47_I2C_SDA0, GPIO48_I2C_SCL1, GPIO49_I2C_SDA1
#   GPIO50_I2C_SCL2_UART1_TX, GPIO51_I2C_SDA2_UART1_RX
#   GPIO54_ACL_BIT2_EN

reset_pin: GPIO54_ACL_BIT2_EN   # Factory-reset button GPIO (GPIO_NA if absent)

# ── System LEDs (pins 27-29) ─────────────────────────────────────────────────
high_leds:
  mux:    "LED_27 | LED_29"         # Which pins to enable in the MUX
  enable: "LED_28_SYS | LED_29"     # Which pins to drive as LEDs
# Available symbols: LED_27, LED_28_SYS, LED_29
# Combine with ' | '

# ── Per-port LED set assignment ───────────────────────────────────────────────
# 9-element array.  Each value (0-3) selects which led_set row to use.
port_led_set: [0, 0, 0, 1, 0, 0, 0, 0, 1]

# ── LED set configuration ─────────────────────────────────────────────────────
# Up to 4 rows; each row has up to 4 LED condition masks.
# Use LEDS_* symbol names (combined with ' | '), or '0' for off.
#
# Available symbols:
#   LEDS_2G5, LEDS_TWO_PAIR_1G, LEDS_1G, LEDS_500M, LEDS_100M, LEDS_10M
#   LEDS_LINK, LEDS_LINK_FLASH, LEDS_ACT, LEDS_RX, LEDS_TX
#   LEDS_COL, LEDS_DUPLEX, LEDS_TRAINING, LEDS_MASTER
#   LEDS_10G, LEDS_TWO_PAIR_5G, LEDS_5G, LEDS_TWO_PAIR_2G5
led_sets:
  - - "LEDS_2G5 | LEDS_LINK | LEDS_ACT"   # LED0 condition for set 0
    - "LEDS_1G | LEDS_100M | LEDS_LINK"    # LED1 condition for set 0
    - "0"                                   # LED2 condition for set 0 (off)
    - "0"                                   # LED3 condition for set 0 (off)
  - - "LEDS_10G | LEDS_LINK | LEDS_ACT"   # LED0 condition for set 1
    - "0"
    - "0"
    - "0"

# ── Custom LED MUX (only needed on boards with non-standard LED wiring) ───────
led_mux_custom: 0   # Set to 1 to enable the led_mux array below
led_mux:            # 28 hex bytes; omit or leave empty if led_mux_custom=0
  - '0x00'
  - '0x01'
  # … 26 more entries …

# ── Custom init code (rare; most boards leave this empty) ─────────────────────
# Verbatim C statements placed inside machine_custom_init().
# Use a YAML literal block (|) to preserve newlines and indentation.
custom_init: |
  reg_bit_set(RTL837X_REG_LED_GLB_IO_EN, 6);
```

## GPIO quick reference

| Symbol | GPIO# | Common use |
|--------|-------|------------|
| `GPIO_NA` | 255 | Not connected |
| `GPIO30_ACL_BIT3_EN` | 30 | SFP module-absent |
| `GPIO37` | 37 | SFP RX-LOS |
| `GPIO38` | 38 | SFP module-absent (alt) |
| `GPIO39_I2C_SDA4` | 39 | I²C SDA bus 4 |
| `GPIO40_I2C_SCL3_MDC1` | 40 | I²C SCL bus 3 |
| `GPIO41_I2C_SDA3_MDIO1` | 41 | I²C SDA bus 3 |
| `GPIO48_I2C_SCL1` | 48 | I²C SCL bus 1 / reset |
| `GPIO50_I2C_SCL2_UART1_TX` | 50 | SFP detect (alt) |
| `GPIO51_I2C_SDA2_UART1_RX` | 51 | SFP RX-LOS (alt) |
| `GPIO54_ACL_BIT2_EN` | 54 | Reset button |
