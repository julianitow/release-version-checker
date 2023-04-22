export type EMAIL = {
  subject: string;
  text: string;
};

export interface INotificationService {
  sendEmail(to: string, from: string, email: EMAIL): Promise<void>;
}
