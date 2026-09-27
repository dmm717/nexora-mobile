export type AuthStep =
  | 'welcome'
  | 'signin'
  | 'signup'
  | 'forgot_request'
  | 'forgot_done';

export interface BaseAuthSectionProps {
  step: AuthStep;
  setStep: (step: AuthStep) => void;
  colors: any;
}
