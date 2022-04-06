<script lang="ts">
  import { DateTime } from "luxon";
  import type {
    ComponentContext,
    LoggingDataClient,
    ResourceDataClient,
    ResourceDataResult,
    LoggingDataMetric,
  } from "./shared/types";
  import { onMount } from "svelte";
  import tinycolor, { type Instance, type MostReadableArgs } from "tinycolor2";
  import {
    mapMetricInputToQuery,
    mapValueToRule,
    metricHasQueryRequirements,
  } from "./shared/utils";

  export let context: ComponentContext;
  let client: ResourceDataClient;
  let rootEl: HTMLDivElement;

  // Data
  let height: number | null = null;
  let metric: LoggingDataMetric | null = null;
  let text = "";
  let cardColor: string | null = null;
  let textColor: Instance | null = null;

  let agentPublicId;

  let dataSourceSlug;
  let variableSlug;
  let agentGroups = [];
  let selectedGroupType = null;
  let relevantGroups = [];
  let relevantAgents = [];
  let points = [];
  let dataValue = 0;

  $: displayValue = dataValue || null;

  // Watchers
  $: _metric(metric);
  function _metric(metric: LoggingDataMetric | null) {
    if (metric) {
      const value = metric.value.getValue();
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

  $: svgViewBox = _svgViewBox(text);
  function _svgViewBox(text: string) {
    const textLength = text.length - (text.startsWith("-") ? 1 : 0);
    const fontSize = 14.0;
    const textWidth = textLength * fontSize * 0.6;
    const textHeight = fontSize;
    return `${-textWidth / 2} ${-textHeight / 2} ${textWidth} ${textHeight}`;
  }

  async function setDataValue() {
    await getData();

    console.log("points", points);
    dataValue = points.reduce((acc, curr) => acc + curr.dataPoint, 0);

    console.log("currentAgent", agentPublicId);
    console.log("dataValue summed", dataValue);
  }

  async function getGroups() {
    // Queries the "active device" on this page to find its HTTP server
    const url = context.getApiUrl("GroupList") + "?fields=type.name";
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
      relevantGroups = data
        .filter((x) => {
          return x.type?.name === selectedGroupType.name;
        })
        .map((x) => x.publicId);
      console.log("relevantGroups", relevantGroups);
      // await fetch(response.data.url, { credentials: "include" });
      // this.baseUrl = response.data.url.slice("/?")[0];
    }
  }

  async function getAgents() {
    await getGroups();
    // Queries the "active device" on this page to find its HTTP server
    const url =
      context.getApiUrl("AgentList") +
      "?fields=dataSources.publicId,dataSources.slug,memberships.group.publicId";
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
      relevantAgents = data
        .filter((agent) => {
          const mem = agent.memberships.find((x) =>
            relevantGroups.includes(x.group.publicId)
          );
          return mem ? true : false;
        })
        .filter((agent) => {
          const y = agent.dataSources.find((x) => x.slug === dataSourceSlug);
          return y ? true : false;
        });
    }
  }

  async function getData() {
    await getAgents();
    console.log("context", context);

    console.log("relevantAgents", relevantAgents);
    // TODO
    const relevantDataSources = relevantAgents.map((agent) => {
      return agent.dataSources.find((ds) => ds.slug === dataSourceSlug);
    });
    console.log("relevantDataSources", relevantDataSources);
    console.log(
      "context.inputs.dataSource.metric.",
      context.inputs.dataSource.metric
    );
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

      if (response) {
        console.log("data RESPONSE", response);
        points = [
          ...points,
          {
            agentId: relevantAgents[index].publicId,
            dataPoint: response.data.points[0].values.aaa,
          },
        ];
        console.log("points", points);
      }
    }
  }

  // Events
  onMount(() => {
    // client = context.createLoggingDataClient();
    client = context.createResourceDataClient();
    const { dataSource } = context.inputs;

    client.query(
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
        // {
        //   selector: "CustomPropertyList",
        //   fields: ["name", "scopeType", "slug"],
        // },
      ],
      (results: ResourceDataResult<any>[]) => {
        const agent = results[0].data;
        agentPublicId = agent.publicId;
        const groupData = results[1].data;
        const agentMembershipPublicIds = agent.memberships.map(
          (x) => x.group.publicId
        );
        agentGroups = groupData.filter((group) =>
          agentMembershipPublicIds.includes(group.publicId)
        );
        selectedGroupType =
          agentGroups.find(
            (group) => group.type?.name === context.inputs.groupType
          )?.type || null;

        dataSourceSlug = dataSource.metric.selector.split(":")[1].split(".")[0];
        variableSlug = dataSource.metric.selector.split(":")[1].split(".")[2];

        setDataValue();
      }
    );
    if (
      dataSource &&
      dataSource.metric &&
      metricHasQueryRequirements(dataSource.metric)
    ) {
      // client.query(
      //   {
      //     ...mapMetricInputToQuery(dataSource.metric),
      //     limit: 1,
      //   },
      //   (metrics) => {
      //     text = metrics.length ? metrics[0].value.toString() : "";
      //     metric = metrics.length ? metrics[0] : null;
      //   }
      // );
    }

    context.ontimerangechange = () => {
      client = context.createResourceDataClient();
      const { dataSource } = context.inputs;

      client.query(
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
          // {
          //   selector: "CustomPropertyList",
          //   fields: ["name", "scopeType", "slug"],
          // },
        ],
        (results: ResourceDataResult<any>[]) => {
          const agent = results[0].data;
          agentPublicId = agent.publicId;
          const groupData = results[1].data;
          const agentMembershipPublicIds = agent.memberships.map(
            (x) => x.group.publicId
          );
          agentGroups = groupData.filter((group) =>
            agentMembershipPublicIds.includes(group.publicId)
          );
          selectedGroupType =
            agentGroups.find(
              (group) => group.type?.name === context.inputs.groupType
            )?.type || null;

          dataSourceSlug = dataSource.metric.selector
            .split(":")[1]
            .split(".")[0];
          variableSlug = dataSource.metric.selector.split(":")[1].split(".")[2];

          setDataValue();
        }
      );
      if (
        dataSource &&
        dataSource.metric &&
        metricHasQueryRequirements(dataSource.metric)
      ) {
        // client.query(
        //   {
        //     ...mapMetricInputToQuery(dataSource.metric),
        //     limit: 1,
        //   },
        //   (metrics) => {
        //     text = metrics.length ? metrics[0].value.toString() : "";
        //     metric = metrics.length ? metrics[0] : null;
        //   }
        // );
      }
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
  {#if selectedGroupType}
    <!-- <p>selected: {selectedGroupType.name}</p> -->
  {:else}
    <p>invalid or non existing Group Type configured</p>
  {/if}
  <p>display val: {displayValue}</p>

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
              style={scaledTextStyle}>{text}</text
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
