require('dotenv').config();

class ServiceLinker {
  private readonly _isProdEnv: boolean;

  constructor(isProd: boolean) {
    this._isProdEnv = isProd;
  }

  get isProdEnv(): boolean {
    return this._isProdEnv;
  }

  public getClientBaseUrl() {
    return this.isProdEnv ? process.env.PROD_CLIENT_BASE_URL : process.env.CLIENT_BASE_URL;
  }

  public getSubmissionDetailsUrl(submissionId: number) {
    return this.getClientBaseUrl() + '/submissions/' + submissionId;
  }

  public getPasswordResetLink(resetToken: string) {
    return this.getClientBaseUrl() + '/reset-password/' + resetToken;
  }
}

export const ServiceLinks = new ServiceLinker(process.env.NODE_ENV === 'production');
