import { IxClientStatus } from './ixclient';
import { LoggingDataClient, LoggingDataTimeRange } from './logging-data-client';
import { ResourceDataClient } from './resource-data-client';
import { Tooltip, TooltipOptions } from './tooltip';

/**
 * A Context Factory is injected into each component. Through this factory, a Component Context can be constructed.
 */
export type ContextFactory = (options?: ComponentContextOptions) => ComponentContext;

/**
 * The Component Context provides access to the component's inputs, the page's time range, to the LoggingDataClient and ResourceDataClient and to other application data.
 */
export interface ComponentContext {
  /**
   * Application data.
   */
  appData: AppData;

  destroyed: boolean;
  mode: 'edit' | 'view';

  inputs: { [key: string]: any };
  inputMap: Map<string, any>;

  timeRange: LoggingDataTimeRange;
  timeRangeIsAdjustable: boolean;
  vpnClientStatus: IxClientStatus | null;

  ontimerangechange: ((newTimeRange: LoggingDataTimeRange) => any) | null;
  onvpnclientstatuschange: ((newStatus: IxClientStatus | null) => any) | null;

  /**
   * Creates a client to retrieve logging data.
   */
  createLoggingDataClient(): LoggingDataClient;

  createResourceDataClient(): ResourceDataClient;

  /**
   * Attaches a tooltip on the target element.
   *
   * @param target the target element
   * @param options configures the tooltip message and other (optional) properties
   * @returns returns the tooltip instance
   *
   * @experimental
   */
  createTooltip(target: HTMLElement, options: TooltipOptions): Tooltip;

  destroy(): void;

  getApiUrl(rel: string, params?: { [param: string]: string }): string;

  navigateByUrl(url: string): void;

  /**
   * Save a file.
   *
   * @param data the file data to save
   * @param fileName the name of the file
   */
  saveAsFile(data: string | Blob, fileName: string): void;

  setTimeRange(timeRange: LoggingDataTimeRange): void;

  showVpnStatusDetails(agentId: string): void;

  /**
   * Tests whether the currently logged in user has VPN access to the Agent with the given {@code agentId}.
   * @param agentId the Agent ID
   * @returns true if the user has access, false otherwise
   */
  testVpnAccess(agentId: string): boolean;

  toggleVpn(agentId: string): void;

  translate(key: string | Array<string>, interpolateParams?: Object): string | any;
}

export interface ComponentContextOptions {
  /**
   * Migrate the inputs from an earlier version to the current version of the component.
   *
   * @param inputs the inputs of this component for an earlier version of the component
   * @param version the version of the component for which the inputs were for, or null if the version is unknown
   * @returns the inputs for the current version of the component
   */
  migrateInputs?: (inputs: any, version: string | null) => any;
}

export interface AppData {
  accessToken: { publicId: string; secretId: string };
  apiAppId: string;
  apiVersion: string;
  company: { publicId: string };
  language: string;
  /**
   * The locale of the platform.
   */
  locale: string;
  timeZone: string;
}
