import { whileMoreAfter } from '../utils';

export class AgentDataTagService {
  constructor(context) {
    this._context = context;
  }

  getAll(agentId, fields, filters) {
    return whileMoreAfter((moreAfter) => this.getList(agentId, fields, filters, moreAfter, 500));
  }

  getList(agentId, fields, filters, pageAfter = null, pageSize = 500) {
    const url = new URL(this._context.getApiUrl('AgentDataTagList', { agentId }));
    const params = {
      ...(fields ? { fields: fields.join(',') } : {}),
      ...(filters ? { filters: filters } : {}),
      ...(pageAfter ? { 'page-after': pageAfter } : {}),
      'page-size': pageSize.toString(),
    };

    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    const headers = {
      'Api-Application': this._context.appData.apiAppId,
      'Api-Version': this._context.appData.apiVersion,
      'Api-Company': this._context.appData.company.publicId,
      Authorization: `Bearer ${this._context.appData.accessToken.secretId}`,
    };
    return fetch(url.toString(), { headers }).then((res) => res.json());
  }
}
