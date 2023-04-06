export interface LoggingDataTimeRange {
  /** UNIX time value in milliseconds. */
  from: number;
  /** UNIX time value in milliseconds. */
  to: number;
}

export interface LoggingDataClient {
  destroy(): void;

  /**
   * Starts a query for logging data.
   *
   * @returns {function()} Returns a deregistration function for the listener.
   */
  query(query: LoggingDataQuery, listener: (result: LoggingDataMetric[]) => any): () => void;
  query(queries: LoggingDataQuery[], listener: (results: LoggingDataMetric[][]) => any): () => void;
  query(queryOptions: LoggingDataQueryOptions, listener: (r: any) => any): () => void;
  query(q: LoggingDataQuery | LoggingDataQuery[] | LoggingDataQueryOptions, listener: (r: any) => any): () => void;
}

export interface LoggingDataQuery {
  /**
   * String reference to the client from where the query originates
   * @ignore
   */
  _clientRef?: string;
  /**
   * Timestamp for when the query was dispatched by the client
   * @ignore
   */
  _timeStamp?: number;
  decimals?: number;
  extendedBoundary?: boolean;
  factor?: number;
  for?: string;
  /** For example 2019-01-01T00:00:00Z */
  from?: string;
  interval?: 'best fit' | 'hours' | 'days' | 'weeks';
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  postAggr?: string;
  postTransform?: string;
  /** When omitted, the pre-aggregator is determined automatically based on a couple of factors, but in most cases it defaults to "raw". */
  preAggr?: string;
  ref?: string;
  selector?: string;
  step?: number;
  tag?: { publicId?: string };
  /** For example 2019-01-01T23:59:59Z */
  to?: string;
  unit?: string;
  variable?: { publicId?: string };
}

export interface LoggingDataQueryOptions {
  queries: LoggingDataQuery[];
  /**
   * Specifies the format of the returned metrics.
   * - If `format` is `'metrics'`, the listener is called with LoggingDataMetric[] or LoggingDataMetric[][], depending on the listener.
   * - If `format` is `'csv'`, the listener is called with LoggingDataBlob.
   *
   * Defaults to `'metrics'`
   */
  format?: 'metrics' | 'csv';
}

export interface LoggingDataMetric {
  queryRef: LoggingDataQueryRef;
  time: number;
  value: LoggingDataValue;
}

export interface LoggingDataValue {
  getValue(): boolean | number | string | null;
  toString(): string;
}

/** The result of a single export request. */
export interface LoggingDataBlob {
  /** Indicates the queries that are included in the blob. */
  queryRefs: LoggingDataQueryRef[];
  /** Contents of the export response. */
  blob: Blob;
}

export interface LoggingDataClientListenerRef {
  clientRef: string;
  // Indicates whether the queries originated from a single query or an array of queries.
  multiple: boolean;
  // Clone of the original query options.
  queryOptions: Required<LoggingDataQueryOptions>;
  listener(result: LoggingDataMetric[]): any;
  listener(results: LoggingDataMetric[][]): any;
  listener(results: LoggingDataBlob): any;
}

export interface LoggingDataQueryRef {
  cancel();
}

export interface AgentDataVariable {
  address?: string;
  agent?: ResLink;
  device?: ResLink;
  extraData?: any;
  factor?: number | null;
  forAlarming?: boolean;
  forLogging?: boolean;
  internalUse?: boolean;
  maxStringLength?: number | null;
  name?: string;
  publicId: string;
  signed?: boolean | null;
  slug?: string | null;
  source?: ResLink;
  type?: AgentDataVariableType;
  unit?: string | null;
  updateable?: boolean;
  variableId?: number;
  width?: AgentDataVariableWidth | null;
}

export type AgentDataVariableType = 'bool' | 'int' | 'float' | 'str';

export type AgentDataVariableWidth = '8' | '16' | '32' | '64';

export interface AgentDataTag {
  agent?: ResLink;
  aggregators?: string[];
  device?: ResLink;
  downsamplingInterval?: boolean;
  /** When set to null will revert to "last", "shortest" and "longest". Only applicable to strings */
  edgeAggregator?: 'min' | 'max' | 'shortest' | 'longest' | 'mean' | 'last' | null;
  logEvent?: 'interval' | 'change' | 'trigger';
  loggingInterval?: string;
  logTrigger?: AgentDataCondition | null;
  name?: string;
  publicId: string;
  retentionPolicy?: string;
  slug?: string | null;
  source?: ResLink;
  onChangeExpiry?: string | null;
  tagId?: number;
  variable?: AgentDataVariable;
}

export interface AgentDataCondition {
  agent?: ResLink;
  description?: string | null;
  device?: ResLink;
  /** For example: "#2 8 >=" (when variable 2 is greater than or equal to 8) */
  formula?: string;
  name?: string;
  publicId: string;
  source?: ResLink;
}

export interface ResLink {
  publicId: string;
  reference?: {
    name: string;
  };
}
