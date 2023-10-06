import { DateTime } from "luxon";

import type { ComponentContext } from "@ixon-cdk/types";

import type { Agent, ApiResponse, Group } from "../interfaces";

type Point = { agentId: string; dataPoint: number };

export class ApiService {
  context: ComponentContext;
  headers: {};

  constructor(context: ComponentContext) {
    this.context = context;
    this.headers = this.createHeaders();
  }

  createHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: "Bearer " + this.context.appData.accessToken.secretId,
      "Api-Application": this.context.appData.apiAppId,
      "Api-Company": this.context.appData.company.publicId,
      "Api-Version": "2",
    };
  }

  async getRelevantAgents(
    dataSourceSlug: string,
    selectedGroupPublicId: string
  ) {
    const relevantGroups = await this.getRelevantGroupIds(
      selectedGroupPublicId
    );
    let relevantAgents: Agent[] = [];
    let moreAfter = null;

    do {
      // Queries the "active device" on this page to find its HTTP server
      const url =
        this.context.getApiUrl("AgentList") +
        "?fields=dataSources.publicId,dataSources.slug,memberships.group.publicId" +
        (moreAfter ? `&page-after=${moreAfter}` : "");
      const response: ApiResponse = await fetch(url, {
        headers: this.headers,
        method: "GET",
      })
        .then((res) => res.json())
        .catch((error) => {
          console.error("Error:", error);
        });

      if (response) {
        const data = response.data as Agent[];
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

  async getRelevantGroupIds(selectedGroupPublicId: string) {
    let moreAfter = null;
    let relevantGroupIds: string[] = [];

    do {
      const url =
        this.context.getApiUrl("GroupList") +
        "?fields=type.name" +
        (moreAfter ? `&page-after=${moreAfter}` : "");
      const response: ApiResponse = await fetch(url, {
        headers: this.headers,
        method: "GET",
      })
        .then((res) => res.json())
        .catch((error) => {
          console.error("Error:", error);
        });

      if (response) {
        const data = response.data as Group[];
        moreAfter = response.moreAfter;

        relevantGroupIds = [
          ...relevantGroupIds,
          ...data
            .filter((x) => {
              return x.publicId === selectedGroupPublicId;
            })
            .map((x) => x.publicId),
        ];
      }
    } while (moreAfter);
    return relevantGroupIds;
  }

  async getData(
    relevantAgents: Agent[],
    dataSourceSlug: string,
    variableSlug: string
  ): Promise<Point[] | null> {
    let points: Point[] = [];

    const relevantDataSources = relevantAgents
      .map((agent) => {
        return agent.dataSources.find(
          (ds: { slug: string }) => ds.slug === dataSourceSlug
        );
      })
      .filter((x) => x) as {
      slug: string;
      publicId: string;
    }[];

    for (let index = 0; index < relevantDataSources.length; index++) {
      const bodyObj = {
        source: { publicId: relevantDataSources[index].publicId },
        start: DateTime.fromMillis(this.context.timeRange.from).toISO({
          suppressMilliseconds: true,
        }),
        end: DateTime.fromMillis(this.context.timeRange.to).toISO({
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
                postAggr: this.context.inputs.dataSource.metric.aggregator,
                postTransform: this.context.inputs.dataSource.metric.transform
                  ? "difference"
                  : undefined,
              },
            ],
          },
        ],
      };

      // Queries the "active device" on this page to find its HTTP server
      const url = this.context.getApiUrl("DataList");
      const response = await fetch(url, {
        headers: this.headers,
        method: "POST",
        body: JSON.stringify(bodyObj),
      })
        .then((res) => res.json())
        .catch((error) => {
          console.error("Error:", error);
        });
      if (response.status === "error") {
        return null;
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
}
