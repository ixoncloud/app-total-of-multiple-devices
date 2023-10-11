<script lang="ts">
  import type { ComponentContext } from "@ixon-cdk/types";
  import { onMount } from "svelte";
  import tinycolor, { type Instance, type MostReadableArgs } from "tinycolor2";
  import { mapValueToRule } from "./utils/rules";

  import { DataService } from "./services/data.service";

  export let context: ComponentContext;
  let rootEl: HTMLDivElement;

  // Data
  let height: number | null = null;

  let cardColor: string | null = null;
  let textColor: Instance | null = null;

  let dataValue: number | null = null;
  let dataText = "";
  let error: string;

  $: displayValue = dataText || null;

  // Watchers
  $: _metric(dataValue);
  function _metric(value: number | null) {
    if (value) {
      const ruleItem = mapValueToRule(value, context.inputs.rules);
      const rule = ruleItem ? ruleItem.rule : undefined;

      if (rule) {
        if (rule.colorUsage === "text") {
          textColor = new tinycolor(rule.color);
          cardColor = null;
        } else {
          const color = tinycolor(rule.color);
          const wcag2: MostReadableArgs = { level: "AA", size: "small" };
          const readable = tinycolor.isReadable(color, "black", wcag2);
          textColor = readable
            ? null
            : tinycolor.mostReadable(
                color,
                ["white", "#f0f0f0", "#e0e0e0"],
                wcag2
              );
          cardColor = rule.color;
        }
      } else {
        textColor = null;
        cardColor = null;
      }
    }
  }

  // Computed properties
  $: hasHeader = header && (header.title || header.subtitle) && !isShallow;
  $: isShallow = height !== null ? height <= 60 : false;
  $: header = context ? context.inputs.header : undefined;
  $: scaledTextStyle = `fill: ${textColor || "inherit"}`;
  $: cardStyle = _cardStyle(cardColor);
  function _cardStyle(_cardColor: string | null) {
    if (_cardColor) {
      return `background-color: ${_cardColor}`;
    }
    return "";
  }

  $: cardContentTextStyle = _cardContentTextStyle(textColor);
  function _cardContentTextStyle(_textColor: Instance | null) {
    if (_textColor) {
      return `color: ${_textColor}`;
    }
    return "";
  }

  $: hasStaticSize = _hasStaticSize(context);
  function _hasStaticSize(context: ComponentContext) {
    if (context && context.inputs && context.inputs.style) {
      return context.inputs.style.fontSize !== "auto";
    }
    return false;
  }

  $: staticSizeStyle = _staticSizeStyle(hasStaticSize);
  function _staticSizeStyle(hasStaticSize: boolean) {
    if (hasStaticSize) {
      return `font-size: ${context.inputs.style.fontSize}px;`;
    }
    return null;
  }

  $: svgViewBox = _svgViewBox("" + displayValue);
  function _svgViewBox(text: string) {
    const textLength = text.length - (text.startsWith("-") ? 1 : 0);
    const fontSize = 14.0;
    const textWidth = textLength * fontSize * 0.6;
    const textHeight = fontSize;
    return `${-textWidth / 2} ${-textHeight / 2} ${textWidth} ${textHeight}`;
  }

  async function setValues(dataService: DataService) {
    const response = await dataService.getDataValueAndText();

    error = "";
    dataText = "";
    dataValue = null;
    if (response.error) {
      error = response.error;
    } else {
      dataValue = response.dataValue as number;
      dataText = response.dataText as string;
    }
  }

  // Events
  onMount(async () => {
    const dataService = new DataService(context);
    await dataService.init();
    await setValues(dataService);

    context.ontimerangechange = async () => {
      await setValues(dataService);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        height = entry.contentRect.height;
      }
    });
    resizeObserver.observe(rootEl);

    return () => {
      resizeObserver.unobserve(rootEl);
    };
  });
</script>

<div class="card" bind:this={rootEl} style={cardStyle}>
  {#if hasHeader}
    <div class="card-header">
      {#if header.title}
        <h3 class="card-title">{header.title}</h3>
      {/if}
      {#if header.subtitle}
        <h4 class="card-subtitle">{header.subtitle}</h4>
      {/if}
    </div>
  {/if}
  {#if error}
    <p>{error}</p>
  {/if}

  {#if displayValue !== null}
    <div
      class="card-content"
      class:has-header={hasHeader}
      style={cardContentTextStyle}
    >
      {#if hasStaticSize}
        <div class="static" style={staticSizeStyle}>
          <span>{displayValue}</span>
        </div>
      {:else}
        <div class="scaled">
          <svg viewBox={svgViewBox}>
            <text
              x="0"
              y="0"
              text-anchor="middle"
              dominant-baseline="middle"
              style={scaledTextStyle}>{displayValue}</text
            >
          </svg>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  @import "./styles/card";

  .card .card-content {
    height: 100%;

    &.has-header {
      height: calc(100% - 40px);
    }

    .static {
      height: 100%;
      display: flex;
      flex-direction: row;
      place-content: center;
      align-items: center;
      flex: 1;

      span {
        white-space: nowrap;
      }
    }

    .scaled {
      height: 100%;
      display: flex;
      justify-content: center;

      svg {
        width: 100%;

        text {
          font-size: 14px;
          fill: var(--body-color);
        }
      }
    }
  }
</style>
