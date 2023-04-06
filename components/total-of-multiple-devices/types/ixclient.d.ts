export interface IxClientStatus {
  activeRequest: IxClientStatusActiveRequest | '';
  status: 'idle' | 'connecting' | 'connected';
}

export interface IxClientStatusActiveRequest {
  agentId: string;
  companyId: string;
  controllerId: string;
  steps: IxClientStatusActiveRequestStep[];
}

export interface IxClientStatusActiveRequestStep {
  name: string;
  description: string;
  status: IxClientStatusActiveRequestStatus;
}

export interface IxClientStatusActiveRequestStatus {
  code: string;
  message: string;
}
