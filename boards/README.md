# 板卡定义（Board Definitions）

本目录下每个 `.yaml` 文件描述一块受支持的硬件板卡。
构建系统会读取所选文件并自动生成 `machine.c`——**永远不要手工编辑 `machine.c`**。

> English version: see [README_EN.md](README_EN.md)。

## 添加新板卡

1. 复制一块最接近的现有板卡作为起点：
   ```
   cp boards/KP_9000_6XHML_X2.yaml boards/MY_NEW_BOARD.yaml
   ```
2. 编辑 `boards/MY_NEW_BOARD.yaml`——所有字段的说明见下文。
3. 刷机前先校验全部板卡文件（能提前发现格式/长度错误）：
   ```
   make machine_check MACHINE=machine_check_placeholder
   ```
4. 构建：`make MACHINE=MY_NEW_BOARD`

就这些，不需要改任何 C 文件。

## 字段参考

```yaml
# ── 身份标识 ─────────────────────────────────────────────────────────────────
machine_id:   MY_NEW_BOARD        # 应与文件名一致（不含 .yaml 后缀）。
                                  # 注意：生成器目前还没有校验这一点。
machine_name: "Vendor Model Rev"  # 显示在 Web 界面中的、人类可读的字符串
notes:        "可选：PCB 版本、怪癖等自由文本备注。"
              # 生成器会忽略该字段。

# ── 芯片型号 ─────────────────────────────────────────────────────────────────
isRTL8373: 0   # 0 = RTL8372 / RTL8372N（N 版由固件在运行时检测）
               # 1 = RTL8373
               # 不要从芯片型号推断端口布局：端口布局由下方的
               # n_sfp / n_10g 以及两个映射数组定义。

# ── 端口布局 ─────────────────────────────────────────────────────────────────
# “物理” = 寄存器中使用的 ASIC 端口索引（0-8，0 表示端口 1）。
# “逻辑” = 面板上印刷的端口号（1-9）。
min_port: 3    # 使用的最低物理（ASIC）端口索引
               # （当前 RTL8372 板卡为 3，当前 RTL8373 板卡为 0）
max_port: 8    # 使用的最高物理（ASIC）端口索引（当前所有板卡都是 8）
n_sfp:    2    # SFP 笼数量（0、1 或 2）
n_10g:    0    # 非 SFP 的 10G 端口数量（用于 10G RJ45 板卡）

# 9 元素数组，在物理（ASIC）端口号和逻辑（面板）端口号之间做映射。
# 未使用的条目填 0。
#
# log_to_phys_port[i]：i = 物理端口索引
#                      值 = 逻辑端口号（面板丝印）
log_to_phys_port: [0, 0, 0, 6, 1, 2, 3, 4, 5]
#
# phys_to_log_port[i]：i = 逻辑端口号 - 1（0 对应面板端口 1）
#                      值 = 物理端口索引
phys_to_log_port: [4, 5, 6, 7, 8, 3, 0, 0, 0]

# is_sfp[i]：i = 物理端口索引。
#            0 = RJ45，1 = 第一个 SFP 笼，2 = 第二个 SFP 笼
is_sfp: [0, 0, 0, 2, 0, 0, 0, 0, 1]

# ── SFP 笼（每个笼一条，按从左到右的顺序） ───────────────────────────────────
sfp_ports:
  - comment:          "左 SFP 笼"          # 可选，生成器会忽略
    pin_detect:       GPIO30_ACL_BIT3_EN   # 模块在位检测 GPIO，低电平有效
                                           # （读到 0 表示模块已插入）
    pin_los:          GPIO37               # 接收 LOS（信号丢失）GPIO（未接线填 GPIO_NA）
    pin_tx_disable:   GPIO_NA              # TX 禁用 GPIO（未接线填 GPIO_NA）
    sds:              1                    # SerDes 索引（0 或 1）
    i2c:
      sda:            GPIO39_I2C_SDA4      # SFP EEPROM 的 I²C SDA GPIO
      scl:            GPIO40_I2C_SCL3_MDC1 # SFP EEPROM 的 I²C SCL GPIO

# ── GPIO 符号（使用名称，生成器会解析成数字） ─────────────────────────────────
# GPIO_NA = 0xFF（未连接）
# 完整列表见 rtl837x_pins.h；下面只列出当前板卡用到的符号：
#   GPIO0_LED0 … GPIO27_LED27
#   GPIO28_SYS_LED、GPIO29_GLB_RLDP_LED_EN
#   GPIO30_ACL_BIT3_EN、GPIO36_PWM_OUT、GPIO37、GPIO38
#   GPIO39_I2C_SDA4、GPIO40_I2C_SCL3_MDC1、GPIO41_I2C_SDA3_MDIO1
#   GPIO46_I2C_SCL0、GPIO47_I2C_SDA0、GPIO48_I2C_SCL1、GPIO49_I2C_SDA1
#   GPIO50_I2C_SCL2_UART1_TX、GPIO51_I2C_SDA2_UART1_RX
#   GPIO54_ACL_BIT2_EN

reset_pin: GPIO54_ACL_BIT2_EN   # 恢复出厂按钮 GPIO（没有则填 GPIO_NA）

# ── 系统 LED（引脚 27-29） ───────────────────────────────────────────────────
high_leds:
  mux:    "LED_27 | LED_29"         # 在 MUX 中启用哪些引脚
  enable: "LED_28_SYS | LED_29"     # 把哪些引脚作为 LED 驱动
# 可用符号：LED_27、LED_28_SYS、LED_29
# 用 ' | ' 组合

# ── 每个端口的 LED 组分配 ─────────────────────────────────────────────────────
# 9 元素数组，按物理端口索引。
# 每个值（0-3）选择使用哪一行 led_set。
port_led_set: [0, 0, 0, 1, 0, 0, 0, 0, 1]

# ── LED 组配置 ───────────────────────────────────────────────────────────────
# 最多 4 行；每行最多 4 个 LED 条件掩码。
# 使用 LEDS_* 符号名（可用 ' | ' 组合），或用 '0' 表示关闭。
#
# 可用符号：
#   LEDS_2G5、LEDS_TWO_PAIR_1G、LEDS_1G、LEDS_500M、LEDS_100M、LEDS_10M
#   LEDS_LINK、LEDS_LINK_FLASH、LEDS_ACT、LEDS_RX、LEDS_TX
#   LEDS_COL、LEDS_DUPLEX、LEDS_TRAINING、LEDS_MASTER
#   LEDS_10G、LEDS_TWO_PAIR_5G、LEDS_5G、LEDS_TWO_PAIR_2G5
led_sets:
  - - "LEDS_2G5 | LEDS_LINK | LEDS_ACT"   # 第 0 组的 LED0 条件
    - "LEDS_1G | LEDS_100M | LEDS_LINK"    # 第 0 组的 LED1 条件
    - "0"                                   # 第 0 组的 LED2 条件（关闭）
    - "0"                                   # 第 0 组的 LED3 条件（关闭）
  - - "LEDS_10G | LEDS_LINK | LEDS_ACT"   # 第 1 组的 LED0 条件
    - "0"
    - "0"
    - "0"

# ── 自定义 LED MUX（只有 LED 走线非标准的板卡才需要） ─────────────────────────
led_mux_custom: 0   # 设为 1 才会启用下面的 led_mux 数组
led_mux:            # 28 个十六进制字节；led_mux_custom=0 时可省略或留空
  - '0x00'
  - '0x01'
  # … 其余 26 项 …

# ── 自定义初始化代码（少见；多数板卡留空即可） ───────────────────────────────
# 原样放入 machine_custom_init() 中的 C 语句。
# 用 YAML 字面块（|）保留换行和缩进。
custom_init: |
  reg_bit_set(RTL837X_REG_LED_GLB_IO_EN, 6);
```

## 字段约束

以下规则一部分由 `make machine_check` 强制执行，其余是生成器当前依赖的约定：

- 四个端口数组（`log_to_phys_port`、`phys_to_log_port`、`is_sfp`、
  `port_led_set`）必须恰好有 9 个元素。
- `sfp_ports` 的条目数必须等于 `n_sfp`（0、1 或 2）；每条都必须提供
  `i2c.sda` 和 `i2c.scl`。
- `led_sets` 最多 4 行、每行最多 4 个掩码；缺省的行/列由生成器补 0。
- `led_mux` 最多 28 项；更长的列表会被生成器截断。
- `custom_init` 会被原样贴进 `machine_custom_init()`，不做任何校验——
  请保持精简并在真机上测试。
- `machine.c` 是构建产物：请编辑 YAML，永远不要编辑 `machine.c`。

## GPIO 速查表

> “常见用途”因板卡而异；应以各板卡的 YAML 为准。

| 符号 | GPIO# | 当前板卡上的常见用途 |
|------|-------|----------------------|
| `GPIO_NA` | 255 | 未连接 |
| `GPIO30_ACL_BIT3_EN` | 30 | SFP 在位检测（低电平有效） |
| `GPIO37` | 37 | SFP RX-LOS |
| `GPIO38` | 38 | SFP 在位检测（备用） |
| `GPIO39_I2C_SDA4` | 39 | I²C SDA 总线 4 |
| `GPIO40_I2C_SCL3_MDC1` | 40 | I²C SCL 总线 3 |
| `GPIO41_I2C_SDA3_MDIO1` | 41 | I²C SDA 总线 3 |
| `GPIO48_I2C_SCL1` | 48 | I²C SCL 总线 1 / 复位 |
| `GPIO50_I2C_SCL2_UART1_TX` | 50 | 多块板卡复用于 SFP detect / LOS / TX-disable |
| `GPIO51_I2C_SDA2_UART1_RX` | 51 | 多块板卡复用于 SFP detect / LOS / TX-disable |
| `GPIO54_ACL_BIT2_EN` | 54 | 复位按钮 |
