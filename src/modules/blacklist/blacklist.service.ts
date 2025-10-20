import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import configuration from '../../config/configuration';

interface BlacklistResponseData {
  karma_identity: string | null;
  amount_in_contention: string | null;
  reason: string | null;
  default_date: string | null;
  karma_type: {
    karma: string | null;
  };
  karma_identity_type: {
    identity_type: string | null;
  };
  reporting_entity: {
    name: string | null;
    email: string | null;
  };
}

interface BlacklistResponseMeta {
  cost: number;
  balance: number;
}

interface BlacklistResponse {
  status: string;
  message: string;
  'mock-response'?: string;
  data: BlacklistResponseData;
  meta: BlacklistResponseMeta;
}

@Injectable()
export class BlacklistService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    const config = configuration();
    this.baseUrl = config.adjutor.baseUrl;
    this.apiKey = config.adjutor.apiKey;
  }

  async checkBlacklistStatus(email: string) {
    if (!this.baseUrl || !this.apiKey) {
      throw new UnauthorizedException('Blacklist service not configured');
    }

    try {
      const { data } = await axios.get<BlacklistResponse>(
        `${this.baseUrl}/verification/karma/${email}`,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeout: 5000,
        },
      );
      return data;
    } catch {
      throw new InternalServerErrorException(
        'Unable to check blacklist status',
      );
    }
  }
}
