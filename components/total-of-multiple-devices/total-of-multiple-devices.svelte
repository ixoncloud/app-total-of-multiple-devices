<script lang="ts">
  import { DateTime } from "luxon";
  import type {
    ComponentContext,
    ResourceDataClient,
    ResourceDataResult,
  } from "./types";
  import { onMount } from "svelte";
  import tinycolor, { type Instance, type MostReadableArgs } from "tinycolor2";
  import { mapValueToRule } from "./shared/utils";

  export let context: ComponentContext;
  let client: ResourceDataClient;
  let rootEl: HTMLDivElement;

  // Data
  let height: number | null = null;

  let cardColor: string | null = null;
  let textColor: Instance | null = null;

  let dataSourceSlug;
  let variableSlug;
  let agentGroups = [];
  let selectedGroupPublicId = null;
  let dataValue = null;
  let dataText = "";

  let error = null;

  $: displayValue = dataText || null;

  // Watchers
  $: _metric(dataValue);
  function _metric(value) {
    if (value !== null) {
      const ruleItem = mapValueToRule(value, context.inputs.rules);
      const rule = ruleItem ? ruleItem.rule : undefined;

      if (rule) {
        if (rule.colorUsage === "text") {
          textColor = rule.color;
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

  function toString(value, decimals, unit, locale) {
    const options: Intl.NumberFormatOptions = {
      style: "decimal",
      minimumFractionDigits: Math.floor(decimals),
      maximumFractionDigits: Math.floor(decimals),
    };
    const formatter = new Intl.NumberFormat(locale, options);
    return `${formatter.format(value)}${unit ? " " + unit : ""}`;
  }

  async function setDataValue() {
    const points = await getData();
    if (points.length === 0) {
      dataValue = null;
      dataText = "";
      return;
    }

    const dataCalculation = points.reduce(
      (acc, curr) => acc + curr.dataPoint,
      0
    );
    const decimals = context.inputs.dataSource.metric.decimals || 0;
    const unit = context.inputs.dataSource.metric.unit;
    const factor = context.inputs.dataSource.metric.factor || 1;
    dataValue = dataCalculation * factor;
    dataText = toString(dataValue, decimals, unit, context.appData.locale);
  }

  async function getGroups() {
    let moreAfter = null;
    let relevantGroups = [];

    do {
      const url =
        context.getApiUrl("GroupList") +
        "?fields=type.name" +
        (moreAfter ? `&page-after=${moreAfter}` : "");
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + context.appData.accessToken.secretId,
          "Api-Application": context.appData.apiAppId,
          "Api-Company": context.appData.company.publicId,
          "Api-Version": "2",
        },
        method: "GET",
      })
        .then((res) => res.json())
        .catch((error) => {
          console.error("Error:", error);
        });

      if (response) {
        const data = response.data;
        moreAfter = response.moreAfter;

        relevantGroups = [
          ...relevantGroups,
          ...data
            .filter((x) => {
              return x.publicId === selectedGroupPublicId;
            })
            .map((x) => x.publicId),
        ];
      }
    } while (moreAfter);
    return relevantGroups;
  }

  async function getAgents() {
    const relevantGroups = await getGroups();
    let relevantAgents = [];
    let moreAfter = null;

    do {
      // Queries the "active device" on this page to find its HTTP server
      const url =
        context.getApiUrl("AgentList") +
        "?fields=dataSources.publicId,dataSources.slug,memberships.group.publicId" +
        (moreAfter ? `&page-after=${moreAfter}` : "");
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + context.appData.accessToken.secretId,
          "Api-Application": context.appData.apiAppId,
          "Api-Company": context.appData.company.publicId,
          "Api-Version": "2",
        },
        method: "GET",
      })
        .then((res) => res.json())
        .catch((error) => {
          console.error("Error:", error);
        });

      if (response) {
        const data = response.data;
        moreAfter = response.moreAfter;

        relevantAgents = [
          ...relevantAgents,
          ...data
            .filter((agent) => {
              const mem = agent.memberships.find((x) =>
                relevantGroups.includes(x.group.publicId)
              );
              return mem ? true : false;
            })
            .filter((agent) => {
              const y = agent.dataSources.find(
                (x) => x.slug === dataSourceSlug
              );
              return y ? true : false;
            }),
        ];
      }
    } while (moreAfter);

    return relevantAgents;
  }

  async function getData(): Promise<{ agentId: number; dataPoint: number }[]> {
    const relevantAgents = await getAgents();

    let points = [];

    const relevantDataSources = relevantAgents.map((agent) => {
      return agent.dataSources.find((ds) => ds.slug === dataSourceSlug);
    });

    for (let index = 0; index < relevantDataSources.length; index++) {
      const bodyObj = {
        source: { publicId: relevantDataSources[index].publicId },
        start: DateTime.fromMillis(context.timeRange.from).toISO({
          suppressMilliseconds: true,
        }),
        end: DateTime.fromMillis(context.timeRange.to).toISO({
          suppressMilliseconds: true,
        }),
        tags: [
          {
            slug: variableSlug,
            preAggr: "raw",
            queries: [
              {
                ref: "aaa",
                limit: 1,
                postAggr: context.inputs.dataSource.metric.aggregator,
                postTransform: context.inputs.dataSource.metric.transform
                  ? "difference"
                  : undefined,
              },
            ],
          },
        ],
      };

      // Queries the "active device" on this page to find its HTTP server
      const url = context.getApiUrl("DataList");
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + context.appData.accessToken.secretId,
          "Api-Application": context.appData.apiAppId,
          "Api-Company": context.appData.company.publicId,
          "Api-Version": "2",
        },
        method: "POST",
        body: JSON.stringify(bodyObj),
      })
        .then((res) => res.json())
        .catch((error) => {
          console.error("Error:", error);
        });
      if (response.status === "error") {
        error = "ERROR: please check your tag configuration";
        return [];
      }
      if (response) {
        points = [
          ...points,
          {
            agentId: relevantAgents[index].publicId,
            dataPoint: response.data.points[0].values.aaa,
          },
        ];
      }
    }
    return points;
  }

  function queryData(client) {
    const { dataSource } = context.inputs;
    const closeQuery = client.query(
      [
        {
          selector: "Agent",
          fields: [
            "publicId",
            "dataSources.publicId",
            "dataSources.slug",
            "memberships.group.publicId",
          ],
        },
        {
          selector: "GroupList",
          fields: ["name", "publicId", "type.name", "type.publicId"],
        },
      ],
      (results: ResourceDataResult<any>[]) => {
        const agent = results[0].data;
        const groupData = results[1].data;
        const agentMembershipPublicIds = agent.memberships.map(
          (x) => x.group.publicId
        );
        agentGroups = groupData.filter((group) =>
          agentMembershipPublicIds.includes(group.publicId)
        );
        selectedGroupPublicId =
          agentGroups.find(
            (group) => group.type?.name === context.inputs.groupType
          )?.publicId || null;

        dataSourceSlug = dataSource.metric.selector.split(":")[1].split(".")[0];
        variableSlug = dataSource.metric.selector.split(":")[1].split(".")[2];

        setDataValue();

        closeQuery(); // Required to prevent weird looping behavior
      }
    );
  }

  // Events
  onMount(() => {
    client = context.createResourceDataClient();
    queryData(client);

    context.ontimerangechange = () => {
      queryData(client);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        height = entry.contentRect.height;
      }
    });
    resizeObserver.observe(rootEl);

    return () => {
      resizeObserver.unobserve(rootEl);
      client.destroy();
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
  {#if !selectedGroupPublicId}
    <p>invalid or non existing Group Type configured</p>
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
  @import "./shared/styles/card";

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
