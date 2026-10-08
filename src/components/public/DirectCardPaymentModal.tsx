import React from 'react';
import { SafepayCheckoutModal, SafepayCheckoutProps } from './SafepayCheckoutModal';

export type DirectCardPaymentProps = SafepayCheckoutProps;

export const DirectCardPaymentModal: React.FC<DirectCardPaymentProps> = (props) => {
  return <SafepayCheckoutModal {...props} />;
};

export { SafepayCheckoutModal };
