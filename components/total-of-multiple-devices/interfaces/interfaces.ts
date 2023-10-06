export interface ApiResponse {
  type: string;
  status: string;
  moreAfter: string | null;
  data: Agent[] | Group[];
}

export interface Agent {
  activeStatus: string;
  description: string;
  deviceId: string;
  fixedVpnAddress: null;
  loggingMqttChangedOn: null;
  macAddress: string;
  mqttChangedOn: string;
  name: string;
  networkReportedOn: string;
  networkValues: any[];
  pendingRegistration: boolean;
  preferLocationOverGeoip: boolean;
  publicId: string;
  pullCodeGeneratedOn: string;
  reRegistration: boolean;
  replaceMacAddress: string;
  replaceRegistration: boolean;
  serialNumber: string;
  timeZone: string;
  useStunnel: boolean;
  valuesPerHour: number;
  vpnProtocol: string;
  memberships: {
    publicId: string;
    group: {
      publicId: string;
    };
  }[];
  dataSources: {
    slug: string;
    publicId: string;
  }[];
}

export interface Group {
  publicId: string;
  name: string | null;
  type: {
    publicId: string;
    name: string;
    description: string | null;
    custom?: any;
  } | null;
  custom?: any;
  agent: {
    publicId: string;
    reference: {
      name: string;
    };
  } | null;
  managedBy: {
    publicId: string;
  } | null;
  isCompanyGroup: boolean;
}
