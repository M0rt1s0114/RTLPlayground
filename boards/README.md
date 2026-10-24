# 板卡定义（Board Definitions）

本目录下每个 `.yaml` 文件描述一块受支持的硬件板卡。

这些 YAML 是**板级定义的事实来源**：`make boards` 会把它们转换成上游格式的 C 文件并写进
`machine/`（`<machine_id>.c`、`<machine_id>.h`，有初始化钩子时再加
`<machine_id>_init.c`），生成文件随仓库提交，所以普通构建不需要 Python。

> English version: see [README_EN.md](README_EN.md)。

## 加一块新板

1. 复制最接近的现有板卡作为起点：
   ```
   cp boards/KP_9000_6XHML_X2.yaml boards/MY_NEW_BOARD.yaml
   ```
2. 改 `machine_id`（必须与文件名一致，且是 C 标识符）、`machine_name` 和下面的硬件字段。
3. 重新生成 machine/ 文件：
   ```
   make boards
   ```
4. 构建：`make MACHINE=MY_NEW_BOARD`
5. 提交 YAML **和**生成出来的 `machine/` 文件（CI 会用 `make board_check` 检查两边是否一致）。

生成器只依赖 `python3` + PyYAML（`pip install pyyaml`）。

## 字段参考

```yaml
machine_id:   MY_NEW_BOARD        # 必须等于文件名（不含 .yaml），C 标识符
machine_name: "Vendor Model V1.0" # 写进 MACHINE_MODEL，UI/CLI 显示名；最长 29 字符
machine_chipset: RTL8372          # RTL8372 / RTL8373（决定端口号默认范围）

# 端口布局：9 元素数组，“物理”= ASIC 端口索引（0-8），“逻辑”= 面板端口号（1-9）
log_to_phys_port: [0, 0, 0, 6, 1, 2, 3, 4, 5]
phys_to_log_port: [4, 5, 6, 7, 8, 3, 0, 0, 0]
is_sfp:           [0, 0, 0, 2, 0, 0, 0, 0, 1]   # 0=RJ45，1/2=第几个 SFP 笼
port_led_set:     [0, 0, 0, 1, 0, 0, 0, 0, 1]   # 每个物理端口用哪一行 led_sets

n_sfp: 2      # SFP 笼数量（0/1/2），必须等于 sfp_ports 的条数
n_10g: 0      # 非 SFP 的 10G 端口数量

sfp_ports:    # 从左到右；GPIO 用 rtl837x_pins.h 里的符号
- pin_detect:     GPIO30_ACL_BIT3_EN   # 模块在位，低有效
  pin_los:        GPIO37               # RX-LOS，未接就 GPIO_NA
  pin_tx_disable: GPIO_NA
  sds:            1                    # SerDes 索引 0/1
  i2c:
    sda: GPIO39_I2C_SDA4
    scl: GPIO40_I2C_SCL3_MDC1

reset_pin: GPIO54_ACL_BIT2_EN   # 恢复出厂按钮，无则 GPIO_NA

high_leds:                      # 引脚 27-29 的 MUX/驱动，用 'LED_27 | LED_29' 组合
  mux:    "LED_27 | LED_29"
  enable: "LED_28_SYS | LED_29"

led_sets:                       # 最多 4 行 × 每行 4 个条件，用 'LEDS_*' 符号按位或
- - "LEDS_2G5 | LEDS_LINK | LEDS_ACT"
  - "LEDS_1G | LEDS_100M | LEDS_10M | LEDS_LINK"
  - "0"
  - "0"

led_mux_custom: 0               # 只有 LED 走线非标准时才设 1
led_mux:                        # 28 个字节，led_mux_custom=1 时使用
- '0x00'
- '0x01'

# 可选：从 flash 读出厂 MAC 的偏移（上游约定 0x1FC000）
# mac_flash_offset: 0x1FC000
# 可选：flash 只能在单 IO 模式下读（表现为不启动/串口乱码/随机复位）
# flash_sio: 1
# 可选：芯片型号决定不了、需要额外写寄存器时；custom_init_prefix 放函数外的声明
# custom_init_prefix: |
#   static __code const struct { uint16_t reg; uint32_t val; } init_regs[] = { ... };
# custom_init: |
#   reg_bit_set(RTL837X_REG_LED_GLB_IO_EN, 6);
```

## 生成规则

- `make boards` —— 按 `boards/*.yaml` 全量重生成 `machine/` 下对应的文件。
- `make board_check` —— 校验 `machine/` 与 YAML 一致（CI 用）。
- 没有 YAML 的 `machine/<NAME>.c` 是上游原生的板级定义，保持原样、由上游维护；
  有 YAML 的板卡以上游参数对齐后由生成器接管，`machine/<NAME>.c` 不要手改。
- 已废弃字段：`isRTL8373`（改用 `machine_chipset`）、`min_port`/`max_port`
  （现在默认由 chipset 推导，只有偏离默认时才需要写）。
