import type {
  ComponentContext,
  ResourceDataClient,
  ResourceDataResult,
} from "@ixon-cdk/types";

import { toString } from "../utils/toString";

import { ApiService } from "./api.service";

import type { Agent, Group } from "../interfaces";

export class DataService {
  context: ComponentContext;
  dataSourceSlug: string = "";
  variableSlug: string = "";
  error: string | null = null;
  relevantAgents: any[] = [];
  apiService: ApiService;

  constructor(context: ComponentContext) {
    this.context = context;
    this.apiService = new ApiService(this.context);
  }

  async init() {
    const { dataSource } = this.context.inputs;
    const client: ResourceDataClient = this.context.createResourceDataClient();
    let selectedGroupPublicId: string = "";

    let closeQuery = () => {};
    const queryPromise: Promise<void> = new Promise((resolve, reject) => {
      closeQuery = client.query(
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
          try {
            const agent = results[0].data as Agent;
            const groupsData = results[1].data as Group[];

            const agentMembershipPublicIds = agent.memberships.map(
              (x) => x.group.publicId
            );
            const agentGroups = groupsData.filter((group) =>
              agentMembershipPublicIds.includes(group.publicId)
            );
            selectedGroupPublicId =
              agentGroups.find(
                (group) => group.type?.name === this.context.inputs.groupType
              )?.publicId || "";
            if (!selectedGroupPublicId) {
              this.error = "invalid or non existing Group Type configured";
              resolve();
            }

            this.dataSourceSlug = dataSource.metric.selector
              .split(":")[1]
              .split(".")[0];
            this.variableSlug = dataSource.metric.selector
              .split(":")[1]
              .split(".")[2];

            resolve(); // Resolve the promise once the query and subsequent processing are complete
          } catch (error) {
            reject(error); // Reject the promise if an error occurs
          }
        }
      );
    });

    await queryPromise; // Await the promise to ensure query completion before proceeding

    closeQuery(); // Required to prevent weird looping behavior

    this.relevantAgents = await this.apiService.getRelevantAgents(
      this.dataSourceSlug,
      selectedGroupPublicId
    );
  }

  async getDataValueAndText() {
    const points = await this.apiService.getData(
      this.relevantAgents,
      this.dataSourceSlug,
      this.variableSlug
    );

    if (this.error) {
      return { error: this.error };
    }

    let dataValue = null;
    let dataText = "";

    if (points === null) {
      return { error: "ERROR: please check your tag configuration" };
    }

    if (points.length === 0) {
      return {
        dataValue,
        dataText,
      };
    }

    const dataCalculation = points.reduce(
      (acc, curr) => acc + curr.dataPoint,
      0
    );
    const decimals = this.context.inputs.dataSource.metric.decimals || 0;
    const unit = this.context.inputs.dataSource.metric.unit;
    const factor = this.context.inputs.dataSource.metric.factor || 1;
    dataValue = dataCalculation * factor;
    dataText = toString(dataValue, decimals, unit, this.context.appData.locale);
    return {
      dataValue,
      dataText,
    };
  }
}
