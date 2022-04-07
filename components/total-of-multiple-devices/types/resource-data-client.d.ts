
export interface ResourceDataClient {

  destroy(): void;

  /**
   * @returns {function()} Returns a deregistration function for the listener.
   */
  query<T>(
    query: ResourceDataQuery | ResourceDataQuery[],
    listener: (results: ResourceDataResult<T>[]) => any,
  ): () => void;
}

export interface ResourceDataQuery {
  _clientRef?: string | string[];
  fields?: string[];
  selector: string;
}

export interface ResourceDataResult<T> {
  query: ResourceDataQuery;
  data: T | null;
}

