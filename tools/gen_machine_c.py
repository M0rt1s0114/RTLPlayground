#!/usr/bin/env python3
"""
gen_machine_c.py – Generate machine.c from a YAML board description.

Usage:
    python3 tools/gen_machine_c.py boards/<MACHINE_ID>.yaml [output_path]

If output_path is omitted, the result is written to machine.c in the
current working directory (i.e. the project root).
"""

import sys
import os
import re
import textwrap
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("Error: PyYAML is required.  Install with: pip install pyyaml")

# ── GPIO symbol table (rtl837x_pins.h values) ────────────────────────────────
GPIO_SYMBOLS = {
    "GPIO_NA": 0xFF,
    **{f"GPIO{i}_LED{i}": i for i in range(30)},
    "GPIO30_ACL_BIT3_EN": 30,
    "GPIO31_UART0_TX": 31, "GPIO32_UART0_RX": 32, "GPIO33_INT": 33,
    "GPIO34_MDC0": 34, "GPIO35_MDIO0": 35, "GPIO36_PWM_OUT": 36,
    "GPIO37": 37, "GPIO38": 38,
    "GPIO39_I2C_SDA4": 39, "GPIO40_I2C_SCL3_MDC1": 40,
    "GPIO41_I2C_SDA3_MDIO1": 41,
    "GPIO42_SPI": 42, "GPIO43_SPI": 43, "GPIO44_SPI": 44, "GPIO45_SPI": 45,
    "GPIO46_I2C_SCL0": 46, "GPIO47_I2C_SDA0": 47,
    "GPIO48_I2C_SCL1": 48, "GPIO49_I2C_SDA1": 49,
    "GPIO50_I2C_SCL2_UART1_TX": 50, "GPIO51_I2C_SDA2_UART1_RX": 51,
    "GPIO52_ACL_BIT0_EN": 52, "GPIO53_ACL_BIT1_EN": 53,
    "GPIO54_ACL_BIT2_EN": 54,
    "GPIO55_PTP_CLK_IN": 55, "GPIO56_PTP_CLK_OUT": 56,
    "GPIO57_PTP_TOD_OUT": 57, "GPIO58_PTP_PPS_OUT": 58,
    "GPIO59_PTP_TOD_IN": 59, "GPIO60_PTP_PPS_IN": 60,
    "GPIO61_SYNCELOCK0": 61, "GPIO62_SYNCELOCK1": 62,
}

# ── LED bit constants (rtl837x_leds.h) ───────────────────────────────────────
LED_SYMBOLS = {
    "LEDS_2G5":         0x00001,
    "LEDS_TWO_PAIR_1G": 0x00002,
    "LEDS_1G":          0x00004,
    "LEDS_500M":        0x00008,
    "LEDS_100M":        0x00010,
    "LEDS_10M":         0x00020,
    "LEDS_LINK":        0x00040,
    "LEDS_LINK_FLASH":  0x00080,
    "LEDS_ACT":         0x00100,
    "LEDS_RX":          0x00200,
    "LEDS_TX":          0x00400,
    "LEDS_COL":         0x00800,
    "LEDS_DUPLEX":      0x01000,
    "LEDS_TRAINING":    0x02000,
    "LEDS_MASTER":      0x04000,
    "LEDS_10G":         0x10000,
    "LEDS_TWO_PAIR_5G": 0x20000,
    "LEDS_5G":          0x40000,
    "LEDS_TWO_PAIR_2G5":0x80000,
}

# high_leds bit constants (machine.h)
HIGH_LED_SYMBOLS = {"LED_27": 1, "LED_28_SYS": 2, "LED_29": 4}

ALL_SYMBOLS = {**GPIO_SYMBOLS, **LED_SYMBOLS, **HIGH_LED_SYMBOLS}


def resolve(expr, table=None):
    """
    Evaluate a scalar that is either:
      - an integer / hex string  →  return int
      - a symbolic name          →  look up in table (defaults to ALL_SYMBOLS)
      - a '|'-joined expression  →  bitwise-OR of resolved parts
    """
    if table is None:
        table = ALL_SYMBOLS
    if isinstance(expr, int):
        return expr
    expr = str(expr).strip()
    if expr.startswith("0x") or expr.startswith("0X"):
        return int(expr, 16)
    if re.fullmatch(r"\d+", expr):
        return int(expr)
    # May be a '|' expression like "LED_27 | LED_29"
    parts = [p.strip() for p in expr.split("|")]
    result = 0
    for p in parts:
        if p in table:
            result |= table[p]
        elif re.fullmatch(r"\d+", p):
            result |= int(p)
        elif p.startswith("0x"):
            result |= int(p, 16)
        else:
            raise ValueError(f"Unknown symbol: '{p}' in expression '{expr}'")
    return result


def fmt_array(values, width=None):
    """Format a list of ints as a C array initialiser, e.g. {1, 2, 3}"""
    inner = ", ".join(str(v) for v in values)
    return "{" + inner + "}"


def fmt_led_set(rows):
    """Format a 4×4 led_sets initialiser."""
    lines = []
    for row in rows:
        # Each row is a list of up to 4 led expressions
        vals = [resolve(v, LED_SYMBOLS) for v in row]
        while len(vals) < 4:
            vals.append(0)
        lines.append("\t\t{ " + ", ".join(f"0x{v:05x}" for v in vals) + " }")
    # Pad to 4 rows
    while len(lines) < 4:
        lines.append("\t\t{ 0x00000, 0x00000, 0x00000, 0x00000 }")
    return "{\n" + ",\n".join(lines) + "\n\t}"


def generate(board: dict) -> str:
    """Return the full machine.c text for one board."""
    mid   = board["machine_id"]
    name  = board["machine_name"]
    is373 = int(board.get("isRTL8373", 0))
    minp  = int(board["min_port"])
    maxp  = int(board["max_port"])
    nsfp  = int(board.get("n_sfp", 0))
    n10g  = int(board.get("n_10g", 0))

    l2p = [resolve(v) for v in board.get("log_to_phys_port", [0]*9)]
    p2l = [resolve(v) for v in board.get("phys_to_log_port", [0]*9)]
    is_sfp = [resolve(v) for v in board.get("is_sfp", [0]*9)]

    reset_pin = resolve(board.get("reset_pin", "GPIO_NA"), GPIO_SYMBOLS)

    # high_leds
    hl = board.get("high_leds", {})
    hl_mux    = resolve(hl.get("mux", 0),    HIGH_LED_SYMBOLS)
    hl_enable = resolve(hl.get("enable", 0), HIGH_LED_SYMBOLS)

    # port_led_set
    pls = [resolve(v) for v in board.get("port_led_set", [0]*9)]

    # led_sets: list of rows, each row is list of up to 4 values
    led_sets_raw = board.get("led_sets", [[0,0,0,0]])
    led_sets_str = fmt_led_set(led_sets_raw)

    # led_mux
    led_mux_custom = int(board.get("led_mux_custom", 0))
    led_mux_raw    = board.get("led_mux", [])
    if led_mux_raw:
        led_mux_vals = [resolve(v) for v in led_mux_raw]
        while len(led_mux_vals) < 28:
            led_mux_vals.append(0)
        led_mux_str = fmt_array(led_mux_vals[:28])
    else:
        led_mux_str = "{0}"

    # SFP ports
    sfp_blocks = []
    for idx, sfp in enumerate(board.get("sfp_ports", [])):
        pd  = resolve(sfp.get("pin_detect",     "GPIO_NA"), GPIO_SYMBOLS)
        los = resolve(sfp.get("pin_los",        "GPIO_NA"), GPIO_SYMBOLS)
        txd = resolve(sfp.get("pin_tx_disable", "GPIO_NA"), GPIO_SYMBOLS)
        sds = int(sfp.get("sds", 0))
        sda = resolve(sfp["i2c"]["sda"], GPIO_SYMBOLS)
        scl = resolve(sfp["i2c"]["scl"], GPIO_SYMBOLS)
        sfp_blocks.append(
            f"\t.sfp_port[{idx}].pin_detect    = {pd},\n"
            f"\t.sfp_port[{idx}].pin_los       = {los},\n"
            f"\t.sfp_port[{idx}].pin_tx_disable= {txd},\n"
            f"\t.sfp_port[{idx}].sds           = {sds},\n"
            f"\t.sfp_port[{idx}].i2c           = {{ .sda = {sda}, .scl = {scl} }},"
        )

    custom_init_body = board.get("custom_init", "").strip()
    if not custom_init_body:
        custom_init_body = "/* nothing */"

    lines = [
        f"/* AUTO-GENERATED by tools/gen_machine_c.py from boards/{mid}.yaml",
        f" * DO NOT EDIT BY HAND – edit the .yaml file instead.",
        f" */",
        f"#include \"machine.h\"",
        f"#include \"rtl837x_pins.h\"",
        f"#include \"rtl837x_leds.h\"",
        f"#include \"rtl837x_sfr.h\"",
        f"#include \"rtl837x_regs.h\"",
        f"#include \"rtl837x_common.h\"",
        f"",
        f"__code const struct machine machine = {{",
        f'\t.machine_name    = "{name}",',
        f"\t.isRTL8373       = {is373},",
        f"\t.min_port        = {minp},",
        f"\t.max_port        = {maxp},",
        f"\t.n_sfp           = {nsfp},",
        f"\t.n_10g           = {n10g},",
        f"\t.log_to_phys_port= {fmt_array(l2p)},",
        f"\t.phys_to_log_port= {fmt_array(p2l)},",
        f"\t.is_sfp          = {fmt_array(is_sfp)},",
    ]

    for block in sfp_blocks:
        lines.append(block)

    lines += [
        f"\t.reset_pin       = {reset_pin},",
        f"\t.high_leds       = {{ .mux = {hl_mux}, .enable = {hl_enable} }},",
        f"\t.port_led_set    = {fmt_array(pls)},",
        f"\t.led_sets        = {led_sets_str},",
        f"\t.led_mux_custom  = {led_mux_custom},",
        f"\t.led_mux         = {led_mux_str},",
        f"}};",
        f"",
        f"void machine_custom_init(void)",
        f"{{",
        f"\t{custom_init_body}",
        f"}}",
        f"",
    ]

    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        sys.exit(f"Usage: {sys.argv[0]} boards/<MACHINE_ID>.yaml [output_path]")

    yaml_path = Path(sys.argv[1])
    if not yaml_path.exists():
        sys.exit(f"Error: file not found: {yaml_path}")

    with open(yaml_path) as f:
        board = yaml.safe_load(f)

    output_path = Path(sys.argv[2]) if len(sys.argv) >= 3 else Path("machine.c")

    c_text = generate(board)
    with open(output_path, "w") as f:
        f.write(c_text)

    print(f"Generated {output_path}  ({len(c_text)} bytes)")


if __name__ == "__main__":
    main()
